'use client';

import { useEffect, useRef } from 'react';
import type { Map, Marker } from 'leaflet';
import { ALL_VENUES, TIER_STYLE } from './venueData';
import type { Tier } from './venueData';

interface VenueMapProps {
  activeTier?: Tier | null;
  activeRegion?: string | null;
}

export default function VenueMap({ activeTier, activeRegion }: VenueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const activeTierRef = useRef(activeTier);
  const activeRegionRef = useRef(activeRegion);
  useEffect(() => { activeTierRef.current = activeTier; }, [activeTier]);
  useEffect(() => { activeRegionRef.current = activeRegion; }, [activeRegion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    let map: Map | null = null;

    import('leaflet').then((mod) => {
      const L = mod.default ?? (window as unknown as { L: typeof import('leaflet') }).L;
      if (!L) return;
      if (!containerRef.current) return;
      if (mapRef.current) return;

      map = L.map(containerRef.current, {
        center: [53.5, -1.8],
        zoom: 6,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
          attribution: '© <a href="https://carto.com/" target="_blank">CartoDB</a>',
        }
      ).addTo(map);

      ALL_VENUES.forEach((v) => {
        const s = TIER_STYLE[v.tier];

        const pulseRing = s.pulse
          ? `<div style="
              position:absolute;inset:-6px;border-radius:50%;
              border:2px solid ${s.bg};opacity:0.5;
              animation:pulse-ring 1.8s ease-out infinite;
            "></div>`
          : '';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:44px;height:44px;">
              ${pulseRing}
              <div style="
                position:absolute;inset:0;
                border-radius:50%;
                background:${s.bg};
                border:2.5px solid rgba(255,255,255,0.95);
                box-shadow:0 3px 12px rgba(0,0,0,0.2);
                display:flex;align-items:center;justify-content:center;
                flex-direction:column;
              ">
                <span style="
                  font-size:11px;font-weight:700;
                  color:${s.text};line-height:1;
                  font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                ">${v.score}</span>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -26],
        });

        const marker = L.marker([v.lat, v.lng], { icon })
          .addTo(map!)
          .bindPopup(
            `<div style="min-width:130px;">
               <div style="font-weight:600;font-size:13px;color:#0A0A0A;margin-bottom:5px;letter-spacing:-0.01em;">${v.name}</div>
               <div style="font-size:11px;color:#6B6970;margin-bottom:4px;">Score ${v.score} &nbsp;·&nbsp; ${v.satisfaction}★</div>
               <span style="
                 display:inline-block;font-size:10px;font-weight:600;
                 letter-spacing:0.04em;text-transform:uppercase;
                 color:${s.textPastel};background:${s.bgPastel};
                 padding:2px 7px;border-radius:99px;
               ">${s.label}</span>
             </div>`,
            { closeButton: false, maxWidth: 180 }
          );

        markersRef.current.push(marker);
      });

      const t = activeTierRef.current;
      const r = activeRegionRef.current;
      ALL_VENUES.forEach((v, i) => {
        const visible = (t == null || t === v.tier) && (r == null || r === v.region);
        if (!visible) markersRef.current[i]?.remove();
      });
      const initialVisible = ALL_VENUES.filter(v =>
        (t == null || t === v.tier) && (r == null || r === v.region)
      );
      const boundsVenues = initialVisible.length > 0 ? initialVisible : ALL_VENUES;
      map.fitBounds(
        L.latLngBounds(boundsVenues.map(v => [v.lat, v.lng] as [number, number])),
        { padding: [40, 40] }
      );

      // Force tile re-render after layout settles (needed when container
      // size wasn't stable at init time)
      requestAnimationFrame(() => map?.invalidateSize());

      mapRef.current = map;
    }).catch(() => {});

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      } else if (map) {
        // import resolved but mapRef not yet assigned when cleanup ran
        map.remove();
      }
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    ALL_VENUES.forEach((v, i) => {
      const marker = markersRef.current[i];
      if (!marker) return;
      const visible =
        (activeTier == null || activeTier === v.tier) &&
        (activeRegion == null || activeRegion === v.region);
      if (visible && !map.hasLayer(marker)) marker.addTo(map);
      if (!visible && map.hasLayer(marker)) marker.remove();
    });

    import('leaflet').then((mod) => {
      const L = mod.default ?? (window as unknown as { L: typeof import('leaflet') }).L;
      const visible = ALL_VENUES.filter(v =>
        (activeTier == null || activeTier === v.tier) &&
        (activeRegion == null || activeRegion === v.region)
      );
      if (visible.length > 0) {
        const bounds = L.latLngBounds(visible.map(v => [v.lat, v.lng] as [number, number]));
        map.flyToBounds(bounds, { padding: [60, 60], duration: 0.5 });
      }
    });
  }, [activeTier, activeRegion]);

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.5; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-control-zoom a {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
          color: #6B6970 !important;
          border-color: rgba(0,0,0,0.08) !important;
        }
        .leaflet-control-zoom a:hover { background: #F6F6F9 !important; }
      `}</style>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </>
  );
}
