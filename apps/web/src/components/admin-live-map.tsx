'use client';

import { useEffect, useMemo, useRef } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/maplibre';
import { FOXEATS_LIGHT_STYLE, RIVIERA_CITY_CENTERS } from '@foxeats/maps/style';
import 'maplibre-gl/dist/maplibre-gl.css';

const FALLBACK_STYLE = 'https://demotiles.maplibre.org/style.json';

type Order = {
  id: string;
  shortCode: string;
  status: string;
  restaurantLat: number;
  restaurantLng: number;
  restaurantName: string | null;
};
type Courier = {
  id: string;
  vehicle: string;
  lat: number;
  lng: number;
};

export function AdminLiveMap({ orders, couriers }: { orders: Order[]; couriers: Courier[] }) {
  const mapRef = useRef<MapRef | null>(null);
  const style = useMemo(() => {
    const k = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    return k ? FOXEATS_LIGHT_STYLE(k) : FALLBACK_STYLE;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const points: Array<[number, number]> = [
      ...orders.map((o) => [o.restaurantLng, o.restaurantLat] as [number, number]),
      ...couriers.map((c) => [c.lng, c.lat] as [number, number]),
    ];
    if (points.length === 0) return;
    const lons = points.map((p) => p[0]);
    const lats = points.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 80, duration: 600 },
    );
  }, [orders, couriers]);

  return (
    <div className="ring-border-strong relative h-[500px] overflow-hidden rounded-2xl ring-1">
      <Map
        ref={(r) => {
          mapRef.current = r;
        }}
        initialViewState={{
          longitude: RIVIERA_CITY_CENTERS.nice.lng,
          latitude: RIVIERA_CITY_CENTERS.nice.lat,
          zoom: 9,
        }}
        mapStyle={style}
      >
        {orders.map((o) => (
          <Marker key={o.id} longitude={o.restaurantLng} latitude={o.restaurantLat} anchor="bottom">
            <span
              title={`#${o.shortCode} · ${o.restaurantName} · ${o.status}`}
              style={{
                background: tone(o.status),
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                color: 'white',
                border: '2px solid white',
                boxShadow: '0 4px 10px rgba(10,23,51,0.35)',
              }}
              aria-label="Restaurant"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 2v7a2 2 0 0 0 2 2v11M5 11a2 2 0 0 0 2-2V2M21 2v20M17 2v8c0 2 2 2 4 2" />
              </svg>
            </span>
          </Marker>
        ))}
        {couriers.map((c) => (
          <Marker key={c.id} longitude={c.lng} latitude={c.lat} anchor="center">
            <span
              title={`Livreur · ${c.vehicle}`}
              style={{
                background: '#fff',
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                border: '3px solid #0F2A56',
                boxShadow: '0 6px 14px rgba(15,42,86,0.45)',
                color: '#0F2A56',
              }}
              aria-label="Livreur"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18.5" cy="17.5" r="3.5" />
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="15" cy="5" r="1" />
                <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
              </svg>
            </span>
          </Marker>
        ))}
      </Map>
    </div>
  );
}

function tone(status: string): string {
  if (['placed', 'accepted_by_restaurant'].includes(status)) return '#FF6B5C';
  if (['preparing', 'ready_for_pickup'].includes(status)) return '#E6A100';
  if (['courier_assigned', 'picked_up', 'in_delivery'].includes(status)) return '#0B3D91';
  return '#5B6478';
}
