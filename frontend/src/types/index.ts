export interface CostBreakdown {
  supplier_invoice: number;
  customs_duty_bcd: number;
  igst: number;
  surcharge_cess: number;
  freight_cost: number;
  insurance: number;
  terminal_handling: number;
  domestic_transport: number;
  warehousing: number;
  total_landed_cost: number;
}

export interface RiskAssessment {
  transit_reliability_score: number;
  port_congestion_impact: number;
  delay_probability: number;
  expected_delay_days: number;
  congestion_penalty: number;
  fallback_buffer: number;
  hidden_cost: number;
  risk_level: string;
  active_disruption?: string | null;
  disrupted_nodes?: string[];
}

export interface TimelineStep {
  title: string;
  location: string;
  duration_days: number;
  icon: string;
}

export interface Route {
  route_type: string;
  path: string[];
  mode: string;
  transit_days: number;
  cost_breakdown: CostBreakdown;
  risk_assessment: RiskAssessment;
  true_cost: number;
  is_recommended: boolean;
  is_cost_illusion: boolean;
  cost_illusion_warning: string | null;
  co2_emissions_kg: number;
  is_greenest: boolean;
  timeline: TimelineStep[];
}

export interface Recommendation {
  recommended_route_type: string;
  confidence_score: number;
  explanation: string;
  cost_saving_vs_cheapest: number | null;
  risk_reduction_vs_cheapest: number | null;
}

export interface BusinessImpact {
  potential_savings: number;
  risk_reduction_pct: number;
  decision_confidence: string;
  audit_trail: string[];
}

export interface AnalyzeResponse {
  hsn_code: string;
  origin: string;
  destination: string;
  quantity: number;
  invoice_value: number;
  routes: Route[];
  recommendation: Recommendation;
  business_impact: BusinessImpact;
}
