"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type DonorState = "searching" | "available" | "accepted";

export interface DonorMarkerData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  bloodGroup: string;
  state: DonorState;
}

interface EmergencyMapProps {
  center: [number, number]; // [lng, lat]
  activeRadius: number;     // current search radius in km (5 | 10 | 15 | 20)
  donors: DonorMarkerData[];
  onDonorClick?: (id: string) => void;
}

const RADIUS_RINGS_KM = [5, 10, 15, 20];

const RING_STYLE = {
  5:  { fill: "rgba(185,28,28,0.07)", line: "rgba(185,28,28,0.45)", width: 1.5 },
  10: { fill: "rgba(185,28,28,0.05)", line: "rgba(185,28,28,0.28)", width: 1.2 },
  15: { fill: "rgba(185,28,28,0.03)", line: "rgba(185,28,28,0.16)", width: 1 },
  20: { fill: "rgba(185,28,28,0.02)", line: "rgba(185,28,28,0.10)", width: 0.8 },
} as Record<number, { fill: string; line: string; width: number }>;

const DONOR_ICON = {
  searching: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#71717A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  available: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  accepted:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="#15803D" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
};

const DONOR_COLOR = {
  searching: { bg: "#F4F4F5", border: "#D4D4D8", label: "#52525B" },
  available: { bg: "#FEF3C7", border: "#FCD34D", label: "#92400E" },
  accepted:  { bg: "#DCFCE7", border: "#86EFAC", label: "#15803D" },
};

function buildCircleFeature(
  center: [number, number],
  radiusKm: number,
  steps = 72
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
}

function buildPatientMarker(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = "position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;";
  el.innerHTML = `
    <div class="br-patient-pulse" style="
      position:absolute;inset:0;border-radius:50%;
      background:rgba(185,28,28,0.12);
    "></div>
    <div style="
      position:relative;
      width:20px;height:20px;border-radius:50%;
      background:#B91C1C;border:2.5px solid white;
      box-shadow:0 2px 8px rgba(185,28,28,0.45);
      display:flex;align-items:center;justify-content:center;
    ">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="none">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
      </svg>
    </div>
  `;
  return el;
}

function buildDonorMarker(donor: DonorMarkerData, onClick: () => void): HTMLElement {
  const el = document.createElement("div");
  const { state, name } = donor;
  const c = DONOR_COLOR[state];
  const icon = DONOR_ICON[state];
  const size = state === "accepted" ? "38px" : "30px";
  const pulseStyle = state === "searching"
    ? "animation:brDonorPulse 2.2s ease-in-out infinite;"
    : "";

  el.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;";
  el.innerHTML = `
    <div style="
      width:${size};height:${size};border-radius:50%;
      background:${c.bg};border:2px solid ${c.border};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.10);
      ${pulseStyle}
    ">${icon}</div>
    <div style="
      background:white;border:1px solid rgba(0,0,0,0.07);border-radius:6px;
      padding:2px 7px;font-size:10px;font-weight:700;color:${c.label};
      white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.07);
      font-family:system-ui,sans-serif;letter-spacing:-0.01em;
    ">${state === "accepted" ? "♥ " : ""}${name.split(" ")[0]}</div>
  `;
  el.addEventListener("click", onClick);
  return el;
}

export function EmergencyMap({ center, activeRadius, donors, onDonorClick }: EmergencyMapProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<maplibregl.Map | null>(null);
  const markerRefs     = useRef<Record<string, maplibregl.Marker>>({});
  const patientRef     = useRef<maplibregl.Marker | null>(null);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center,
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    // Patient marker
    const patientEl = buildPatientMarker();
    patientRef.current = new maplibregl.Marker({ element: patientEl, anchor: "center" })
      .setLngLat(center)
      .addTo(mapRef.current);

    // Radius rings after style loads
    mapRef.current.once("load", () => {
      if (!mapRef.current) return;
      RADIUS_RINGS_KM.forEach((km) => {
        const s = RING_STYLE[km];
        const fillId   = `radius-fill-${km}`;
        const lineId   = `radius-line-${km}`;
        const sourceId = `radius-source-${km}`;

        mapRef.current!.addSource(sourceId, {
          type: "geojson",
          data: buildCircleFeature(center, km),
        });
        mapRef.current!.addLayer({
          id: fillId, type: "fill", source: sourceId,
          paint: { "fill-color": s.fill },
        });
        mapRef.current!.addLayer({
          id: lineId, type: "line", source: sourceId,
          paint: { "line-color": s.line, "line-width": s.width, "line-dasharray": km > 5 ? [4, 3] : [1] },
        });
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync donor markers
  useEffect(() => {
    if (!mapRef.current) return;

    const incomingIds = new Set(donors.map((d) => d.id));

    // Remove stale
    Object.keys(markerRefs.current).forEach((id) => {
      if (!incomingIds.has(id)) {
        markerRefs.current[id].remove();
        delete markerRefs.current[id];
      }
    });

    // Add new
    donors.forEach((donor) => {
      if (markerRefs.current[donor.id]) return;
      const el = buildDonorMarker(donor, () => onDonorClick?.(donor.id));
      markerRefs.current[donor.id] = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([donor.lng, donor.lat])
        .addTo(mapRef.current!);
    });
  }, [donors, onDonorClick]);

  // Highlight active radius ring
  useEffect(() => {
    if (!mapRef.current) return;
    const onLoad = () => {
      RADIUS_RINGS_KM.forEach((km) => {
        const active   = km <= activeRadius;
        const fillId   = `radius-fill-${km}`;
        const lineId   = `radius-line-${km}`;
        if (!mapRef.current?.getLayer(fillId)) return;
        const s = RING_STYLE[km];
        mapRef.current.setPaintProperty(fillId, "fill-color",
          active ? s.fill : "rgba(0,0,0,0.01)");
        mapRef.current.setPaintProperty(lineId, "line-opacity",
          active ? 1 : 0.25);
      });
    };
    if (mapRef.current.isStyleLoaded()) onLoad();
    else mapRef.current.once("load", onLoad);
  }, [activeRadius]);

  return (
    <>
      <style>{`
        @keyframes brPatientPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%       { transform: scale(1.5); opacity: 0; }
        }
        @keyframes brDonorPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        .br-patient-pulse { animation: brPatientPulse 2s ease-out infinite; }
        .maplibregl-ctrl-bottom-left { bottom: 220px !important; }
        @media (min-width: 768px) {
          .maplibregl-ctrl-bottom-left { bottom: 12px !important; }
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
}
