"use client";

import { useRef, useState } from "react";
import type { Route, Recommendation } from "@/types";
import { motion, type Variants } from "framer-motion";
import { Ship, Plane, Navigation, AlertTriangle, CheckCircle2 } from "lucide-react";
import AnimatedValue from "./AnimatedValue";

interface Props {
  routes: Route[];
  recommendation: Recommendation;
  hoveredRoute: string | null;
  onHover: (routeType: string | null) => void;
}

const TYPE_LABELS: Record<string, string> = {
  cheapest: "Cheapest",
  fastest: "Fastest",
  balanced: "Balanced",
  china: "China",
  vietnam: "Vietnam",
  germany: "Germany",
  usa: "USA",
  turkey: "Turkey",
  bangladesh: "Bangladesh",
  "south korea": "South Korea",
  taiwan: "Taiwan",
};

function riskColor(level: string) {
  if (level === "low") return "badge-success";
  if (level === "medium") return "badge-warning";
  return "badge-danger";
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

/* ---------- Individual Card (owns its own spotlight state) ---------- */
function RouteCard({
  route,
  isRec,
  isDimmed,
  onHover,
}: {
  route: Route;
  isRec: boolean;
  isDimmed: boolean;
  onHover: (t: string | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const spotlightColor = isRec
    ? "rgba(51,144,255,0.18)"
    : route.is_cost_illusion
    ? "rgba(248,113,113,0.15)"
    : "rgba(255,255,255,0.07)";

  return (
    <motion.div
      variants={cardVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setSpotlight(true); onHover(route.route_type); }}
      onMouseLeave={() => { setSpotlight(false); onHover(null); }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`relative glass-card-hover p-6 cursor-pointer overflow-hidden transition-all duration-500 ${
        isRec
          ? "border-brand-500/40 ring-1 ring-brand-500/20 bg-brand-500/[0.06]"
          : route.is_cost_illusion
          ? "border-danger-500/30 bg-danger-500/[0.02]"
          : ""
      } ${isDimmed ? "opacity-40 scale-[0.98] grayscale-[0.5]" : "scale-100"}`}
    >
      {/* ── Mouse spotlight overlay ── */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: spotlight ? 1 : 0,
          background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-between mb-4 relative z-10 gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${route.mode === "air" ? "bg-cyan-500/20 text-cyan-400" : "bg-brand-500/20 text-brand-400"}`}>
            {route.mode === "air" ? <Plane size={18} /> : route.mode === "multimodal" ? <Navigation size={18} /> : <Ship size={18} />}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/60">
            {TYPE_LABELS[route.route_type] || route.route_type}
          </span>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {isRec && (
            <span className="badge-brand gap-1.5 pr-4 pl-3 py-1.5 shadow-[0_0_15px_rgba(51,144,255,0.3)]">
              <CheckCircle2 size={14} /> Recommended
            </span>
          )}
          {route.is_cost_illusion && (
            <span className="badge-danger gap-1.5 pr-4 pl-3 py-1.5">
              <AlertTriangle size={14} /> Cost Illusion
            </span>
          )}
          {route.is_greenest && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1">
              🌱 Greenest
            </span>
          )}
        </div>
      </div>

      {/* Route path */}
      <div className="flex items-center flex-wrap gap-1.5 mb-5 text-sm relative z-10">
        {route.path.map((p, j) => (
          <span key={j} className="flex items-center gap-1.5">
            <span className="text-white/90 font-semibold">{p}</span>
            {j < route.path.length - 1 && <span className="text-brand-400/50">→</span>}
          </span>
        ))}
      </div>

      {/* Key metrics with animated numbers */}
      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Base Cost</p>
          <p className="text-lg font-bold font-mono text-white/90">
            $<AnimatedValue value={route.cost_breakdown.total_landed_cost} duration={1200} />
          </p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Hidden Cost</p>
          <AnimatedValue
            value={route.risk_assessment.hidden_cost}
            prefix="+$"
            duration={1400}
            className={`text-lg font-bold font-mono block ${
              route.risk_assessment.hidden_cost > 500
                ? "text-danger-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]"
                : "text-warning-400"
            }`}
          />
        </div>
        <div className={`rounded-xl p-3 border ${isRec ? "bg-brand-500/10 border-brand-500/20" : "bg-white/[0.03] border-white/[0.05]"}`}>
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">True Cost</p>
          <p className={`text-xl font-bold font-mono ${isRec ? "text-brand-400 drop-shadow-[0_0_10px_rgba(51,144,255,0.4)]" : "text-white"}`}>
            $<AnimatedValue value={route.true_cost} duration={1600} />
          </p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">Transit / ESG</p>
          <p className="text-sm font-bold text-white/90 leading-tight">
            {route.transit_days} days<br/>
            <span className="text-[10px] font-mono text-emerald-400/80">{route.co2_emissions_kg} kg CO₂</span>
          </p>
        </div>
      </div>

      {/* Expanded Timeline */}
      {isExpanded && route.timeline && route.timeline.length > 0 && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="relative z-10 mb-5 pl-2"
        >
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-semibold">Logistics Timeline</p>
          <div className="relative border-l-2 border-white/10 ml-3 pl-5 space-y-4">
            {route.timeline.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[29px] top-0 bg-gray-900 border border-white/10 rounded-full w-6 h-6 flex items-center justify-center text-[10px] shadow-lg">
                  {step.icon}
                </span>
                <p className="text-xs font-bold text-white/90">{step.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/50">
                  <span>{step.location}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="font-mono">{step.duration_days} days</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk & Reliability */}
      <div className="flex items-center justify-between relative z-10">
        <span className={riskColor(route.risk_assessment.risk_level)}>
          {route.risk_assessment.risk_level.toUpperCase()} RISK
        </span>
        <div className="text-xs text-white/40 flex items-center gap-1.5">
          Reliability:{" "}
          <span className="text-white/90 font-bold bg-white/10 px-2 py-0.5 rounded-md">
            {route.risk_assessment.transit_reliability_score}%
          </span>
        </div>
      </div>

      {/* Cost illusion warning */}
      {route.cost_illusion_warning && (
        <div className="mt-5 p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/20 text-xs text-danger-300 leading-relaxed relative z-10">
          <div className="font-semibold text-danger-400 mb-1 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Illusion Detected
          </div>
          {route.cost_illusion_warning}
        </div>
      )}

      {/* Disruption warning */}
      {route.risk_assessment.active_disruption && (
        <div className="mt-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed relative z-10 animate-pulse">
          <div className="font-semibold text-red-400 mb-1 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Active Disruption
          </div>
          <p className="mb-1">{route.risk_assessment.active_disruption}</p>
          {route.risk_assessment.disrupted_nodes && route.risk_assessment.disrupted_nodes.length > 0 && (
            <div className="text-[10px] text-red-400/80 uppercase tracking-widest mt-1">
              <span className="font-bold">Affected Areas:</span> {route.risk_assessment.disrupted_nodes.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Recommended glow ring */}
      {isRec && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-brand-400/40 shadow-[inset_0_0_20px_rgba(51,144,255,0.15)] pointer-events-none" />
      )}
    </motion.div>
  );
}

/* ---------- Container ---------- */
export default function RouteCards({ routes, recommendation, hoveredRoute, onHover }: Props) {
  const sorted = [...routes].sort((a, b) => {
    if (a.is_recommended) return -1;
    if (b.is_recommended) return 1;
    return 0;
  });

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {sorted.map((route, i) => (
        <RouteCard
          key={i}
          route={route}
          isRec={route.is_recommended}
          isDimmed={hoveredRoute !== null && hoveredRoute !== route.route_type}
          onHover={onHover}
        />
      ))}
    </motion.div>
  );
}
