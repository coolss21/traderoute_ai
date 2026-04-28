"use client";

import React, { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from "react-simple-maps";
import type { Route } from "@/types";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Comprehensive world-wide coordinate map for all origin/destination/waypoint cities
const cityCoordinates: Record<string, [number, number]> = {
  // ── East Asia ──────────────────────────────────────────────────────────────
  Shenzhen:         [114.0579, 22.5431],
  Shanghai:         [121.4737, 31.2304],
  Guangzhou:        [113.2644, 23.1291],
  Ningbo:           [121.5440, 29.8683],
  Tokyo:            [139.6917, 35.6895],
  Seoul:            [126.9780, 37.5665],

  // ── Southeast Asia ──────────────────────────────────────────────────────────
  "Ho Chi Minh City": [106.6297, 10.8231],
  Bangkok:          [100.5018, 13.7563],
  Singapore:        [103.8198,  1.3521],

  // ── South Asia — Indian Cities ──────────────────────────────────────────────
  Mumbai:           [72.8777, 19.0760],
  "JNPT Mumbai":    [72.9500, 18.9500],
  "Mumbai Port (JNPT)": [72.9500, 18.9500],
  "Mumbai Airport": [72.8777, 19.0760],
  Pune:             [73.8567, 18.5204],
  Delhi:            [77.1025, 28.7041],
  "Delhi IGI Airport": [77.1000, 28.5500],
  "Chennai Port":   [80.2707, 13.0827],
  Kolkata:          [88.3639, 22.5726],
  Mundra:           [69.7343, 22.8441],
  "Mundra Port":    [69.7343, 22.8441],

  // ── Middle East ─────────────────────────────────────────────────────────────
  Dubai:            [55.2708, 25.2048],
  "Jebel Ali":      [55.0272, 24.9990],
  "Abu Dhabi":      [54.3773, 24.4539],

  // ── Europe ──────────────────────────────────────────────────────────────────
  Hamburg:          [9.9937, 53.5511],
  Rotterdam:        [4.4777, 51.9244],
  London:           [-0.1276, 51.5074],

  // ── USA ─────────────────────────────────────────────────────────────────────
  "Los Angeles":    [-118.2437, 34.0522],
  "New York":       [-74.0060, 40.7128],

  // ── Shipping Lane Waypoints ──────────────────────────────────────────────────
  "Malacca Strait": [103.5000,  1.5000],
  "Strait of Hormuz": [56.5000, 26.5000],
  "Bay of Bengal":  [88.0000, 12.0000],
  "Suez Canal":     [32.5000, 30.5000],
  "Pacific Ocean":  [160.0000, 15.0000],
};

interface Props {
  routes: Route[];
  hoveredRoute: string | null;
}

export default function GlobalMap({ routes, hoveredRoute }: Props) {
  // Generate visual segments for each route
  const mapLines = useMemo(() => {
    const lines: Array<{
      start: [number, number];
      end: [number, number];
      color: string;
      isRecommended: boolean;
      mode: string;
      routeType: string;
      isDisrupted: boolean;
    }> = [];

    routes.forEach((route) => {
      const color = route.is_recommended
        ? "#4ade80" // success-400
        : route.is_cost_illusion
        ? "#f87171" // danger-400
        : "#3390ff"; // brand-500

      const disruptedNodes: string[] = route.risk_assessment.disrupted_nodes ?? [];

      for (let i = 0; i < route.path.length - 1; i++) {
        const startName = route.path[i];
        const endName = route.path[i + 1];
        const startCoord = cityCoordinates[startName];
        const endCoord = cityCoordinates[endName];

        if (startCoord && endCoord) {
          const isDisrupted = disruptedNodes.includes(startName) || disruptedNodes.includes(endName);
          lines.push({
            start: startCoord,
            end: endCoord,
            color,
            isRecommended: route.is_recommended,
            mode: route.mode,
            routeType: route.route_type,
            isDisrupted
          });
        }
      }
    });
    return lines;
  }, [routes]);

  // Extract unique cities to draw nodes
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    routes.forEach((route) => {
      route.path.forEach((c) => cities.add(c));
    });
    return Array.from(cities)
      .map((city) => ({ name: city, coordinates: cityCoordinates[city] }))
      .filter((c) => c.coordinates);
  }, [routes]);

  return (
    <div className="glass-card p-6 overflow-hidden relative border-brand-500/20 group">
      {/* Background radial gradient for premium feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/10 via-surface-950 to-surface-950 pointer-events-none" />
      
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-bold flex items-center gap-2 drop-shadow-md">
          🌍 Global Trade Routes
        </h3>
        <p className="text-xs text-brand-200/60 mt-1 uppercase tracking-widest font-semibold">
          Live transit visualization & risk mapping
        </p>
      </div>

      {/* Map Legend */}
      <div className="absolute top-6 right-6 z-10 glass-card px-4 py-3 border-white/5 flex flex-col gap-2.5 bg-surface-950/90 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-white/80">
          <span className="w-4 h-0.5 bg-success-400 shadow-[0_0_8px_#4ade80]" />
          <span>Recommended</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-white/80">
          <span className="w-4 h-0.5 bg-brand-500 shadow-[0_0_8px_#3390ff]" />
          <span>Alternative</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-white/80">
          <span className="w-4 h-0.5 bg-danger-400 shadow-[0_0_8px_#f87171]" />
          <span>Cost Illusion</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-white/80">
          <span className="w-4 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
          <span>Disrupted</span>
        </div>
      </div>

      <div className="h-[500px] w-full mt-4 -mb-12 relative z-0">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 280,
            center: [60, 20],
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.015)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "rgba(255,255,255,0.04)", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Draw connecting lines */}
          {mapLines.map((line, i) => {
            const isHovered = hoveredRoute === line.routeType;
            const isDimmed = hoveredRoute !== null && !isHovered;
            
            return (
              <g key={i}>
                {/* Outer Glow Line */}
                <Line
                  from={line.start}
                  to={line.end}
                  stroke={line.isDisrupted ? "#ef4444" : line.color}
                  strokeWidth={isHovered ? 8 : line.isRecommended ? 6 : 4}
                  strokeLinecap="round"
                  style={{
                    strokeOpacity: isDimmed ? 0 : line.isDisrupted ? 0.3 : 0.15,
                    filter: `drop-shadow(0px 0px 8px ${line.isDisrupted ? "#ef4444" : line.color})`,
                    transition: "all 0.4s ease-in-out",
                  }}
                />
                {/* Core Line */}
                <Line
                  from={line.start}
                  to={line.end}
                  stroke={line.isDisrupted ? "#ef4444" : line.color}
                  strokeWidth={isHovered ? 2.5 : line.isRecommended ? 2 : 1.5}
                  strokeLinecap="round"
                  className={(line.isRecommended || line.isDisrupted) && !isDimmed ? "animate-pulse" : ""}
                  style={{
                    strokeDasharray: line.mode === "air" ? "6, 6" : "none",
                    strokeOpacity: isDimmed ? 0.2 : 1,
                    filter: isDimmed ? "none" : `drop-shadow(0px 0px 4px ${line.isDisrupted ? "#ef4444" : line.color})`,
                    transition: "all 0.4s ease-in-out",
                  }}
                />
              </g>
            );
          })}

          {/* Draw Nodes */}
          {uniqueCities.map((city, i) => (
            <Marker key={i} coordinates={city.coordinates as [number, number]}>
              {/* Ripple effect */}
              <circle
                r={12}
                fill="rgba(51,144,255,0.1)"
                className="animate-ping"
                style={{ transformOrigin: "center" }}
              />
              <circle
                r={4.5}
                fill="#0f172a"
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                textAnchor="middle"
                y={-14}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fill: "rgba(255,255,255,0.9)",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.9)) drop-shadow(0px 0px 2px rgba(0,0,0,1))",
                }}
              >
                {city.name}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
}
