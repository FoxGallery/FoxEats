'use client';

import { useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Source, Layer, type MapRef } from 'react-map-gl/maplibre';
import { decodePolyline } from '@foxeats/maps/eta';
import { FOXEATS_LIGHT_STYLE } from '@foxeats/maps/style';
import 'maplibre-gl/dist/maplibre-gl.css';

type LatLng = { lat: number; lng: number };

type Props = {
  restaurant: LatLng;
  customer: LatLng;
  courier?: LatLng | null;
  routePolyline?: string | null;
  courierHeading?: number | null;
  heightClass?: string;
};

const MAPTILER_FALLBACK_STYLE = 'https://demotiles.maplibre.org/style.json';

export function DeliveryMap({
  restaurant,
  customer,
  courier,
  routePolyline,
  courierHeading,
  heightClass = 'h-64',
}: Props) {
  const mapRef = useRef<MapRef | null>(null);

  const style = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    return key ? FOXEATS_LIGHT_STYLE(key) : MAPTILER_FALLBACK_STYLE;
  }, []);

  const routeGeoJson = useMemo(() => {
    if (!routePolyline) return null;
    const coords = decodePolyline(routePolyline);
    return {
      type: 'Feature' as const,
      geometry: { type: 'LineString' as const, coordinates: coords },
      properties: {},
    };
  }, [routePolyline]);

  // Bounds auto pour englober resto + customer + courier
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const points: Array<[number, number]> = [
      [restaurant.lng, restaurant.lat],
      [customer.lng, customer.lat],
    ];
    if (courier) points.push([courier.lng, courier.lat]);
    if (points.length < 2) return;
    const lons = points.map((p) => p[0]);
    const lats = points.map((p) => p[1]);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ];
    map.fitBounds(bounds, { padding: 60, duration: 600 });
  }, [restaurant, customer, courier]);

  const center = courier ?? restaurant;

  return (
    <div
      className={`ring-border-strong relative overflow-hidden rounded-2xl ring-1 ${heightClass}`}
    >
      <Map
        ref={(r) => {
          mapRef.current = r;
        }}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 12 }}
        mapStyle={style}
        attributionControl={true}
      >
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#0B3D91',
                'line-width': 4,
                'line-opacity': 0.85,
              }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </Source>
        )}

        <Marker longitude={restaurant.lng} latitude={restaurant.lat} anchor="bottom">
          <Pin color="#0F2A56" kind="resto" />
        </Marker>
        <Marker longitude={customer.lng} latitude={customer.lat} anchor="bottom">
          <Pin color="#FF5A4A" kind="home" />
        </Marker>
        {courier && (
          <Marker longitude={courier.lng} latitude={courier.lat} anchor="center">
            <CourierBadge heading={courierHeading ?? null} />
          </Marker>
        )}
      </Map>
    </div>
  );
}

function Pin({ color, kind }: { color: string; kind: 'resto' | 'home' }) {
  return (
    <div
      style={{
        background: color,
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 6px 16px -4px rgba(10,23,51,0.35)',
        border: '3px solid white',
        color: '#FFFFFF',
      }}
      aria-label={kind === 'resto' ? 'Restaurant' : 'Adresse de livraison'}
    >
      {kind === 'resto' ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7a2 2 0 0 0 2 2v11M5 11a2 2 0 0 0 2-2V2M21 2v20M17 2v8c0 2 2 2 4 2" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
        </svg>
      )}
    </div>
  );
}

function CourierBadge({ heading }: { heading: number | null }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 20px -2px rgba(11,61,145,0.45)',
        border: '3px solid #0B3D91',
      }}
    >
      <div
        style={{
          transform: heading != null ? `rotate(${heading}deg)` : 'none',
          lineHeight: 1,
        }}
        aria-label="Livreur"
      >
        <svg
          width="18"
          height="18"
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
      </div>
    </div>
  );
}
