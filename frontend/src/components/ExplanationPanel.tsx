"use client";

import type { Recommendation, Route } from "@/types";

interface Props {
  recommendation: Recommendation;
  routes: Route[];
}

export default function ExplanationPanel({ recommendation, routes }: Props) {
  const rec = routes.find((r) => r.is_recommended);

  return (
    <div className="glass-card p-8 border-brand-500/20">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-brand-500/30">
          💡
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">Why This Route Is Recommended</h3>
          <p className="text-sm text-white/40">
            AI-powered analysis considering cost, risk, transit time, and your priorities
          </p>
        </div>
      </div>

      {/* Explanation text */}
      <div className="bg-white/[0.03] rounded-xl p-5 mb-6 border border-white/[0.06]">
        <p className="text-white/80 leading-relaxed">{recommendation.explanation}</p>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.04] rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Confidence</p>
          <p className="text-2xl font-bold gradient-text">
            {recommendation.confidence_score}%
          </p>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">True Cost Saving</p>
          <p className="text-2xl font-bold text-success-400">
            {recommendation.cost_saving_vs_cheapest && recommendation.cost_saving_vs_cheapest > 0
              ? `$${recommendation.cost_saving_vs_cheapest.toLocaleString()}`
              : "—"}
          </p>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Reliability Gain</p>
          <p className="text-2xl font-bold text-brand-400">
            {recommendation.risk_reduction_vs_cheapest
              ? `+${recommendation.risk_reduction_vs_cheapest}%`
              : "—"}
          </p>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Transit</p>
          <p className="text-2xl font-bold text-white/90">
            {rec ? `${rec.transit_days} days` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
