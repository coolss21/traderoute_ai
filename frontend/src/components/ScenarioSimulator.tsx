"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { AnalyzeResponse } from "@/types";
import AnimatedValue from "./AnimatedValue";

interface Props {
  data: AnalyzeResponse;
}

// Knob config: label, field, min, max, step, unit, description
const KNOBS = [
  {
    id: "quantity_pct",
    label: "Quantity",
    unit: "%",
    min: -50,
    max: 100,
    step: 5,
    description: "Change in shipment quantity",
    icon: "📦",
  },
  {
    id: "delay_days",
    label: "Extra Delay",
    unit: " days",
    min: 0,
    max: 20,
    step: 1,
    description: "Additional transit delay risk",
    icon: "⏱️",
  },
  {
    id: "tariff_pct",
    label: "Tariff Rate",
    unit: "%",
    min: -5,
    max: 15,
    step: 0.5,
    description: "Customs duty adjustment",
    icon: "🏛️",
  },
] as const;

type KnobId = (typeof KNOBS)[number]["id"];

const DELAY_DAILY_COST = 850; // $ per extra day (opportunity + warehousing)

export default function ScenarioSimulator({ data }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<KnobId, number>>({
    quantity_pct: 0,
    delay_days: 0,
    tariff_pct: 0,
  });

  const results = useMemo(() => {
    return data.routes.map((route) => {
      const qFactor = 1 + values.quantity_pct / 100;
      const delayCost = values.delay_days * DELAY_DAILY_COST;
      const tariffDelta =
        route.cost_breakdown.total_landed_cost * (values.tariff_pct / 100);

      const adjustedBase = route.cost_breakdown.total_landed_cost * qFactor + tariffDelta;
      const adjustedHidden = route.risk_assessment.hidden_cost + delayCost;
      const adjustedTrue = adjustedBase + adjustedHidden;
      const delta = adjustedTrue - route.true_cost;

      return {
        route_type: route.route_type,
        is_recommended: route.is_recommended,
        original: route.true_cost,
        adjusted: adjustedTrue,
        delta,
        deltaPct: ((delta / route.true_cost) * 100).toFixed(1),
      };
    });
  }, [data, values]);

  const hasChanges = Object.values(values).some((v) => v !== 0);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header toggle */}
      <button
        id="scenario-simulator-toggle"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-500 flex items-center justify-center text-lg shadow-lg shadow-brand-500/30">
            🎛️
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg flex items-center gap-2">
              What-If Scenario Simulator
              {hasChanges && (
                <span className="badge-brand text-[10px] ml-1">ACTIVE</span>
              )}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              Adjust quantity, delays & tariffs — watch costs update in real-time
            </p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-white/40 text-xl"
        >
          ▼
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 border-t border-white/[0.06] pt-6">
          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {KNOBS.map((knob) => {
              const val = values[knob.id];
              const pct = ((val - knob.min) / (knob.max - knob.min)) * 100;
              return (
                <div key={knob.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span>{knob.icon}</span>
                      <span className="text-sm font-semibold">{knob.label}</span>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg ${
                        val > 0
                          ? "bg-danger-500/20 text-danger-300"
                          : val < 0
                          ? "bg-success-500/20 text-success-300"
                          : "bg-white/[0.06] text-white/60"
                      }`}
                    >
                      {val > 0 ? "+" : ""}
                      {val}
                      {knob.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 mb-3">{knob.description}</p>

                  {/* Custom slider */}
                  <div className="relative h-2 bg-white/[0.08] rounded-full">
                    {/* Filled track */}
                    <div
                      className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-100"
                      style={{ width: `${pct}%` }}
                    />
                    <input
                      id={`slider-${knob.id}`}
                      type="range"
                      min={knob.min}
                      max={knob.max}
                      step={knob.step}
                      value={val}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, [knob.id]: Number(e.target.value) }))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {/* Thumb dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-brand-400 shadow-md shadow-brand-500/50 pointer-events-none transition-all duration-100"
                      style={{ left: `calc(${pct}% - 8px)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results table */}
          <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Route</th>
                  <th className="text-right px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Original True Cost</th>
                  <th className="text-right px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Adjusted True Cost</th>
                  <th className="text-right px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Impact</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b border-white/[0.04] last:border-0 ${
                      r.is_recommended ? "bg-brand-500/[0.04]" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-semibold text-white/80">{r.route_type}</span>
                        {r.is_recommended && <span className="badge-brand text-[10px]">Best</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-white/50">
                      ${r.original.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold">
                      <AnimatedValue
                        value={r.adjusted}
                        prefix="$"
                        duration={600}
                        className={r.is_recommended ? "text-brand-300" : "text-white"}
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-mono font-bold text-sm ${
                          r.delta > 0
                            ? "text-danger-400"
                            : r.delta < 0
                            ? "text-success-400"
                            : "text-white/40"
                        }`}
                      >
                        {r.delta > 0 ? "+" : r.delta < 0 ? "" : "±"}$
                        <AnimatedValue value={Math.abs(r.delta)} duration={600} />
                        {" "}
                        <span className="text-[11px] opacity-70">({r.delta > 0 ? "+" : ""}{r.deltaPct}%)</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reset */}
          {hasChanges && (
            <div className="flex justify-end mt-4">
              <button
                id="reset-scenario"
                onClick={() => setValues({ quantity_pct: 0, delay_days: 0, tariff_pct: 0 })}
                className="text-xs text-white/40 hover:text-white/70 underline transition-colors duration-200"
              >
                ↺ Reset to baseline
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
