"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Globe from "react-globe.gl";
import type { Route } from "@/types";
import { GLOBAL_PRESETS, MapRoute } from "@/data/globalPresets";
import { NODES } from "@/data/nodes";

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
  isRecommended: boolean;
  isFastest: boolean;
  isCheapest: boolean;
  mode: string;
  isRiskSegment: boolean;
  // Tooltip data
  routeName: string;
  fromCity: string;
  toCity: string;
  riskLevel: string;
  originalRouteId: string;
}

interface PointDatum {
  lat: number;
  lng: number;
  name: string;
  isMajor?: boolean;
  isHighRisk?: boolean;
}

const MAJOR_PORTS = [
  // Chokepoints
  { name: "Strait of Hormuz", lat: 26.0, lng: 56.0 },
  { name: "Suez Canal", lat: 30.0, lng: 32.0 },
  { name: "Panama Canal", lat: 9.08, lng: -79.68 },
  { name: "Strait of Malacca", lat: 1.3521, lng: 103.8198 },
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
  routes: Route[]; // Keep for compatibility with backend data if needed
  hoveredRoute: string | null;
  selectedPresetId: string | null;
  width: number;
  height: number;
  showAllPorts?: boolean;
  isSpinning?: boolean;
  activeDisruptionType?: string | null;
}

