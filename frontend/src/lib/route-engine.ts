/**
 * Route Engine — TypeScript port of the Python route generation logic.
 * Generates cheapest, fastest, and balanced routes with full cost and risk data.
 */
import { calculateLandedCost } from "@/lib/cost-engine";
import { computeRisk } from "@/lib/risk-engine";
import { computeTrueCost } from "@/lib/cost-illusion-engine";
import type { RouteWithRisk } from "@/lib/recommendation-engine";

// ─── Origin Region Classification ─────────────────────────────────────────────

type OriginRegion = "china" | "southeast_asia" | "europe" | "usa" | "middle_east" | "japan_korea";

function resolveOriginCity(origin: string): string {
  const o = origin.toLowerCase();
  if (o.includes("global") || o.includes("auto-detect") || o.includes("auto detect")) return "Shenzhen";
  if (o.includes("shenzhen")) return "Shenzhen";
  if (o.includes("shanghai")) return "Shanghai";
  if (o.includes("guangzhou")) return "Guangzhou";
  if (o.includes("china")) return "Shenzhen";
  if (o.includes("ho chi minh") || o.includes("vietnam")) return "Ho Chi Minh City";
  if (o.includes("bangkok") || o.includes("thailand")) return "Bangkok";
  if (o.includes("singapore")) return "Singapore";
  if (o.includes("japan") || o.includes("tokyo")) return "Tokyo";
  if (o.includes("korea") || o.includes("seoul")) return "Seoul";
  if (o.includes("hamburg") || o.includes("germany")) return "Hamburg";
  if (o.includes("rotterdam") || o.includes("netherlands")) return "Rotterdam";
  if (o.includes("dubai") || o.includes("uae")) return "Dubai";
  if (o.includes("los angeles") || o.includes("usa")) return "Los Angeles";
  return origin;
}

function getOriginRegion(originCity: string): OriginRegion {
  const china = ["Shenzhen", "Shanghai", "Guangzhou", "Ningbo"];
  const sea = ["Ho Chi Minh City", "Bangkok", "Singapore"];
  const europe = ["Hamburg", "Rotterdam", "London"];
  const usa = ["Los Angeles", "New York"];
  const middleEast = ["Dubai", "Abu Dhabi"];
  const japanKorea = ["Tokyo", "Seoul"];

  if (china.includes(originCity)) return "china";
  if (sea.includes(originCity)) return "southeast_asia";
  if (europe.includes(originCity)) return "europe";
  if (usa.includes(originCity)) return "usa";
  if (middleEast.includes(originCity)) return "middle_east";
  if (japanKorea.includes(originCity)) return "japan_korea";
  return "china"; // fallback
}

// ─── Waypoint resolution by region ───────────────────────────────────────────

function getSeaMumbaiPath(originCity: string, dest: string): string[] {
  const region = getOriginRegion(originCity);
  switch (region) {
    case "europe":
      return [originCity, "Suez Canal", "Strait of Hormuz", "JNPT Mumbai", dest];
    case "usa":
      return [originCity, "Pacific Ocean", "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", dest];
    case "middle_east":
      return [originCity, "Strait of Hormuz", "JNPT Mumbai", dest];
    case "japan_korea":
      return [originCity, "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", dest];
    default: // china, southeast_asia
      return [originCity, "Malacca Strait", "Strait of Hormuz", "JNPT Mumbai", dest];
  }
}

function getSeaChennaiPath(originCity: string, dest: string): string[] {
  const region = getOriginRegion(originCity);
  switch (region) {
    case "europe":
      return [originCity, "Suez Canal", "Bay of Bengal", "Chennai Port", dest];
    case "usa":
      return [originCity, "Pacific Ocean", "Malacca Strait", "Bay of Bengal", "Chennai Port", dest];
    case "middle_east":
      return [originCity, "Strait of Hormuz", "Bay of Bengal", "Chennai Port", dest];
    case "japan_korea":
      return [originCity, "Malacca Strait", "Bay of Bengal", "Chennai Port", dest];
    default: // china, southeast_asia
      return [originCity, "Malacca Strait", "Bay of Bengal", "Chennai Port", dest];
  }
}

function getAirPath(originCity: string, dest: string): string[] {
  // Air goes direct origin → Delhi IGI Airport → dest
  if (dest === "Delhi") return [originCity, "Delhi IGI Airport"];
  return [originCity, "Delhi IGI Airport", dest];
}

