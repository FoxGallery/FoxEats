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
    <div className={`relative overflow-hidden rounded-2xl ring-1 ring-neutral-200 ${heightClass}`}>
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
          <Pin color="#0B3D91" icon="🍽️" />
        </Marker>
        <Marker longitude={customer.lng} latitude={customer.lat} anchor="bottom">
          <Pin color="#FF6B5C" icon="📍" />
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

function Pin({ color, icon }: { color: string; icon: string }) {
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
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
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
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        🛵
      </div>
    </div>
  );
}
