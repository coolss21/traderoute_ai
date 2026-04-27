"use client";

import { useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid,
} from "recharts";
import type { Route } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props { routes: Route[] }

const ROUTE_COLORS: Record<string, string> = {
  cheapest: "#3390ff",
  fastest:  "#f59e0b",
  balanced: "#4ade80",
  china: "#ef4444",
  vietnam: "#eab308",
  germany: "#22c55e",
  usa: "#3b82f6",
  turkey: "#10b981",
  bangladesh: "#0ea5e9",
  "south korea": "#6366f1",
  taiwan: "#ec4899",
};

const ROUTE_LABELS: Record<string, string> = {
  cheapest: "Cheapest",
  fastest:  "Fastest",
  balanced: "Balanced",
  china: "China",
  vietnam: "Vietnam",
  germany: "Germany",
  usa: "USA",
  turkey: "Turkey",
  bangladesh: "Bangladesh",
  "south korea": "S. Korea",
  taiwan: "Taiwan",
};

const ROUTE_ICONS: Record<string, string> = {
  cheapest: "💰",
  fastest:  "⚡",
  balanced: "⚖️",
  china: "🇨🇳",
  vietnam: "🇻🇳",
  germany: "🇩🇪",
  usa: "🇺🇸",
  turkey: "🇹🇷",
  bangladesh: "🇧🇩",
  "south korea": "🇰🇷",
  taiwan: "🇹🇼",
};

/* Normalise a value 0-100 where higher = better */
function normalise(value: number, min: number, max: number, invert = false) {
  if (max === min) return 50;
  const pct = ((value - min) / (max - min)) * 100;
  return invert ? 100 - pct : pct;
}

