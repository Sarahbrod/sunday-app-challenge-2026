'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type * as LeafletTypes from 'leaflet';

export type Tier = 'top' | 'good' | 'watch' | 'risk';

export interface MapVenue {
  name: string;
  lat: number;
  lng: number;
  score: number;
  satisfaction: number;
  tier: Tier;
  region: string;
}

export const ALL_VENUES: MapVenue[] = [
  { name: "King's Cross",  lat: 51.5351, lng: -0.1248, score: 94, satisfaction: 4.8, tier: 'top',   region: 'London'     },
  { name: 'Shoreditch',    lat: 51.5231, lng: -0.0748, score: 91, satisfaction: 4.7, tier: 'top',   region: 'London'     },
  { name: 'Liverpool St',  lat: 51.5178, lng: -0.1090, score: 83, satisfaction: 4.4, tier: 'good',  region: 'London'     },
  { name: 'Manchester',    lat: 53.4836, lng: -2.2493, score: 82, satisfaction: 4.4, tier: 'good',  region: 'Manchester' },
  { name: 'Kensington',    lat: 51.4988, lng: -0.1943, score: 80, satisfaction: 4.3, tier: 'good',  region: 'London'     },
  { name: 'Edinburgh',     lat: 55.9528, lng: -3.1872, score: 79, satisfaction: 4.3, tier: 'good',  region: 'Edinburgh'  },
  { name: 'Battersea',     lat: 51.4835, lng: -0.1440, score: 78, satisfaction: 4.2, tier: 'good',  region: 'London'     },
  { name: 'Birmingham',    lat: 52.4796, lng: -1.9026, score: 74, satisfaction: 4.2, tier: 'watch', region: 'Birmingham' },
  { name: 'Carnaby',       lat: 51.5131, lng: -0.1385, score: 71, satisfaction: 4.1, tier: 'watch', region: 'London'     },
  { name: 'Covent Garden', lat: 51.5131, lng: -0.1260, score: 65, satisfaction: 4.0, tier: 'risk',  region: 'London'     },
];

export const TIER_STYLE: Record<Tier, {
  bg: string; text: string;
  bgPastel: string; textPastel: string;
  label: string; pulse?: boolean;
}> = {
  top:   { bg: '#2E7D52', text: '#FFFFFF', bgPastel: '#C5E8D7', textPastel: '#1A5433', label: 'Top performer' },
  good:  { bg: '#3B72C0', text: '#FFFFFF', bgPastel: '#C8D9F5', textPastel: '#1E3D73', label: 'On target' },
  watch: { bg: '#F0B680', text: '#72430B', bgPastel: '#FAE6CC', textPastel: '#72430B', label: 'Needs attention' },
  risk:  { bg: '#E77171', text: '#6F0C23', bgPastel: '#FAD5D5', textPastel: '#6F0C23', label: 'At risk', pulse: true },
};

interface VenueMapProps {
  activeTier?: Tier | null;
  activeRegion?: string | null;
}

export default function VenueMap({ activeTier, activeRegion }: VenueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletTypes.Map | null>(null);
  const markersRef = useRef<LeafletTypes.Marker[]>([]);
  // Refs keep filter values readable inside the async init closure
  const activeTierRef = useRef(activeTier);
  const activeRegionRef = useRef(activeRegion);
  useEffect(() => { activeTierRef.current = activeTier; }, [activeTier]);
  useEffect(() => { activeRegionRef.current = activeRegion; }, [activeRegion]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
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
          .addTo(map)
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

      // Apply any filter state that existed before the map finished loading
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

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // Show/hide markers and fly to bounds when either filter changes
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

    import('leaflet').then(({ default: L }) => {
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