export default function GlobeMapInner({ routes, hoveredRoute, selectedPresetId, width, height, showAllPorts, isSpinning = true, activeDisruptionType = null }: Props) {
  const globeEl = useRef<any>(null);

  // Use the explicitly passed activeDisruptionType to ensure UI selection overrides everything.
  // This guarantees the circles show up no matter what preset is selected.
  const activeDisruption = activeDisruptionType || null;

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
    if (!selectedPresetId || !GLOBAL_PRESETS[selectedPresetId]) return [];
    
    const preset = GLOBAL_PRESETS[selectedPresetId];
    const arcs: ArcDatum[] = [];

    preset.routes.forEach((route) => {
      // 1. Resolve basic path from nodes
      let resolvedNodes = route.nodes.map(nodeName => ({
        name: nodeName,
        coords: NODES[nodeName] || [0, 0]
      }));

      // 2. Fix Destination (CRITICAL BUG FIX)
      // Append final node if missing (e.g. Mumbai Port -> Pune)
      const lastNodeName = resolvedNodes[resolvedNodes.length - 1].name;
      const destCoords = NODES[route.destination];
      if (lastNodeName !== route.destination && destCoords) {
         const lastCoords = resolvedNodes[resolvedNodes.length - 1].coords;
         // Only append if the coordinates are geographically distinct to prevent Three.js spline crash
         const dist = Math.abs(lastCoords[0] - destCoords[0]) + Math.abs(lastCoords[1] - destCoords[1]);
         if (dist > 0.5) {
            resolvedNodes.push({
              name: route.destination,
              coords: destCoords
            });
         }
      }

      // Base color logic
      let baseColor = "#3390ff"; // Default Blue
      if (route.isRecommended) baseColor = "#4ade80";
      else if (route.isFastest) baseColor = "#a855f7";
      else if (route.isCheapest) baseColor = "#3390ff";

      for (let i = 0; i < resolvedNodes.length - 1; i++) {
        const start = resolvedNodes[i];
        const end = resolvedNodes[i+1];

        // ── Geometric Risk Detection ──
        // Instead of name matching, turn segment red if it passes near the disruption epicenter
        let isRiskSegment = false;
        if (activeDisruption) {
           const isMiddleEast = activeDisruption.includes("war") || activeDisruption.includes("USA-Iran");
           const epicLat = isMiddleEast ? 26 : 15;
           const epicLng = isMiddleEast ? 54 : 115;
           
           // Calculate shortest distance from the disruption epicenter to the route line segment
           const px = epicLng; const py = epicLat;
           const x1 = start.coords[1]; const y1 = start.coords[0];
           const x2 = end.coords[1]; const y2 = end.coords[0];
           
           let dist = 0;
           const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
           if (l2 === 0) {
             dist = Math.hypot(px - x1, py - y1);
           } else {
             let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
             t = Math.max(0, Math.min(1, t));
             const projX = x1 + t * (x2 - x1);
             const projY = y1 + t * (y2 - y1);
             dist = Math.hypot(px - projX, py - projY);
           }

           // Turn red if the path intersects the visual 12-degree radar ring
           if (dist <= 12.5) {
               isRiskSegment = true;
           }
        }

        arcs.push({
          startLat: start.coords[0], startLng: start.coords[1],
          endLat: end.coords[0], endLng: end.coords[1],
          color: isRiskSegment ? "#ef4444" : baseColor,
          isRecommended: !!route.isRecommended,
          isFastest: !!route.isFastest,
          isCheapest: !!route.isCheapest,
          mode: route.type,
          isRiskSegment,
          routeName: route.label,
          fromCity: start.name,
          toCity: end.name,
          riskLevel: route.riskLevel,
          originalRouteId: route.id,
        });
      }
    });
    return arcs;
  }, [selectedPresetId, activeDisruption]);

  const pointsData: PointDatum[] = useMemo(() => {
    if (!selectedPresetId || !GLOBAL_PRESETS[selectedPresetId]) return [];
    const preset = GLOBAL_PRESETS[selectedPresetId];
    const map = new Map<string, PointDatum>();
    
    preset.routes.forEach((route) => {
      // 1. Resolve nodes (same as arcs)
      let resolvedNodes = route.nodes.map(nodeName => ({
        name: nodeName,
        coords: NODES[nodeName] || [0, 0]
      }));

      // Append destination if missing
      const lastNodeName = resolvedNodes[resolvedNodes.length - 1].name;
      const destCoords = NODES[route.destination];
      if (lastNodeName !== route.destination && destCoords) {
         const lastCoords = resolvedNodes[resolvedNodes.length - 1].coords;
         const dist = Math.abs(lastCoords[0] - destCoords[0]) + Math.abs(lastCoords[1] - destCoords[1]);
         if (dist > 0.5) {
            resolvedNodes.push({ name: route.destination, coords: destCoords });
         }
      }

      resolvedNodes.forEach(node => {
        // Geometric node risk detection
        let isHighRisk = false;
        if (activeDisruption) {
           // We use the same epicenter logic, but must recalculate here since htmlData depends on pointsData
           const msg = activeDisruption;
           const epicLat = msg.includes("USA-Iran") ? 26 : 15;
           const epicLng = msg.includes("USA-Iran") ? 54 : 115;
           const dist = Math.hypot(node.coords[0] - epicLat, node.coords[1] - epicLng);
           if (dist < 45) {
               isHighRisk = true;
           }
        }

        if (!map.has(node.name)) {
          map.set(node.name, { 
            lat: node.coords[0], 
            lng: node.coords[1], 
            name: node.name,
            isMajor: true,
            isHighRisk
          });
        }
      });
    });

    if (showAllPorts) {
      MAJOR_PORTS.forEach(p => {
        if (!map.has(p.name)) {
          map.set(p.name, { lat: p.lat, lng: p.lng, name: p.name, isMajor: true });
        }
      });
    }
    return Array.from(map.values());
  }, [selectedPresetId, activeDisruption]);

  // Dynamic Camera Framing
  useEffect(() => {
    const globe = globeEl.current;
    if (!globe || pointsData.length === 0) return;

    setTimeout(() => {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      
      // Include all route points
      pointsData.forEach(p => {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
      });

      // Include the epicenter if a disruption is active, so the camera doesn't cut off the radar rings
      if (activeDisruption) {
        const isMiddleEast = activeDisruption.includes("war") || activeDisruption.includes("USA-Iran");
        const epicenter = isMiddleEast ? { lat: 26, lng: 54 } : { lat: 15, lng: 115 };
        if (epicenter.lat < minLat) minLat = epicenter.lat;
        if (epicenter.lat > maxLat) maxLat = epicenter.lat;
        if (epicenter.lng < minLng) minLng = epicenter.lng;
        if (epicenter.lng > maxLng) maxLng = epicenter.lng;
      }

      // Handle crossing the international date line (crude fix for USA to India)
      if (maxLng - minLng > 180) {
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = minLng < -90 && maxLng > 50 ? -20 : (minLng + maxLng) / 2;
        globe.pointOfView({ lat: centerLat, lng: centerLng, altitude: 2.8 }, 2000);
      } else {
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const maxSpread = Math.max(maxLat - minLat, maxLng - minLng);
        
        let altitude = Math.max(1.2, maxSpread / 40);
        if (altitude > 2.5) altitude = 2.5;

        globe.pointOfView({ lat: centerLat, lng: centerLng, altitude }, 2000);
      }
    }, 500);
  }, [pointsData, routes]);

  // Arc color — dim non-hovered routes
  const arcColor = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      const dimmed = hoveredRoute !== null && hoveredRoute !== arc.originalRouteId;
      const opacity = dimmed ? "22" : "ee";
      const hoverOpacity = dimmed ? "11" : "66";
      return [`${arc.color}${opacity}`, `${arc.color}${hoverOpacity}`];
    },
    [hoveredRoute]
  );

  // Arc stroke — sea is thick & bold, air is thin
  const arcStroke = useCallback(
    (d: object) => {
      const arc = d as ArcDatum;
      const isSea = arc.mode === "sea";
      const width = isSea ? (arc.isRecommended ? 1.5 : 1.0) : 0.6;
      if (hoveredRoute === arc.originalRouteId) return width * 1.5;
      return width;
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
        const riskColor = arc.isRiskSegment ? "#ef4444" : (arc.riskLevel === "low" ? "#4ade80" : "#f59e0b");
        return `
          <div style="
            background: rgba(10,12,20,0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            padding: 14px 18px;
            min-width: 200px;
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
              <div style="color:rgba(255,255,255,0.5);">Risk</div>
              <div style="color:${riskColor}; font-weight:700; text-transform:uppercase;">${arc.isRiskSegment ? '🚨 HIGH RISK SEGMENT' : arc.riskLevel}</div>
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
      labelSize={0.8}
      labelColor={(d: object) => (d as PointDatum).isHighRisk ? "#ef4444" : "rgba(255,255,255,0.9)"}
      labelDotRadius={0.3}
      labelAltitude={0.05}
      labelResolution={3}
      // ── Disruption Rings ────────────────────────────────
      ringsData={(() => {
        if (!activeDisruption) return [];
        const isMiddleEast = activeDisruption.includes("war") || activeDisruption.includes("USA-Iran");
        if (isMiddleEast) {
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
