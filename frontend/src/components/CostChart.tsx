"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Route } from "@/types";

interface Props {
  routes: Route[];
}

export default function CostChart({ routes }: Props) {
  const chartData = routes.map((r) => ({
    name: `${r.path[0]} → ${r.path[r.path.length-1]}`,
    fullPath: r.path.join(" → "),
    mode: r.mode === "air" ? "✈️ Air" : "🚢 Sea",
    baseCost: r.cost_breakdown.total_landed_cost,
    hiddenCost: r.risk_assessment.hidden_cost,
    trueCost: r.true_cost,
    isRecommended: r.is_recommended,
    isCostIllusion: r.is_cost_illusion,
    routeType: r.route_type,
  }));

  const CustomTooltip = ({ active, payload, label }: {active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string}) => {
    if (!active || !payload || !payload.length) return null;
    const { fullPath } = payload[0].payload;
    return (
      <div className="glass-card p-4 text-sm border border-white/10 max-w-[280px]">
        <p className="font-semibold text-white mb-1">{label}</p>
        <p className="text-[10px] text-white/40 mb-3 leading-tight">{fullPath}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-6 py-0.5">
            <span className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: entry.color }}
              />
              <span className="text-white/60">{entry.name}</span>
            </span>
            <span className="font-mono font-semibold text-white">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Base Cost vs True Cost</h3>
          <p className="text-xs text-white/40 mt-1">
            The gap between bars reveals hidden risk costs — the wider the gap, the bigger the cost illusion
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-brand-500" />
            Base Cost
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-danger-500" />
            Hidden Cost
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 12, color: "rgba(255,255,255,0.5)" }}
          />
          <Bar dataKey="baseCost" name="Base Cost" stackId="a" radius={[0, 0, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isRecommended ? "#22c55e" : entry.isCostIllusion ? "#f59e0b" : "#3390ff"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
          <Bar dataKey="hiddenCost" name="Hidden Cost" stackId="a" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isCostIllusion ? "#ef4444" : "#f87171"}
                fillOpacity={entry.isCostIllusion ? 0.9 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
