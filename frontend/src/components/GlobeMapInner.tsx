"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Globe from "react-globe.gl";
import type { Route } from "@/types";

const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // Cities
  Shenzhen:              { lat: 22.5431, lng: 114.0579 },
  Shanghai:              { lat: 31.2304, lng: 121.4737 },
  "Ho Chi Minh City":   { lat: 10.8231, lng: 106.6297 },
  Mumbai:                { lat: 19.0760, lng: 72.8777  },
  Pune:                  { lat: 18.5204, lng: 73.8567  },
  Delhi:                 { lat: 28.7041, lng: 77.1025  },
  Mundra:                { lat: 22.8441, lng: 69.7343  },
  Hamburg:               { lat: 53.5511, lng: 9.9937   },
  "Los Angeles":         { lat: 34.0522, lng: -118.2437},
  Istanbul:              { lat: 41.0082, lng: 28.9784  },
  Dhaka:                 { lat: 23.8103, lng: 90.4125  },
  Seoul:                 { lat: 37.5665, lng: 126.9780 },
  Taipei:                { lat: 25.0330, lng: 121.5654 },

  // Ports
  "Chennai Port":        { lat: 13.0827, lng: 80.2707  },
  "Mundra Port":         { lat: 22.8441, lng: 69.7343  },
  "Mumbai Port (JNPT)":  { lat: 18.9500, lng: 72.9500  },
  "Mumbai Airport":      { lat: 19.0896, lng: 72.8656  },
  "Delhi IGI Airport":   { lat: 28.5500, lng: 77.1000  },

  // Maritime Chokepoints (for sea route waypoints)
  "Strait of Malacca":   { lat: 4.12,   lng: 100.11  },
  "Strait of Hormuz":    { lat: 26.56,  lng: 56.25   },
  "Suez Canal":          { lat: 30.58,  lng: 32.34   },
  "Bab-el-Mandeb":       { lat: 12.58,  lng: 43.33   },
  "Strait of Gibraltar":  { lat: 35.97,  lng: -5.50   },
  "Panama Canal":        { lat: 9.08,   lng: -79.68  },
  "Cape of Good Hope":   { lat: -34.35, lng: 18.47   },
  "Bosphorus Strait":    { lat: 41.11,  lng: 29.06   },
  "English Channel":     { lat: 50.18,  lng: -0.53   },
};

interface ArcDatum {
  startLat: number; startLng: number;
  endLat: number;   endLng: number;
  color: string;
  routeType: string;
  isRecommended: boolean;
  mode: string;
  // Tooltip data
  routeName: string;
  transitDays: number;
  trueCost: number;
  riskLevel: string;
  co2: number;
  reliability: number;
  fromCity: string;
  toCity: string;
}

interface PointDatum {
  lat: number; lng: number; name: string; isMajor?: boolean;
}

const MAJOR_PORTS = [
  // Chokepoints
  { name: "Strait of Hormuz", lat: 26.56, lng: 56.25 },
  { name: "Suez Canal", lat: 30.58, lng: 32.34 },
  { name: "Panama Canal", lat: 9.08, lng: -79.68 },
  { name: "Strait of Malacca", lat: 4.12, lng: 100.11 },
  { name: "Cape of Good Hope", lat: -34.35, lng: 18.47 },
  { name: "Strait of Gibraltar", lat: 35.97, lng: -5.50 },
  { name: "Bab-el-Mandeb", lat: 12.58, lng: 43.33 },
  { name: "Bosphorus Strait", lat: 41.11, lng: 29.06 },
  { name: "English Channel", lat: 50.18, lng: -0.53 },

  // Major Ports
  { name: "Port of Singapore", lat: 1.26, lng: 103.82 },
  { name: "Port of Rotterdam", lat: 51.94, lng: 4.14 },
  { name: "Port of Antwerp", lat: 51.27, lng: 4.34 },
  { name: "Port of Hamburg", lat: 53.53, lng: 9.95 },
  { name: "Jebel Ali Port", lat: 24.98, lng: 55.06 },
  { name: "Port of Los Angeles", lat: 33.72, lng: -118.26 },
  { name: "Port of Long Beach", lat: 33.75, lng: -118.21 },
  { name: "Port of New York", lat: 40.67, lng: -74.02 },
  { name: "Port of Shanghai", lat: 31.23, lng: 121.47 },
  { name: "Port of Ningbo", lat: 29.93, lng: 121.85 },
  { name: "Port of Shenzhen", lat: 22.50, lng: 113.88 },
  { name: "Port of Busan", lat: 35.10, lng: 129.04 },
  { name: "Port of Hong Kong", lat: 22.33, lng: 114.12 },
  { name: "Port of Guangzhou", lat: 22.76, lng: 113.59 },
];

