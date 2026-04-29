"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import type { Route } from "@/types";

const GlobeMapInner = dynamic(() => import("./GlobeMapInner"), { ssr: false });

interface Props {
  routes: Route[];
  hoveredRoute: string | null;
  selectedPresetId: string | null;
  activeDisruptionType: string | null;
}

export default function GlobeMap({ routes, hoveredRoute, selectedPresetId, activeDisruptionType }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [showAllPorts, setShowAllPorts] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);
  const HEIGHT = 520;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    obs.observe(el);
    setWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="glass-card p-6 overflow-hidden relative border-brand-500/20">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/10 via-surface-950 to-surface-950 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            🌍 <span>Global Trade Routes</span>
          </h3>
          <p className="text-xs text-brand-200/60 mt-1 uppercase tracking-widest font-semibold">
            Interactive 3D transit &amp; risk visualization
          </p>
        </div>

        {/* Legend & Controls */}
        <div className="flex flex-col gap-3 items-end">
          <div className="flex gap-2">
            <button
              onClick={() => setIsSpinning(!isSpinning)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-semibold ${
                isSpinning 
                  ? "bg-brand-500/20 text-brand-300 border-brand-500/30" 
                  : "bg-white/[0.05] text-white/60 border-white/[0.08] hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              {isSpinning ? "🛑 Stop Globe" : "🌍 Spin Globe"}
            </button>
            <button
              onClick={() => setShowAllPorts(!showAllPorts)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-semibold ${
                showAllPorts 
                  ? "bg-brand-500/20 text-brand-300 border-brand-500/30" 
                  : "bg-white/[0.05] text-white/60 border-white/[0.08] hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              {showAllPorts ? "🛳️ Hide Major Ports" : "🛳️ Show Major Ports"}
            </button>
          </div>
          
          <div className="glass-card px-4 py-3 border-white/5 flex flex-col gap-2.5 bg-surface-950/90 backdrop-blur-xl shadow-2xl">
            {[
              { label: "Recommended", color: "#4ade80", shadow: "#4ade80" },
              { label: "Alternative",  color: "#3390ff", shadow: "#3390ff" },
              { label: "Cost Illusion", color: "#f87171", shadow: "#f87171" },
            ].map(({ label, color, shadow }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-white/80">
                <span
                  className="w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${shadow}` }}
                />
                <span>{label}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 mt-1 flex flex-col gap-2">
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Transport Mode</p>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/60">
                <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="white" strokeWidth="2" strokeOpacity="0.7" /></svg>
                <span>🚢 Sea Route (solid)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/60">
                <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="2 2" /></svg>
                <span>✈️ Air Route (dotted)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Globe container */}
      <div ref={containerRef} className="w-full relative z-0" style={{ height: HEIGHT }}>
        {width > 0 && (
          <GlobeMapInner
            routes={routes}
            hoveredRoute={hoveredRoute}
            selectedPresetId={selectedPresetId}
            activeDisruptionType={activeDisruptionType}
            width={width}
            height={HEIGHT}
            showAllPorts={showAllPorts}
            isSpinning={isSpinning}
          />
        )}
      </div>

      {/* Interaction hint */}
      <p className="text-center text-[11px] text-white/25 mt-2 relative z-10">
        Drag to rotate · Scroll to zoom
      </p>
    </div>
  );
}
