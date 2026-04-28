/**
 * Recommendation Engine — TypeScript port of the Python recommendation.py
 * Selects the best route based on buyer priority, risk-adjusted cost, urgency.
 */
import type { RouteWithCost } from "@/lib/cost-illusion-engine";

export interface RouteWithRisk extends RouteWithCost {
  transit_days: number;
  risk_assessment: {
    transit_reliability_score: number;
    delay_probability: number;
    hidden_cost: number;
    port_congestion_impact: number;
    expected_delay_days: number;
    congestion_penalty: number;
    fallback_buffer: number;
    risk_level: string;
    active_disruption: string | null;
    disrupted_nodes: string[];
  };
  route_type: string;
}

export interface RecommendationResult {
  recommended_route_type: string;
  recommended_route_id: string;
  confidence_score: number;
  explanation: string;
  cost_saving_vs_cheapest: number;
  risk_reduction_vs_cheapest: number;
}

export function generateRecommendation(
  routes: RouteWithRisk[],
  buyerPriority: string,
  urgency: string
): RecommendationResult {
  if (!routes.length) {
    return {
      recommended_route_type: "balanced",
      recommended_route_id: "",
      confidence_score: 0,
      explanation: "No routes available.",
      cost_saving_vs_cheapest: 0,
      risk_reduction_vs_cheapest: 0,
    };
  }

  const weightProfiles: Record<string, Record<string, number>> = {
    cost:    { cost: 0.55, time: 0.15, risk: 0.30 },
    speed:   { cost: 0.15, time: 0.55, risk: 0.30 },
    balance: { cost: 0.35, time: 0.30, risk: 0.35 },
  };
  const w = { ...(weightProfiles[buyerPriority] ?? weightProfiles["balance"]) };

  const urgencyBoost: Record<string, number> = { low: 0, medium: 0.05, high: 0.10, critical: 0.20 };
  w.time += urgencyBoost[urgency] ?? 0.05;
  const totalW = w.cost + w.time + w.risk;
  w.cost /= totalW; w.time /= totalW; w.risk /= totalW;

  const maxTc = Math.max(...routes.map((r) => r.true_cost)) || 1;
  const maxTd = Math.max(...routes.map((r) => r.transit_days)) || 1;

  const scored = routes.map((r) => {
    const costS = 1 - r.true_cost / maxTc;
    const timeS = 1 - r.transit_days / maxTd;
    const riskS = r.risk_assessment.transit_reliability_score / 100;
    const composite = costS * w.cost + timeS * w.time + riskS * w.risk;
    return { route: r, score: composite };
  });

  scored.sort((a, b) => b.score - a.score);
  const { route: best, score: bestScore } = scored[0];

  const confidence =
    scored.length > 1
      ? Math.min(100, 60 + (bestScore - scored[1].score) * 200)
      : 85;

  const explanation = buildExplanation(best, routes, buyerPriority, urgency);

  const cheapest = routes.reduce((a, b) => (a.landed_cost < b.landed_cost ? a : b));
  const costSaving = cheapest.route_id !== best.route_id
    ? cheapest.true_cost - best.true_cost
    : 0;
  const riskReduction = cheapest.route_id !== best.route_id
    ? best.risk_assessment.transit_reliability_score -
      cheapest.risk_assessment.transit_reliability_score
    : 0;

  return {
    recommended_route_type: best.route_type,
    recommended_route_id: best.route_id,
    confidence_score: Math.round(confidence * 10) / 10,
    explanation,
    cost_saving_vs_cheapest: Math.round(costSaving * 100) / 100,
    risk_reduction_vs_cheapest: Math.round(riskReduction * 10) / 10,
  };
}

function buildExplanation(
  best: RouteWithRisk,
  routes: RouteWithRisk[],
  priority: string,
  urgency: string
): string {
  const cheapestLanded = routes.reduce((a, b) => (a.landed_cost < b.landed_cost ? a : b));
  const parts: string[] = [];

  if (best.route_id !== cheapestLanded.route_id) {
    parts.push(
      `Although ${cheapestLanded.name} appears cheapest at ` +
      `$${cheapestLanded.landed_cost.toLocaleString("en", { maximumFractionDigits: 0 })}, its hidden risk cost of ` +
      `$${cheapestLanded.hidden_cost.toLocaleString("en", { maximumFractionDigits: 0 })} (from port congestion and ` +
      `delay probability of ${(cheapestLanded.risk_assessment.delay_probability * 100).toFixed(0)}%) ` +
      `inflates its true cost to $${cheapestLanded.true_cost.toLocaleString("en", { maximumFractionDigits: 0 })}.`
    );
    parts.push(
      `The recommended route (${best.name}) has a true cost of ` +
      `$${best.true_cost.toLocaleString("en", { maximumFractionDigits: 0 })} with ${best.risk_assessment.transit_reliability_score.toFixed(0)}% ` +
      `transit reliability — saving $${(cheapestLanded.true_cost - best.true_cost).toLocaleString("en", { maximumFractionDigits: 0 })} ` +
      `in risk-adjusted terms.`
    );
  } else {
    parts.push(
      `${best.name} is both the cheapest and lowest-risk option ` +
      `with a true cost of $${best.true_cost.toLocaleString("en", { maximumFractionDigits: 0 })} and ` +
      `${best.risk_assessment.transit_reliability_score.toFixed(0)}% reliability.`
    );
  }

  if (urgency === "high" || urgency === "critical") {
    parts.push(`Given ${urgency} urgency, time sensitivity was weighted heavily in this recommendation.`);
  }
  parts.push(`Buyer priority '${priority}' was factored into the scoring model.`);
  return parts.join(" ");
}
