/**
 * POST /api/analyze
 * Full analysis pipeline — all logic runs server-side in Next.js.
 * Saves result to Firestore (best-effort, non-blocking).
 */
import { NextRequest, NextResponse } from "next/server";
import { generateRoutes } from "@/lib/route-engine";
import { detectCostIllusion } from "@/lib/cost-illusion-engine";
import { generateRecommendation } from "@/lib/recommendation-engine";
import type { RouteWithRisk } from "@/lib/recommendation-engine";

// Firestore import is dynamic so the build doesn't fail if env vars are absent
async function saveToFirestore(payload: Record<string, unknown>) {
  try {
    const { db } = await import("@/lib/firebase");
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, "analysis_runs"), {
      ...payload,
      created_at: serverTimestamp(),
    });
  } catch {
    // Non-critical — Firestore save failures never block the response
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hsn_code,
      origin,
      destination,
      quantity,
      invoice_value,
      urgency = "medium",
      buyer_priority = "balance",
      simulate_disruption = null,
    } = body;

    if (!hsn_code || !origin || !destination || !quantity || !invoice_value) {
      return NextResponse.json(
        { detail: "Missing required fields: hsn_code, origin, destination, quantity, invoice_value" },
        { status: 422 }
      );
    }

    // 1. Generate all routes with full cost + risk data
    let routes = generateRoutes({
      origin,
      destination,
      hsnCode: hsn_code,
      quantity: Number(quantity),
      invoiceValue: Number(invoice_value),
      urgency,
      buyerPriority: buyer_priority,
      simulateDisruption: simulate_disruption,
    }) as RouteWithRisk[];

    // 2. Cost Illusion Detection
    routes = detectCostIllusion(routes) as RouteWithRisk[];

    // 3. Recommendation Engine
    const recData = generateRecommendation(routes, buyer_priority, urgency);

    // 4. Mark recommended + greenest route
    const minCo2 = Math.min(...routes.map((r) => (r as unknown as { co2_emissions_kg: number }).co2_emissions_kg ?? 999999));
    routes = routes.map((r) => ({
      ...r,
      is_recommended: r.route_id === recData.recommended_route_id,
      is_greenest: ((r as unknown as { co2_emissions_kg: number }).co2_emissions_kg ?? 999999) === minCo2,
    }));

    // 5. Business Impact
    const illusions = routes.filter((r) => r.is_cost_illusion);
    const recommended = routes.find((r) => r.is_recommended) ?? routes[0];
    const potentialSavings =
      illusions.length > 0
        ? Math.max(0, Math.min(...illusions.map((r) => r.true_cost)) - recommended.true_cost)
        : 0;

    const businessImpact = {
      potential_savings: Math.round(potentialSavings * 100) / 100,
      risk_reduction_pct: Math.round((recData.risk_reduction_vs_cheapest ?? 0) * 10) / 10,
      decision_confidence: `${recData.confidence_score}%`,
      audit_trail: [
        `HSN ${hsn_code} tariff rates applied (BCD + IGST + SWS)`,
        `${routes.length} routes evaluated: ${routes.map((r) => r.mode).join(", ")}`,
        `Risk signals from ${new Set(routes.map((r) => r.path[r.path.length - 2])).size} ports analyzed`,
        `Cost illusion detection: ${illusions.length} route(s) flagged`,
        `Recommendation engine: priority=${buyer_priority}, urgency=${urgency}`,
      ],
    };

    // 6. AI insights (deterministic, rule-based)
    const aiInsights = generateAiInsights(routes, recData, urgency, buyer_priority);

    // 7. Build final response (strip internal-only fields)
    const responseRoutes = routes.map((r) => ({
      route_type: r.route_type,
      path: r.path,
      mode: r.mode,
      transit_days: r.transit_days,
      cost_breakdown: r.cost_breakdown,
      risk_assessment: r.risk_assessment,
      true_cost: r.true_cost,
      is_recommended: r.is_recommended,
      is_cost_illusion: r.is_cost_illusion,
      cost_illusion_warning: r.cost_illusion_warning,
      co2_emissions_kg: (r as unknown as { co2_emissions_kg: number }).co2_emissions_kg ?? 0,
      is_greenest: (r as unknown as { is_greenest: boolean }).is_greenest ?? false,
      timeline: (r as unknown as { timeline: unknown[] }).timeline ?? [],
    }));

    const response = {
      hsn_code,
      origin,
      destination,
      quantity: Number(quantity),
      invoice_value: Number(invoice_value),
      routes: responseRoutes,
      recommendation: {
        recommended_route_type: recData.recommended_route_type,
        confidence_score: recData.confidence_score,
        explanation: recData.explanation,
        cost_saving_vs_cheapest: recData.cost_saving_vs_cheapest,
        risk_reduction_vs_cheapest: recData.risk_reduction_vs_cheapest,
      },
      business_impact: businessImpact,
      ai_insights: aiInsights,
    };

    // Non-blocking Firestore save
    saveToFirestore({ ...response, urgency, buyer_priority });

    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/analyze]", err);
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function generateAiInsights(
  routes: RouteWithRisk[],
  rec: ReturnType<typeof generateRecommendation>,
  urgency: string,
  priority: string
): string {
  const illusions = routes.filter((r) => r.is_cost_illusion);
  const recommended = routes.find((r) => r.route_id === rec.recommended_route_id);
  const insights: string[] = [];

  if (illusions.length > 0) {
    insights.push(
      `🧠 Cost Illusion Alert: ${illusions.length} of ${routes.length} routes have misleadingly low base prices. ` +
      `Hidden risk costs inflate true costs by up to $${Math.max(...illusions.map((r) => r.risk_assessment.hidden_cost)).toLocaleString()}.`
    );
  }

  if (recommended) {
    insights.push(
      `✅ AI Recommendation: "${recommended.name}" achieves the optimal balance of ` +
      `${recommended.risk_assessment.transit_reliability_score.toFixed(0)}% reliability ` +
      `at a true cost of $${recommended.true_cost.toLocaleString()}.`
    );
  }

  if (urgency === "high" || urgency === "critical") {
    insights.push(
      `⚡ Urgency Mode: ${urgency.toUpperCase()} urgency detected. ` +
      `Transit time scored 2x heavier than cost in the recommendation model.`
    );
  }

  const highRisk = routes.filter((r) => ["high", "critical"].includes(r.risk_assessment.risk_level));
  if (highRisk.length > 0) {
    insights.push(
      `⚠️ Risk Alert: ${highRisk.map((r) => r.name).join(", ")} show HIGH/CRITICAL risk profiles. ` +
      `Consider hedging with advance stock or dual-sourcing.`
    );
  }

  return insights.join(" | ");
}
