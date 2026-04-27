"use client";

import type { BusinessImpact } from "@/types";

interface Props {
  impact: BusinessImpact;
}

export default function BusinessImpactPanel({ impact }: Props) {
  return (
    <div className="glass-card p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success-500 to-cyan-400 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-success-500/30">
          📊
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">Business Impact</h3>
          <p className="text-sm text-white/40">
            Quantified value of using TradeRoute AI for this decision
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-success-500/10 to-success-500/5 rounded-xl p-5 border border-success-500/20">
          <p className="text-xs uppercase tracking-wider text-success-400/60 mb-1">Potential Savings</p>
          <p className="text-3xl font-bold text-success-400">
            ${impact.potential_savings.toLocaleString()}
          </p>
          <p className="text-xs text-white/30 mt-1">vs. cheapest-looking option</p>
        </div>
        <div className="bg-gradient-to-br from-brand-500/10 to-brand-500/5 rounded-xl p-5 border border-brand-500/20">
          <p className="text-xs uppercase tracking-wider text-brand-400/60 mb-1">Risk Reduction</p>
          <p className="text-3xl font-bold text-brand-400">
            {impact.risk_reduction_pct > 0 ? `+${impact.risk_reduction_pct}%` : "—"}
          </p>
          <p className="text-xs text-white/30 mt-1">transit reliability improvement</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-5 border border-cyan-500/20">
          <p className="text-xs uppercase tracking-wider text-cyan-400/60 mb-1">Decision Confidence</p>
          <p className="text-3xl font-bold text-cyan-400">{impact.decision_confidence}</p>
          <p className="text-xs text-white/30 mt-1">AI-backed recommendation</p>
        </div>
      </div>

      {/* Audit Trail */}
      <div>
        <h4 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">
          Audit Trail
        </h4>
        <div className="space-y-2">
          {impact.audit_trail.map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-white/40 flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-white/50">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