interface Props {
  routes: Route[];
  hoveredRoute: string | null;
  width: number;
  height: number;
  showAllPorts?: boolean;
  isSpinning?: boolean;
}

export default function GlobeMapInner({ routes, hoveredRoute, width, height, showAllPorts, isSpinning = true }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeEl = useRef<any>(null);

  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;

    const controls = globe.controls();
    // Auto-rotate
    controls.autoRotate = isSpinning;
    controls.autoRotateSpeed = 0.3;
    // Zoom limits
    controls.enableZoom = true;
    controls.minDistance = 120;
    controls.maxDistance = 580;
    // Prevent polar flipping but allow viewing Europe/USA
    controls.minPolarAngle = Math.PI / 6;   // ~30°
    controls.maxPolarAngle = Math.PI * 5 / 6; // ~150°
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
  }, [isSpinning]);

  const arcsData: ArcDatum[] = useMemo(() => {
    const arcs: ArcDatum[] = [];
    routes.forEach((route) => {
      const color = route.is_recommended
        ? "#4ade80"
        : route.is_cost_illusion
        ? "#f87171"
        : "#3390ff";
      for (let i = 0; i < route.path.length - 1; i++) {
        const s = cityCoordinates[route.path[i]];
        const e = cityCoordinates[route.path[i + 1]];
        if (s && e) {
          arcs.push({
            startLat: s.lat, startLng: s.lng,
            endLat: e.lat, endLng: e.lng,
            color, routeType: route.route_type,
            isRecommended: route.is_recommended,
            mode: route.mode,
            routeName: `${route.path[0]} → ${route.path[route.path.length - 1]}`,
            transitDays: route.transit_days,
            trueCost: route.true_cost,
            riskLevel: route.risk_assessment.risk_level,
            co2: route.co2_emissions_kg || 0,
            reliability: route.risk_assessment.transit_reliability_score,
            fromCity: route.path[i],
            toCity: route.path[i + 1],
          });
        }
      }
    });
    return arcs;
  }, [routes]);

  const pointsData: PointDatum[] = useMemo(() => {
    const map = new Map<string, PointDatum>();
    routes.forEach((route) =>
      route.path.forEach((name) => {
        const c = cityCoordinates[name];
        if (c && !map.has(name)) map.set(name, { lat: c.lat, lng: c.lng, name, isMajor: false });
      })
    );
    if (showAllPorts) {
      MAJOR_PORTS.forEach(p => {
        if (!map.has(p.name)) {
          map.set(p.name, { lat: p.lat, lng: p.lng, name: p.name, isMajor: true });
        }
      });
    }
    return Array.from(map.values());
  }, [routes, showAllPorts]);

  // Dynamic Camera Framing
  useEffect(() => {
    const globe = globeEl.current;
    if (!globe || pointsData.length === 0) return;

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    pointsData.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });

    // Handle crossing the international date line (crude fix for USA to India)
    if (maxLng - minLng > 180) {
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = minLng < -90 && maxLng > 50 ? -20 : (minLng + maxLng) / 2;
      globe.pointOfView({ lat: centerLat, lng: centerLng, altitude: 2.8 }, 2000);
    } else {
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const maxSpread = Math.max(maxLat - minLat, maxLng - minLng);
      
      let altitude = 1.0 + (maxSpread / 100) * 1.5;
      if (altitude < 1.2) altitude = 1.2;
      if (altitude > 2.8) altitude = 2.8;

      globe.pointOfView({ lat: centerLat, lng: centerLng, altitude }, 2000);
    }
  }, [pointsData]);

  // Arc color — dim non-hovered routes
  const arcColor = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      const dimmed = hoveredRoute !== null && hoveredRoute !== arc.routeType;
      return dimmed
        ? [`${arc.color}22`, `${arc.color}11`]
        : [`${arc.color}ee`, `${arc.color}66`];
    },
    [hoveredRoute]
  );

  // Arc stroke — sea is thick & bold, air is thin
  const arcStroke = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      const isSea = arc.mode === "sea";
      if (hoveredRoute === arc.routeType) return isSea ? 1.2 : 0.6;
      return arc.isRecommended ? (isSea ? 0.9 : 0.45) : (isSea ? 0.7 : 0.35);
    },
    [hoveredRoute]
  );

  // Same arc altitude for both — all arcs visible above the globe
  const arcAltitude = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      const dLat = arc.startLat - arc.endLat;
      let dLng = Math.abs(arc.startLng - arc.endLng);
      if (dLng > 180) dLng = 360 - dLng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      return Math.min(0.8, Math.max(0.12, dist * 0.005));
    },
    []
  );

  // Sea = solid continuous line (no gaps, no animation)
  // Air = tiny animated dots racing along the arc
  const arcDashLength = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      return arc.mode === "sea" ? 1 : 0.03;
    },
    []
  );

  const arcDashGap = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      return arc.mode === "sea" ? 0 : 0.03;
    },
    []
  );

  const arcDashAnimateTime = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      return arc.mode === "sea" ? 0 : 1500;
    },
    []
  );

  return (
    <Globe
      ref={globeEl}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      atmosphereColor="#3390ff"
      atmosphereAltitude={0.15}
      // ── Arcs ──────────────────────────────────────────────
      arcsData={arcsData}
      arcColor={arcColor as unknown as string}
      arcAltitude={arcAltitude as unknown as number}
      arcStroke={arcStroke as unknown as number}
      arcDashLength={arcDashLength as unknown as number}
      arcDashGap={arcDashGap as unknown as number}
      arcDashAnimateTime={arcDashAnimateTime as unknown as number}
      arcLabel={(d: object) => {
        const arc = d as ArcDatum;
        const modeIcon = arc.mode === "sea" ? "🚢" : "✈️";
        const riskColor = arc.riskLevel === "low" ? "#4ade80" : arc.riskLevel === "medium" ? "#f59e0b" : "#ef4444";
        return `
          <div style="
            background: rgba(10,12,20,0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            padding: 14px 18px;
            min-width: 220px;
            font-family: 'Inter', system-ui, sans-serif;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          ">
            <div style="font-size:13px; font-weight:700; color:#fff; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              ${modeIcon} ${arc.routeName}
            </div>
            <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px;">
              ${arc.fromCity} → ${arc.toCity}
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; font-size:11px;">
              <div style="color:rgba(255,255,255,0.5);">Mode</div>
              <div style="color:#fff; font-weight:600; text-transform:capitalize;">${arc.mode}</div>
              <div style="color:rgba(255,255,255,0.5);">Transit</div>
              <div style="color:#fff; font-weight:600;">${arc.transitDays} days</div>
              <div style="color:rgba(255,255,255,0.5);">True Cost</div>
              <div style="color:#fff; font-weight:600;">$${arc.trueCost.toLocaleString()}</div>
              <div style="color:rgba(255,255,255,0.5);">Risk</div>
              <div style="color:${riskColor}; font-weight:700; text-transform:uppercase;">${arc.riskLevel}</div>
              <div style="color:rgba(255,255,255,0.5);">Reliability</div>
              <div style="color:#fff; font-weight:600;">${arc.reliability}%</div>
              <div style="color:rgba(255,255,255,0.5);">CO₂</div>
              <div style="color:#4ade80; font-weight:600;">${arc.co2.toLocaleString()} kg</div>
            </div>
            ${arc.isRecommended ? '<div style="margin-top:8px; padding:4px 8px; background:rgba(74,222,128,0.15); border:1px solid rgba(74,222,128,0.3); border-radius:6px; font-size:10px; color:#4ade80; font-weight:700; text-align:center; text-transform:uppercase; letter-spacing:1px;">⭐ Recommended Route</div>' : ''}
          </div>
        `;
      }}
      // ── City dot markers ────────────────────────────────
      pointsData={pointsData}
      pointColor={(d: object) => (d as PointDatum).isMajor ? "#f59e0b" : "#ffffff"}
      pointAltitude={0.012}
      pointRadius={0.38}
      // ── City labels — raised well above arc lines ───────
      labelsData={pointsData}
      labelLat={(d: object) => (d as PointDatum).lat}
      labelLng={(d: object) => (d as PointDatum).lng}
      labelText={(d: object) => (d as PointDatum).name}
      labelSize={0.85}
      labelColor={(d: object) => (d as PointDatum).isMajor ? "rgba(245,158,11,0.95)" : "rgba(255,255,255,0.95)"}
      labelDotRadius={0.25}
      // Altitude 0.05 lifts labels above arc lines
      labelAltitude={0.055}
      labelResolution={3}
      // ── Disruption Rings ────────────────────────────────
      ringsData={(() => {
        const dRoute = routes.find(r => r.risk_assessment.active_disruption);
        if (!dRoute) return [];
        const msg = dRoute.risk_assessment.active_disruption!;
        if (msg.includes("USA-Iran")) {
          return [{ lat: 26, lng: 54, name: 'Middle East Conflict' }];
        }
        return [{ lat: 15, lng: 115, name: 'South China Sea Disruption' }];
      })()}
      ringColor={() => '#ef4444'}
      ringMaxRadius={12}
      ringPropagationSpeed={1.5}
      ringRepeatPeriod={800}
    />
  );
}
