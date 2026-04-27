"use client";

import type { Route } from "@/types";

interface Props {
  routes: Route[];
}

export default function ComparisonTable({ routes }: Props) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Route</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Invoice</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Customs</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">IGST</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Freight</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Base Cost</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-danger-400/70">Hidden Cost</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-brand-400/70">True Cost</th>
              <th className="text-center px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Days</th>
              <th className="text-center px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Risk</th>
              <th className="text-center px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => (
              <tr
                key={i}
                className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${
                  r.is_recommended ? "bg-brand-500/[0.04]" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.mode === "air" ? "✈️" : "🚢"}</span>
                    <div>
                      <p className="font-medium text-white/90">{r.path.join(" → ")}</p>
                      <p className="text-[10px] text-white/30 uppercase mt-0.5">{r.route_type}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right px-4 py-4 font-mono text-white/60">
                  ${r.cost_breakdown.supplier_invoice.toLocaleString()}
                </td>
                <td className="text-right px-4 py-4 font-mono text-white/60">
                  ${r.cost_breakdown.customs_duty_bcd.toLocaleString()}
                </td>
                <td className="text-right px-4 py-4 font-mono text-white/60">
                  ${r.cost_breakdown.igst.toLocaleString()}
                </td>
                <td className="text-right px-4 py-4 font-mono text-white/60">
                  ${r.cost_breakdown.freight_cost.toLocaleString()}
                </td>
                <td className="text-right px-4 py-4 font-mono font-semibold text-white/80">
                  ${r.cost_breakdown.total_landed_cost.toLocaleString()}
                </td>
                <td className={`text-right px-4 py-4 font-mono font-semibold ${r.risk_assessment.hidden_cost > 500 ? "text-danger-400" : "text-warning-400"}`}>
                  +${r.risk_assessment.hidden_cost.toLocaleString()}
                </td>
                <td className={`text-right px-4 py-4 font-mono font-bold ${r.is_recommended ? "text-brand-400" : "text-white"}`}>
                  ${r.true_cost.toLocaleString()}
                </td>
                <td className="text-center px-4 py-4 font-semibold">{r.transit_days}</td>
                <td className="text-center px-4 py-4">
                  <span
                    className={
                      r.risk_assessment.risk_level === "low"
                        ? "badge-success"
                        : r.risk_assessment.risk_level === "medium"
                        ? "badge-warning"
                        : "badge-danger"
                    }
                  >
                    {r.risk_assessment.risk_level}
                  </span>
                </td>
                <td className="text-center px-4 py-4">
                  {r.is_recommended && <span className="badge-brand">⭐ Best</span>}
                  {r.is_cost_illusion && !r.is_recommended && <span className="badge-danger">❌ Illusion</span>}
                  {!r.is_recommended && !r.is_cost_illusion && <span className="text-white/20">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
