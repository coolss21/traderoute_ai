export interface PortCongestionInfo {
  congestion_level: string;
  congestion_score: number;
  avg_delay_days: number;
  vessel_queue_days: number;
  customs_clearance_delay: number;
  peak_season_multiplier: number;
  notes: string;
}

export interface TransitReliabilityInfo {
  on_time_pct: number;
  avg_deviation_days: number;
  weather_risk: string;
  piracy_risk: string;
  geopolitical_risk: string;
}

export const PORT_CONGESTION: Record<string, PortCongestionInfo> = {
  "JNPT Mumbai": {
    congestion_level: "high",
    congestion_score: 0.78,
    avg_delay_days: 4.5,
    vessel_queue_days: 2.1,
    customs_clearance_delay: 1.8,
    peak_season_multiplier: 1.4,
    notes: "India's busiest container port – frequent berthing delays, customs bottleneck during Q4",
  },
  "Chennai Port": {
    congestion_level: "low",
    congestion_score: 0.25,
    avg_delay_days: 1.2,
    vessel_queue_days: 0.5,
    customs_clearance_delay: 0.6,
    peak_season_multiplier: 1.1,
    notes: "Well-managed port with lower traffic, efficient DPD clearance",
  },
  "Delhi IGI": {
    congestion_level: "medium",
    congestion_score: 0.40,
    avg_delay_days: 1.0,
    vessel_queue_days: 0,
    customs_clearance_delay: 0.8,
    peak_season_multiplier: 1.2,
    notes: "Air cargo – faster but capacity constraints during festive season",
  },
  Mundra: {
    congestion_level: "low",
    congestion_score: 0.20,
    avg_delay_days: 0.8,
    vessel_queue_days: 0.3,
    customs_clearance_delay: 0.5,
    peak_season_multiplier: 1.05,
    notes: "Adani-operated private port, highly efficient",
  },
  "Mumbai Airport": {
    congestion_level: "medium",
    congestion_score: 0.35,
    avg_delay_days: 0.7,
    vessel_queue_days: 0,
    customs_clearance_delay: 0.5,
    peak_season_multiplier: 1.15,
    notes: "Air cargo hub, generally reliable",
  },
};

export const TRANSIT_RELIABILITY: Record<string, Record<string, TransitReliabilityInfo>> = {
  sea: {
    "China-India": { on_time_pct: 62, avg_deviation_days: 3.2, weather_risk: "moderate", piracy_risk: "low", geopolitical_risk: "moderate" },
    "Vietnam-India": { on_time_pct: 71, avg_deviation_days: 2.1, weather_risk: "moderate", piracy_risk: "low", geopolitical_risk: "low" },
  },
  air: {
    "China-India": { on_time_pct: 88, avg_deviation_days: 0.5, weather_risk: "low", piracy_risk: "none", geopolitical_risk: "low" },
    "Vietnam-India": { on_time_pct: 91, avg_deviation_days: 0.3, weather_risk: "low", piracy_risk: "none", geopolitical_risk: "low" },
  },
};

export const BUSINESS_IMPACT_PER_DAY: Record<string, number> = {
  low: 50,
  medium: 150,
  high: 350,
  critical: 800,
};