function getSeaMumbaiTimeline(originCity: string, dest: string) {
  return [
    { title: "Cargo Pickup", location: originCity, duration_days: 2, icon: "📦" },
    { title: "Port Loading", location: `${originCity} Port`, duration_days: 3, icon: "🚢" },
    { title: "Ocean Transit", location: "International Shipping Lane", duration_days: 16, icon: "🌊" },
    { title: "Port Discharge", location: "JNPT Mumbai", duration_days: 4, icon: "⚓" },
    { title: "Customs Clearance", location: "JNPT Mumbai", duration_days: 2, icon: "🛃" },
    { title: "Delivery", location: dest, duration_days: 1, icon: "🏭" },
  ];
}

function getSeaChennaiTimeline(originCity: string, dest: string) {
  return [
    { title: "Cargo Pickup", location: originCity, duration_days: 2, icon: "📦" },
    { title: "Port Loading", location: `${originCity} Port`, duration_days: 3, icon: "🚢" },
    { title: "Ocean Transit", location: "International Shipping Lane", duration_days: 18, icon: "🌊" },
    { title: "Port Discharge", location: "Chennai Port", duration_days: 3, icon: "⚓" },
    { title: "Customs Clearance", location: "Chennai Port", duration_days: 2, icon: "🛃" },
    { title: "Delivery", location: dest, duration_days: 2, icon: "🏭" },
  ];
}

function getAirTimeline(originCity: string, dest: string) {
  return [
    { title: "Cargo Pickup", location: originCity, duration_days: 1, icon: "📦" },
    { title: "Air Freight Loading", location: `${originCity} Airport`, duration_days: 1, icon: "✈️" },
    { title: "Air Transit", location: "International Airspace", duration_days: 1, icon: "🛫" },
    { title: "Customs Clearance", location: "Delhi IGI Airport", duration_days: 1, icon: "🛃" },
    { title: "Express Delivery", location: dest, duration_days: 1, icon: "🏭" },
  ];
}

// ─── Route Cost Templates ─────────────────────────────────────────────────────

const ROUTE_TEMPLATES = [
  {
    route_id: "sea-mumbai",
    route_type: "cheapest",
    name: "Sea via Mumbai",
    mode: "sea",
    transit_days: 28,
    port_name: "JNPT Mumbai",
    co2_factor: 0.012,
    freight_rate_per_kg: 1.2,
    min_freight: 850,
    insurance_rate: 0.005,
    terminal_handling: 320,
    domestic_transport: 180,
    warehousing_per_day: 40,
    warehousing_days: 3,
  },
  {
    route_id: "sea-chennai",
    route_type: "balanced",
    name: "Sea via Chennai",
    mode: "sea",
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
  },
  {
    route_id: "air-delhi",
    route_type: "fastest",
    name: "Air via Delhi",
    mode: "air",
    transit_days: 5,
    port_name: "Delhi IGI",
    co2_factor: 0.14,
    freight_rate_per_kg: 6.5,
    min_freight: 2200,
    insurance_rate: 0.004,
    terminal_handling: 480,
    domestic_transport: 380,
    warehousing_per_day: 55,
    warehousing_days: 1,
  },
];

// ─── Route Generation ─────────────────────────────────────────────────────────

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
  const { origin, destination, hsnCode, quantity, invoiceValue, urgency, simulateDisruption } = params;

  const originCity = resolveOriginCity(origin);

  return ROUTE_TEMPLATES.map((template) => {
    // Build path and timeline dynamically based on origin region
    let path: string[];
    let timeline: { title: string; location: string; duration_days: number; icon: string }[];

    if (template.route_id === "sea-mumbai") {
      path = getSeaMumbaiPath(originCity, destination);
      timeline = getSeaMumbaiTimeline(originCity, destination);
    } else if (template.route_id === "sea-chennai") {
      path = getSeaChennaiPath(originCity, destination);
      timeline = getSeaChennaiTimeline(originCity, destination);
    } else {
      path = getAirPath(originCity, destination);
      timeline = getAirTimeline(originCity, destination);
    }

    const routeParams = {
      freight_rate_per_kg: template.freight_rate_per_kg,
      min_freight: template.min_freight,
      insurance_rate: template.insurance_rate,
      terminal_handling: template.terminal_handling,
      domestic_transport: template.domestic_transport,
      warehousing_per_day: template.warehousing_per_day,
      warehousing_days: template.warehousing_days,
    };

    const costBreakdown = calculateLandedCost(invoiceValue, quantity, hsnCode, routeParams);

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

    const trueCost = computeTrueCost(costBreakdown.total_landed_cost, riskAssessment.hidden_cost);
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
