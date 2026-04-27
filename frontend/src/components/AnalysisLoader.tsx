"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { icon: "🛳️", label: "Fetching freight base rates",      duration: 900  },
  { icon: "📦", label: "Parsing HSN code duty schedule",   duration: 700  },
  { icon: "🌐", label: "Mapping transit corridors",         duration: 800  },
  { icon: "⚡", label: "Calculating port congestion impact", duration: 900  },
  { icon: "🧮", label: "Running risk probability model",    duration: 1000 },
  { icon: "🔍", label: "Detecting cost illusion patterns",  duration: 800  },
  { icon: "🤖", label: "Generating AI recommendation",      duration: 700  },
];

type StepState = "pending" | "active" | "done";

export default function AnalysisLoader() {
  const [stepStates, setStepStates] = useState<StepState[]>(
    STEPS.map(() => "pending")
  );
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let current = 0;
    const tick = () => {
      setStepStates((prev) => {
        const next = [...prev];
        if (current > 0) next[current - 1] = "done";
        if (current < STEPS.length) next[current] = "active";
        return next;
      });
      if (current < STEPS.length) {
        setActiveIdx(current);
        const delay = STEPS[current].duration;
        current++;
        setTimeout(tick, delay);
      }
    };
    tick();
  }, []);

  return (
    <motion.div
      className="glass-card p-8 my-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg">Analyzing Your Shipment</h3>
          <p className="text-xs text-white/40 mt-0.5">
            Running {STEPS.length}-step intelligence pipeline…
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const state = stepStates[i];
          return (
            <motion.div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                state === "active"
                  ? "bg-brand-500/10 border-brand-500/30"
                  : state === "done"
                  ? "bg-white/[0.02] border-white/[0.04]"
                  : "border-transparent"
              }`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: state === "pending" ? 0.3 : 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              {/* Status icon */}
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {state === "done" ? (
                    <motion.svg
                      key="check"
                      className="w-5 h-5 text-success-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : state === "active" ? (
                    <motion.div
                      key="spinner"
                      className="w-4 h-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  ) : (
                    <motion.div
                      key="dot"
                      className="w-1.5 h-1.5 rounded-full bg-white/20"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Step emoji */}
              <span className={`text-base transition-all duration-300 ${state === "pending" ? "grayscale opacity-30" : ""}`}>
                {step.icon}
              </span>

              {/* Label */}
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  state === "active"
                    ? "text-brand-300"
                    : state === "done"
                    ? "text-white/50 line-through decoration-white/20"
                    : "text-white/25"
                }`}
              >
                {step.label}
              </span>

              {/* Active pulse */}
              {state === "active" && (
                <motion.span
                  className="ml-auto text-[10px] text-brand-400 uppercase tracking-wider font-semibold"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  Running…
                </motion.span>
              )}

              {state === "done" && (
                <span className="ml-auto text-[10px] text-success-400/60 uppercase tracking-wider font-semibold">
                  Done
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-6 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
          animate={{
            width: `${Math.round(((activeIdx + 1) / STEPS.length) * 100)}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-right text-[11px] text-white/25 mt-1.5">
        Step {Math.min(activeIdx + 1, STEPS.length)} of {STEPS.length}
      </p>
    </motion.div>
  );
}
