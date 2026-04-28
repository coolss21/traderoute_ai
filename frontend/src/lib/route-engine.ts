/**
 * Route Engine — TypeScript port of the Python route generation logic.
 * Generates cheapest, fastest, and balanced routes with full cost and risk data.
 */
import { calculateLandedCost } from "@/lib/cost-engine";
import { computeRisk } from "@/lib/risk-engine";
import { computeTrueCost } from "@/lib/cost-illusion-engine";
import type { RouteWithRisk } from "@/lib/recommendation-engine";

// ─── Route Templates ───────────────────────────────────────────────────────────

const ROUTE_TEMPLATES = [
  {
    route_id: "sea-mumbai",
    route_type: "cheapest",
    name: "Sea via Mumbai",
    mode: "sea",
    path_template: (origin: string) => [origin, "JNPT Mumbai", "Pune"],
    transit_days: 28,
    port_name: "JNPT Mumbai",
    co2_factor: 0.012, // kg per $ of invoice
    freight_rate_per_kg: 1.2,
    min_freight: 850,
    insurance_rate: 0.005,
    terminal_handling: 320,
    domestic_transport: 180,
    warehousing_per_day: 40,
    warehousing_days: 3,
    timeline: (origin: string) => [
      { title: "Cargo Pickup", location: origin, duration_days: 2, icon: "📦" },
      { title: "Port Loading", location: `${origin} Port`, duration_days: 3, icon: "🚢" },
      { title: "Ocean Transit", location: "South China Sea → Indian Ocean", duration_days: 16, icon: "🌊" },
      { title: "Port Discharge", location: "JNPT Mumbai", duration_days: 4, icon: "⚓" },
      { title: "Customs Clearance", location: "JNPT Mumbai", duration_days: 2, icon: "🛃" },
      { title: "Delivery", location: "Pune", duration_days: 1, icon: "🏭" },
    ],
  },
  {
    route_id: "sea-chennai",
    route_type: "balanced",
    name: "Sea via Chennai",
    mode: "sea",
    path_template: (origin: string) => [origin, "Chennai Port", "Pune"],
    transit_days: 30,
    port_name: "Chennai Port",
    co2_factor: 0.011,
    freight_rate_per_kg: 1.35,
    min_freight: 920,
    insurance_rate: 0.005,
    terminal_handling: 280,
    domestic_transport: 420,
    warehousing_per_day: 38,
    warehousing_days: 3,
    timeline: (origin: string) => [
      { title: "Cargo Pickup", location: origin, duration_days: 2, icon: "📦" },
      { title: "Port Loading", location: `${origin} Port`, duration_days: 3, icon: "🚢" },
      { title: "Ocean Transit", location: "South China Sea → Bay of Bengal", duration_days: 18, icon: "🌊" },
      { title: "Port Discharge", location: "Chennai Port", duration_days: 3, icon: "⚓" },
      { title: "Customs Clearance", location: "Chennai Port", duration_days: 2, icon: "🛃" },
      { title: "Delivery to Pune", location: "Pune", duration_days: 2, icon: "🏭" },
    ],
  },
  {
    route_id: "air-delhi",
    route_type: "fastest",
    name: "Air via Delhi",
    mode: "air",
    path_template: (origin: string) => [origin, "Delhi IGI Airport", "Pune"],
    transit_days: 5,
    port_name: "Delhi IGI",
    co2_factor: 0.14, // air has much higher CO2
    freight_rate_per_kg: 6.5,
    min_freight: 2200,
    insurance_rate: 0.004,
    terminal_handling: 480,
    domestic_transport: 380,
    warehousing_per_day: 55,
    warehousing_days: 1,
    timeline: (origin: string) => [
      { title: "Cargo Pickup", location: origin, duration_days: 1, icon: "📦" },
      { title: "Air Freight Loading", location: `${origin} Airport`, duration_days: 1, icon: "✈️" },
      { title: "Air Transit", location: "China → India Airspace", duration_days: 1, icon: "🛫" },
      { title: "Customs Clearance", location: "Delhi IGI Airport", duration_days: 1, icon: "🛃" },
      { title: "Express Delivery", location: "Pune", duration_days: 1, icon: "🏭" },
    ],
  },
];

// ─── Origin mapping ─────────────────────────────────────────────────────────

function resolveOriginCity(origin: string): string {
  const o = origin.toLowerCase();
  if (o.includes("shenzhen")) return "Shenzhen";
  if (o.includes("shanghai")) return "Shanghai";
  if (o.includes("ho chi minh") || o.includes("vietnam")) return "Ho Chi Minh City";
  if (o.includes("china")) return "Shenzhen"; // default China city
  return origin;
}

// ─── Route Generation ───────────────────────────────────────────────────────

export interface GenerateRoutesParams {
  origin: string;
  destination: string;
  hsnCode: string;
  quantity: number;
  invoiceValue: number;
  urgency: string;
  buyerPriority?: string;
  simulateDisruption?: string | null;
}

export function generateRoutes(params: GenerateRoutesParams): RouteWithRisk[] {
  const {
    origin, hsnCode, quantity, invoiceValue, urgency, simulateDisruption,
  } = params;

  const originCity = resolveOriginCity(origin);

  return ROUTE_TEMPLATES.map((template) => {
    const path = template.path_template(originCity);
    const timeline = template.timeline(originCity);

    const routeParams = {
      freight_rate_per_kg: template.freight_rate_per_kg,
      min_freight: template.min_freight,
      insurance_rate: template.insurance_rate,
      terminal_handling: template.terminal_handling,
      domestic_transport: template.domestic_transport,
      warehousing_per_day: template.warehousing_per_day,
      warehousing_days: template.warehousing_days,
    };

    const costBreakdown = calculateLandedCost(
      invoiceValue, quantity, hsnCode, routeParams
    );

    const riskAssessment = computeRisk(
      origin,
      template.port_name,
      template.mode,
      template.transit_days,
      invoiceValue,
      urgency,
      simulateDisruption,
      path
    );

    const trueCost = computeTrueCost(
      costBreakdown.total_landed_cost,
      riskAssessment.hidden_cost
    );

    const co2EmissionsKg = Math.round(invoiceValue * template.co2_factor * 10) / 10;

    return {
      route_id: template.route_id,
      route_type: template.route_type,
      name: template.name,
      path,
      mode: template.mode,
      transit_days: template.transit_days,
      cost_breakdown: costBreakdown,
      risk_assessment: riskAssessment,
      landed_cost: costBreakdown.total_landed_cost,
      hidden_cost: riskAssessment.hidden_cost,
      true_cost: trueCost,
      co2_emissions_kg: co2EmissionsKg,
      is_greenest: false,
      is_recommended: false,
      is_cost_illusion: false,
      cost_illusion_warning: null,
      timeline,
    } as RouteWithRisk;
  });
}
