/**
 * Route Engine — Prototype Version
 * Optimized for the 6 core presets with perfect waypoint mapping.
 */
import { calculateLandedCost } from "@/lib/cost-engine";
import { computeRisk } from "@/lib/risk-engine";
import { computeTrueCost } from "@/lib/cost-illusion-engine";
import type { RouteWithRisk } from "@/lib/recommendation-engine";

// ─── Perfect Path Definitions ───────────────────────────────────────────────

const GOLD_PATHS: Record<string, Record<string, string[]>> = {
  "China": {
    "Pune": ["Shenzhen", "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", "Pune"],
    "Delhi": ["Shenzhen", "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", "Delhi"],
  },
  "Shanghai": {
    "Delhi": ["Shanghai", "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", "Delhi"],
  },
  "Vietnam": {
    "Mumbai": ["Ho Chi Minh City", "Malacca Strait", "Bay of Bengal", "Chennai Port", "Mumbai"],
  },
  "Germany": {
    "Delhi": ["Hamburg", "Suez Canal", "Strait of Hormuz", "JNPT Mumbai", "Delhi"],
  },
  "Dubai": {
    "Pune": ["Dubai", "Strait of Hormuz", "JNPT Mumbai", "Pune"],
  },
  "Los Angeles": {
    "Mumbai": ["Los Angeles", "Pacific Ocean", "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", "Mumbai"],
  },
  "Global Auto-Detect": {
    "Delhi": ["Shenzhen", "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", "Delhi"],
  }
};

const AIR_PATHS: Record<string, Record<string, string[]>> = {
  "China": { "Pune": ["Shenzhen", "Delhi IGI Airport", "Pune"], "Delhi": ["Shenzhen", "Delhi IGI Airport"] },
  "Shanghai": { "Delhi": ["Shanghai", "Delhi IGI Airport"] },
  "Vietnam": { "Mumbai": ["Ho Chi Minh City", "Delhi IGI Airport", "Mumbai"] },
  "Germany": { "Delhi": ["Hamburg", "Delhi IGI Airport"] },
  "Dubai": { "Pune": ["Dubai", "Delhi IGI Airport", "Pune"] },
  "Los Angeles": { "Mumbai": ["Los Angeles", "Delhi IGI Airport", "Mumbai"] },
  "Global Auto-Detect": { "Delhi": ["Shenzhen", "Delhi IGI Airport"] }
};

// ─── Route Generation ───────────────────────────────────────────────────────

const ROUTE_TEMPLATES = [
  { id: "sea-mumbai", type: "cheapest", name: "Sea via Mumbai", mode: "sea", days: 28, port: "JNPT Mumbai", co2: 0.012, rate: 1.2, min: 850, ins: 0.005, thc: 320, dom: 180 },
  { id: "sea-chennai", type: "balanced", name: "Sea via Chennai", mode: "sea", days: 30, port: "Chennai Port", co2: 0.011, rate: 1.35, min: 920, ins: 0.005, thc: 280, dom: 420 },
  { id: "air-delhi", type: "fastest", name: "Air via Delhi", mode: "air", days: 5, port: "Delhi IGI", co2: 0.14, rate: 6.5, min: 2200, ins: 0.004, thc: 480, dom: 380 },
];

export function generateRoutes(params: any): RouteWithRisk[] {
  const { origin, destination, hsnCode, quantity, invoiceValue, urgency, simulateDisruption } = params;

  return ROUTE_TEMPLATES.map((t) => {
    // Get the hardcoded path or fallback to a simple [origin, dest]
    let path = (t.mode === "air") 
      ? (AIR_PATHS[origin]?.[destination] || [origin, destination])
      : (GOLD_PATHS[origin]?.[destination] || [origin, "Malacca Strait", destination]);

    const costBreakdown = calculateLandedCost(invoiceValue, quantity, hsnCode, {
      freight_rate_per_kg: t.rate,
      min_freight: t.min,
      insurance_rate: t.ins,
      terminal_handling: t.thc,
      domestic_transport: t.dom,
      warehousing_per_day: 40,
      warehousing_days: 3
    });

    const riskAssessment = computeRisk(origin, t.port, t.mode, t.days, invoiceValue, urgency, simulateDisruption, path);
    const trueCost = computeTrueCost(costBreakdown.total_landed_cost, riskAssessment.hidden_cost);

    return {
      route_id: t.id,
      route_type: t.type,
      name: t.name,
      path,
      mode: t.mode,
      transit_days: t.days,
      cost_breakdown: costBreakdown,
      risk_assessment: riskAssessment,
      landed_cost: costBreakdown.total_landed_cost,
      hidden_cost: riskAssessment.hidden_cost,
      true_cost: trueCost,
      co2_emissions_kg: Math.round(invoiceValue * t.co2),
      timeline: [] // Simplified for prototype
    } as RouteWithRisk;
  });
}