/* Custom radar tooltip */
function RadarTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-xs border border-white/10 min-w-[140px]">
      <p className="font-bold text-white/80 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-white/60">{p.name}</span>
          </span>
          <span className="font-mono font-bold text-white">{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* Custom bar tooltip */
function BarTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-xs border border-white/10">
      <p className="font-bold text-white/80 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
            <span className="text-white/60">{p.name}</span>
          </span>
          <span className="font-mono text-white">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* Row in the detail breakdown table */
function DetailRow({
  label, values, highlight = false, isBetter = "lower",
}: {
  label: string;
  values: number[];
  highlight?: boolean;
  isBetter?: "lower" | "higher";
}) {
  const best = isBetter === "lower" ? Math.min(...values) : Math.max(...values);
  return (
    <tr className={`border-b border-white/[0.04] ${highlight ? "bg-white/[0.02]" : ""}`}>
      <td className="px-5 py-3 text-xs text-white/50 font-medium">{label}</td>
      {values.map((v, i) => {
        const isBest = v === best;
        return (
          <td key={i} className="px-5 py-3 text-right">
            <span className={`font-mono text-sm font-semibold ${isBest ? "text-success-400" : "text-white/70"}`}>
              ${v.toLocaleString()}
              {isBest && <span className="ml-1 text-[9px] text-success-400/60">↓best</span>}
            </span>
          </td>
        );
      })}
    </tr>
  );
}

export default function RouteComparison({ routes }: Props) {
  const [tab, setTab] = useState<"radar" | "breakdown" | "metrics">("radar");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(routes.map((r) => r.route_type))
  );

  const visibleRoutes = routes.filter((r) => selected.has(r.route_type));

  /* Build radar data — 5 dimensions, each 0–100 (higher = better) */
  const allTrueCosts = routes.map((r) => r.true_cost);
  const allHiddenCosts = routes.map((r) => r.risk_assessment.hidden_cost);
  const allDays = routes.map((r) => r.transit_days);
  const allReliability = routes.map((r) => r.risk_assessment.transit_reliability_score);
  const allDelayProb = routes.map((r) => r.risk_assessment.delay_probability);

  const radarData = [
    { dim: "Cost Efficiency",   key: "cost" },
    { dim: "Transit Speed",     key: "speed" },
    { dim: "Reliability",       key: "reliability" },
    { dim: "Risk Protection",   key: "risk" },
    { dim: "Transparency",      key: "transparency" },
  ].map(({ dim, key }) => {
    const row: Record<string, number | string> = { dim };
    routes.forEach((r) => {
      if (key === "cost")
        row[r.route_type] = normalise(r.true_cost, Math.min(...allTrueCosts), Math.max(...allTrueCosts), true);
      else if (key === "speed")
        row[r.route_type] = normalise(r.transit_days, Math.min(...allDays), Math.max(...allDays), true);
      else if (key === "reliability")
        row[r.route_type] = normalise(r.risk_assessment.transit_reliability_score, Math.min(...allReliability), Math.max(...allReliability));
      else if (key === "risk")
        row[r.route_type] = normalise(r.risk_assessment.hidden_cost, Math.min(...allHiddenCosts), Math.max(...allHiddenCosts), true);
      else
        row[r.route_type] = normalise(r.risk_assessment.delay_probability, Math.min(...allDelayProb), Math.max(...allDelayProb), true);
    });
    return row;
  });

  /* Cost stack bar data */
  const barData = routes.map((r) => ({
    name: ROUTE_LABELS[r.route_type],
    routeType: r.route_type,
    "Supplier Invoice": r.cost_breakdown.supplier_invoice,
    "Customs & IGST": r.cost_breakdown.customs_duty_bcd + r.cost_breakdown.igst + r.cost_breakdown.surcharge_cess,
    "Freight & Insurance": r.cost_breakdown.freight_cost + r.cost_breakdown.insurance,
    "Domestic & Warehouse": r.cost_breakdown.domestic_transport + r.cost_breakdown.warehousing + r.cost_breakdown.terminal_handling,
    "Hidden Risk Cost": r.risk_assessment.hidden_cost,
  }));

  const BAR_COLORS = ["#3390ff", "#818cf8", "#22d3ee", "#a78bfa", "#f87171"];

  const TABS = [
    { id: "radar" as const,     label: "Radar Analysis",      emoji: "📡" },
    { id: "breakdown" as const, label: "Cost Breakdown",      emoji: "📊" },
    { id: "metrics" as const,   label: "Full Detail Table",   emoji: "📋" },
  ];

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-lg shadow-lg shadow-brand-500/30">
              🔀
            </div>
            <div>
              <h3 className="font-bold text-lg">Route Comparison</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Multi-dimensional analysis across all routes
              </p>
            </div>
          </div>

          {/* Route toggle pills */}
          <div className="flex gap-2 flex-wrap">
            {routes.map((r) => {
              const isOn = selected.has(r.route_type);
              return (
                <button
                  key={r.route_type}
                  onClick={() => {
                    const next = new Set(selected);
                    if (isOn && next.size > 1) next.delete(r.route_type);
                    else next.add(r.route_type);
                    setSelected(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    isOn
                      ? "border-transparent text-white"
                      : "bg-white/[0.03] border-white/[0.08] text-white/30"
                  }`}
                  style={isOn ? { background: `${ROUTE_COLORS[r.route_type]}25`, borderColor: `${ROUTE_COLORS[r.route_type]}50`, color: ROUTE_COLORS[r.route_type] } : {}}
                >
                  {isOn
                    ? <CheckCircle2 size={12} />
                    : <XCircle size={12} />}
                  {ROUTE_ICONS[r.route_type]} {ROUTE_LABELS[r.route_type]}
                  {r.is_recommended && <span className="text-[9px] opacity-70 ml-0.5">★</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mt-5 bg-white/[0.03] rounded-xl p-1 w-fit">
          {TABS.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                tab === id
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">

        {/* ── RADAR TAB ── */}
        {tab === "radar" && (
          <div>
            <p className="text-xs text-white/40 mb-4">
              Higher score = better performance in each dimension (normalised 0–100).
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="dim"
                  tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip content={<RadarTooltip />} />
                {visibleRoutes.map((r) => (
                  <Radar
                    key={r.route_type}
                    name={`${ROUTE_ICONS[r.route_type]} ${ROUTE_LABELS[r.route_type]}`}
                    dataKey={r.route_type}
                    stroke={ROUTE_COLORS[r.route_type]}
                    fill={ROUTE_COLORS[r.route_type]}
                    fillOpacity={0.12}
                    strokeWidth={2}
                    dot={{ fill: ROUTE_COLORS[r.route_type], r: 3 }}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>

            {/* Score cards below radar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {visibleRoutes.map((r) => {
                const dims = radarData.map((d) => d[r.route_type] as number);
                const avg = Math.round(dims.reduce((a, b) => a + b, 0) / dims.length);
                return (
                  <div
                    key={r.route_type}
                    className="rounded-xl p-4 border"
                    style={{ background: `${ROUTE_COLORS[r.route_type]}10`, borderColor: `${ROUTE_COLORS[r.route_type]}25` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: ROUTE_COLORS[r.route_type] }}>
                        {ROUTE_ICONS[r.route_type]} {ROUTE_LABELS[r.route_type]}
                      </span>
                      {r.is_recommended && <span className="text-[10px] badge-brand">★ Best</span>}
                    </div>
                    <p className="text-3xl font-bold text-white">{avg}<span className="text-lg text-white/40">/100</span></p>
                    <p className="text-[11px] text-white/40 mt-1">Overall score</p>
                    {/* Mini bar */}
                    <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${avg}%`, background: ROUTE_COLORS[r.route_type] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── COST BREAKDOWN TAB ── */}
        {tab === "breakdown" && (
          <div>
            <p className="text-xs text-white/40 mb-4">
              Stacked cost components for each route — showing where money actually goes.
            </p>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={barData.filter((d) => selected.has(d.routeType))} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                {Object.keys(barData[0])
                  .filter((k) => k !== "name" && k !== "routeType")
                  .map((key, i) => (
                    <Bar key={key} dataKey={key} stackId="a" fill={BAR_COLORS[i]}
                      radius={i === BAR_COLORS.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0]}
                      fillOpacity={0.85}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4">
              {Object.keys(barData[0])
                .filter((k) => k !== "name" && k !== "routeType")
                .map((key, i) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs text-white/50">
                    <span className="w-3 h-3 rounded-sm" style={{ background: BAR_COLORS[i] }} />
                    {key}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── DETAIL TABLE TAB ── */}
        {tab === "metrics" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left px-5 py-3 text-xs text-white/40 uppercase tracking-wider font-semibold">Metric</th>
                  {visibleRoutes.map((r) => (
                    <th key={r.route_type} className="text-right px-5 py-3">
                      <span className="text-xs font-bold" style={{ color: ROUTE_COLORS[r.route_type] }}>
                        {ROUTE_ICONS[r.route_type]} {ROUTE_LABELS[r.route_type]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Cost rows */}
                <tr className="bg-white/[0.01]">
                  <td colSpan={visibleRoutes.length + 1} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-400/60">
                    Cost Breakdown
                  </td>
                </tr>
                <DetailRow label="Supplier Invoice"   values={visibleRoutes.map((r) => r.cost_breakdown.supplier_invoice)} />
                <DetailRow label="Customs Duty (BCD)" values={visibleRoutes.map((r) => r.cost_breakdown.customs_duty_bcd)} />
                <DetailRow label="IGST"               values={visibleRoutes.map((r) => r.cost_breakdown.igst)} />
                <DetailRow label="Freight Cost"       values={visibleRoutes.map((r) => r.cost_breakdown.freight_cost)} />
                <DetailRow label="Insurance"          values={visibleRoutes.map((r) => r.cost_breakdown.insurance)} />
                <DetailRow label="Terminal Handling"  values={visibleRoutes.map((r) => r.cost_breakdown.terminal_handling)} />
                <DetailRow label="Domestic Transport" values={visibleRoutes.map((r) => r.cost_breakdown.domestic_transport)} />
                <DetailRow label="Warehousing"        values={visibleRoutes.map((r) => r.cost_breakdown.warehousing)} />
                <DetailRow label="Total Base Cost"    values={visibleRoutes.map((r) => r.cost_breakdown.total_landed_cost)} highlight />

                {/* Risk rows */}
                <tr className="bg-white/[0.01]">
                  <td colSpan={visibleRoutes.length + 1} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-danger-400/60">
                    Risk & Hidden Costs
                  </td>
                </tr>
                <DetailRow label="Hidden Risk Cost"   values={visibleRoutes.map((r) => r.risk_assessment.hidden_cost)} />
                <DetailRow label="Congestion Penalty" values={visibleRoutes.map((r) => r.risk_assessment.congestion_penalty)} />
                <DetailRow label="Fallback Buffer"    values={visibleRoutes.map((r) => r.risk_assessment.fallback_buffer)} />

                {/* Summary */}
                <tr className="bg-white/[0.01]">
                  <td colSpan={visibleRoutes.length + 1} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-success-400/60">
                    Summary
                  </td>
                </tr>
                <tr className="border-b border-white/[0.04] bg-brand-500/[0.03]">
                  <td className="px-5 py-3 text-sm font-bold text-white">TRUE COST</td>
                  {visibleRoutes.map((r) => (
                    <td key={r.route_type} className="px-5 py-3 text-right">
                      <span className="font-mono font-bold text-lg" style={{ color: ROUTE_COLORS[r.route_type] }}>
                        ${r.true_cost.toLocaleString()}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/[0.04]">
                  <td className="px-5 py-3 text-xs text-white/50">Transit Days</td>
                  {visibleRoutes.map((r) => (
                    <td key={r.route_type} className="px-5 py-3 text-right font-mono font-semibold text-white/80">
                      {r.transit_days}d
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/[0.04]">
                  <td className="px-5 py-3 text-xs text-white/50">Reliability Score</td>
                  {visibleRoutes.map((r) => (
                    <td key={r.route_type} className="px-5 py-3 text-right font-mono font-semibold text-white/80">
                      {r.risk_assessment.transit_reliability_score}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/[0.04]">
                  <td className="px-5 py-3 text-xs text-white/50">Delay Probability</td>
                  {visibleRoutes.map((r) => (
                    <td key={r.route_type} className="px-5 py-3 text-right font-mono font-semibold text-white/80">
                      {Math.round(r.risk_assessment.delay_probability * 100)}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-5 py-3 text-xs text-white/50">Risk Level</td>
                  {visibleRoutes.map((r) => (
                    <td key={r.route_type} className="px-5 py-3 text-right">
                      <span className={r.risk_assessment.risk_level === "low" ? "badge-success" : r.risk_assessment.risk_level === "medium" ? "badge-warning" : "badge-danger"}>
                        {r.risk_assessment.risk_level}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
