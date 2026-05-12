import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { decodePolyline } from '@foxeats/maps/eta';
import { FOXEATS_LIGHT_STYLE } from '@foxeats/maps/style';
import Constants from 'expo-constants';

type LatLng = { lat: number; lng: number };

type Props = {
  restaurant: LatLng;
  customer: LatLng;
  courier?: LatLng | null;
  routePolyline?: string | null;
  height?: number;
};

const FALLBACK_STYLE = 'https://demotiles.maplibre.org/style.json';

/**
 * Wrapper minimal pour MapLibre RN. Le module @maplibre/maplibre-react-native
 * doit être linké côté natif via expo prebuild ou un dev client.
 * Quand on est en Expo Go (sans natif), on rend un fallback léger.
 */
export function DeliveryMap({ restaurant, customer, courier, routePolyline, height = 240 }: Props) {
  // Charge dynamique pour ne pas casser le bundle Expo Go.
  const MapLibre = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('@maplibre/maplibre-react-native');
    } catch {
      return null;
    }
  }, []);

  const styleUrl = process.env.EXPO_PUBLIC_MAPTILER_KEY
    ? FOXEATS_LIGHT_STYLE(process.env.EXPO_PUBLIC_MAPTILER_KEY)
    : (Constants.expoConfig?.extra?.maptilerKey as string | undefined)
      ? FOXEATS_LIGHT_STYLE(Constants.expoConfig!.extra!.maptilerKey as string)
      : FALLBACK_STYLE;

  if (!MapLibre) {
    return (
      <MapFallback restaurant={restaurant} customer={customer} courier={courier} height={height} />
    );
  }

  const { MapView, Camera, MarkerView, ShapeSource, LineLayer } = MapLibre;
  const coords = routePolyline ? decodePolyline(routePolyline) : null;

  const points = [
    [restaurant.lng, restaurant.lat],
    [customer.lng, customer.lat],
    ...(courier ? [[courier.lng, courier.lat]] : []),
  ];
  const lons = points.map((p) => p[0] ?? 0);
  const lats = points.map((p) => p[1] ?? 0);
  const bounds = {
    ne: [Math.max(...lons, -180), Math.max(...lats, -90)],
    sw: [Math.min(...lons, 180), Math.min(...lats, 90)],
  };

  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden' }}>
      <MapView
        style={{ flex: 1 }}
        mapStyle={styleUrl}
        attributionEnabled
        compassEnabled={false}
        logoEnabled={false}
      >
        <Camera
          bounds={bounds}
          animationDuration={600}
          padding={{ paddingTop: 60, paddingBottom: 60, paddingLeft: 60, paddingRight: 60 }}
        />
        {coords && (
          <ShapeSource
            id="route"
            shape={{
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: coords },
              properties: {},
            }}
          >
            <LineLayer
              id="route-line"
              style={{ lineColor: '#0B3D91', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
            />
          </ShapeSource>
        )}
        <MarkerView coordinate={[restaurant.lng, restaurant.lat]}>
          <Pin color="#0B3D91" icon="🍽️" />
        </MarkerView>
        <MarkerView coordinate={[customer.lng, customer.lat]}>
          <Pin color="#FF6B5C" icon="📍" />
        </MarkerView>
        {courier && (
          <MarkerView coordinate={[courier.lng, courier.lat]}>
            <Pin color="#FFFFFF" icon="🛵" border="#0B3D91" />
          </MarkerView>
        )}
      </MapView>
    </View>
  );
}

function Pin({
  color,
  icon,
  border = '#FFFFFF',
}: {
  color: string;
  icon: string;
  border?: string;
}) {
  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: color,
        borderWidth: 3,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0A1733',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
    </View>
  );
}

function MapFallback({
  restaurant,
  customer,
  courier,
  height,
}: {
  restaurant: LatLng;
  customer: LatLng;
  courier?: LatLng | null;
  height: number;
}) {
  return (
    <View
      style={{
        height,
        borderRadius: 16,
        backgroundColor: '#EEEFF2',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 13, color: '#5B6478', textAlign: 'center' }}>
        Carte MapLibre indisponible dans Expo Go.{'\n'}
        Construire un dev client EAS pour activer la cartographie native.
      </Text>
      <Text style={{ fontSize: 10, color: '#9AA1B0', marginTop: 8 }}>
        Resto {restaurant.lat.toFixed(3)},{restaurant.lng.toFixed(3)} · Vous{' '}
        {customer.lat.toFixed(3)},{customer.lng.toFixed(3)}
        {courier ? ` · Livreur ${courier.lat.toFixed(3)},${courier.lng.toFixed(3)}` : ''}
      </Text>
    </View>
  );
}
