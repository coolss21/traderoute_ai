/**
 * Risk Engine — TypeScript port of the Python risk.py
 * Computes transit reliability, delay probability, port congestion impact,
 * hidden cost formula, and disruption simulation.
 */
import {
  PORT_CONGESTION,
  TRANSIT_RELIABILITY,
  BUSINESS_IMPACT_PER_DAY,
} from "@/lib/data/risk-signals";

export interface RiskAssessment {
  transit_reliability_score: number;
  port_congestion_impact: number;
  delay_probability: number;
  expected_delay_days: number;
  congestion_penalty: number;
  fallback_buffer: number;
  hidden_cost: number;
  risk_level: string;
  active_disruption: string | null;
  disrupted_nodes: string[];
}

function resolveOriginKey(origin: string): string {
  const o = origin.toLowerCase();
  if (o.includes("china") || o.includes("shenzhen") || o.includes("shanghai")) return "China-India";
  if (o.includes("vietnam") || o.includes("ho chi minh")) return "Vietnam-India";
  return "China-India";
}

function computeFallbackBuffer(delayProbability: number, invoiceValue: number): number {
  const riskFactor = Math.pow(delayProbability, 0.8);
  return invoiceValue * riskFactor * 0.015;
}

function classifyRisk(
  delayProbability: number,
  congestionScore: number,
  expectedDelayDays: number
): string {
  const composite =
    delayProbability * 0.4 +
    congestionScore * 0.35 +
    Math.min(expectedDelayDays / 10, 1) * 0.25;
  if (composite >= 0.65) return "critical";
  if (composite >= 0.45) return "high";
  if (composite >= 0.25) return "medium";
  return "low";
}

export function computeRisk(
  origin: string,
  portName: string,
  mode: string,
  transitDays: number,
  invoiceValue: number,
  urgency: string,
  simulateDisruption?: string | null,
  routePath?: string[]
): RiskAssessment {
  // Port congestion
  const portInfo = PORT_CONGESTION[portName] ?? {
    congestion_score: 0.3,
    avg_delay_days: 1.5,
    peak_season_multiplier: 1.1,
  };

  let congestionScore = portInfo.congestion_score;
  let avgDelay = portInfo.avg_delay_days;
  const peakMult = portInfo.peak_season_multiplier;

  // Transit reliability
  const originKey = resolveOriginKey(origin);
  const modeKey = mode === "air" ? "air" : "sea";
  const reliabilityData =
    TRANSIT_RELIABILITY[modeKey]?.[originKey] ?? { on_time_pct: 75, avg_deviation_days: 2.0 };

  let onTimePct = reliabilityData.on_time_pct;
  let avgDeviation = reliabilityData.avg_deviation_days;

  let activeDisruption: string | null = null;
  let disruptedNodes: string[] = [];

  const nodesToCheck = routePath ?? [origin, portName];
  const combined = nodesToCheck.map((n) => String(n).toLowerCase()).join(" ");

  if (simulateDisruption === "typhoon") {
    const typhoonZones: Record<string, string> = {
      china: "China", vietnam: "Vietnam", taiwan: "Taiwan",
      "south korea": "South Korea", shenzhen: "Shenzhen Port",
      shanghai: "Shanghai Port", "hong kong": "Hong Kong",
      guangzhou: "Guangzhou Port", ningbo: "Ningbo Port",
    };
    const hits = Object.entries(typhoonZones)
      .filter(([key]) => combined.includes(key))
      .map(([, label]) => label);
    if (hits.length) {
      activeDisruption =
        "Typhoon in South China Sea — severe port congestion, vessel diversions, and airspace restrictions across East & Southeast Asia";
      disruptedNodes = Array.from(new Set(hits));
      congestionScore = 0.95;
      avgDelay += 12.0;
      onTimePct = Math.min(onTimePct, 15.0);
      avgDeviation += 8.0;
    }
  } else if (simulateDisruption === "war") {
    const warZones: Record<string, string> = {
      turkey: "Turkey", istanbul: "Istanbul Port",
      germany: "Germany", hamburg: "Hamburg Port",
      usa: "USA", "los angeles": "Los Angeles Port",
      "new york": "New York Port", "jebel ali": "Jebel Ali (Dubai)",
      hormuz: "Strait of Hormuz", suez: "Suez Canal",
    };
    const hits = Object.entries(warZones)
      .filter(([key]) => combined.includes(key))
      .map(([, label]) => label);
    if (hits.length) {
      activeDisruption =
        "USA-Iran Conflict — Strait of Hormuz closure, Middle East airspace restrictions, NATO-allied port security escalation";
      disruptedNodes = Array.from(new Set(hits));
      congestionScore = 0.98;
      avgDelay += 18.0;
      onTimePct = Math.min(onTimePct, 5.0);
      avgDeviation += 14.0;
    }
  }

  // Delay probability
  const baseDelayProb = 1.0 - onTimePct / 100;
  const delayProbability = Math.min(1.0, baseDelayProb + congestionScore * 0.3);

  // Expected delay days
  const expectedDelayDays = (avgDelay * peakMult + avgDeviation) * delayProbability;

  // Business impact per day
  const bizImpact = BUSINESS_IMPACT_PER_DAY[urgency] ?? 150;

  // Hidden cost formula
  const congestionPenalty = congestionScore * invoiceValue * 0.02;
  const fallbackBuffer = computeFallbackBuffer(delayProbability, invoiceValue);
  const hiddenCost =
    delayProbability * expectedDelayDays * bizImpact + congestionPenalty + fallbackBuffer;

  // Reliability score 0-100
  const transitReliabilityScore = Math.max(
    0,
    Math.min(
      100,
      onTimePct * 0.5 + (1 - congestionScore) * 100 * 0.3 + (1 - delayProbability) * 100 * 0.2
    )
  );

  const riskLevel = classifyRisk(delayProbability, congestionScore, expectedDelayDays);

  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    transit_reliability_score: Math.round(transitReliabilityScore * 10) / 10,
    port_congestion_impact: r2(congestionScore),
    delay_probability: r2(delayProbability),
    expected_delay_days: Math.round(expectedDelayDays * 10) / 10,
    congestion_penalty: r2(congestionPenalty),
    fallback_buffer: r2(fallbackBuffer),
    hidden_cost: r2(hiddenCost),
    risk_level: riskLevel,
    active_disruption: activeDisruption,
    disrupted_nodes: disruptedNodes,
  };
}
