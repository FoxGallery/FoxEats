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
    <div className="relative h-[500px] overflow-hidden rounded-2xl ring-1 ring-neutral-200">
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
                fontSize: 11,
                fontWeight: 700,
                border: '2px solid white',
                boxShadow: '0 4px 10px rgba(10,23,51,0.35)',
              }}
            >
              🍽️
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
                border: '3px solid #0B3D91',
                boxShadow: '0 6px 14px rgba(11,61,145,0.45)',
                fontSize: 13,
              }}
            >
              🛵
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
