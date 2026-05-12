/**
 * ETA dynamique via OSRM public (router.project-osrm.org).
 * Fallback haversine + vitesse moyenne 25 km/h si OSRM indisponible.
 *
 * NB : le service public OSRM a un fair-use à ~1 req/s. Pour de la prod
 * on devra soit self-host osrm-backend, soit migrer sur ORS/Mapbox
 * Directions. Le wrapper accepte un baseUrl optionnel pour pointer
 * sur autre chose.
 */

import { haversineDistanceKm, type LatLng } from './index';

const OSRM_PUBLIC = 'https://router.project-osrm.org';
const FALLBACK_AVG_KMH = 25;

export type Route = {
  durationSeconds: number;
  distanceMeters: number;
  /** Encoded polyline (Google polyline algorithm) — affichable directement par
   *  MapLibre via `decode()` côté client. */
  geometry: string | null;
  /** True si la route vient d'OSRM, false si fallback haversine. */
  precise: boolean;
};

export async function routeBetween(
  a: LatLng,
  b: LatLng,
  opts?: { baseUrl?: string; signal?: AbortSignal; profile?: 'driving' | 'cycling' | 'foot' },
): Promise<Route> {
  const profile = opts?.profile ?? 'driving';
  const base = opts?.baseUrl ?? OSRM_PUBLIC;
  const url = `${base}/route/v1/${profile}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=simplified&geometries=polyline`;
  try {
    const res = await fetch(url, { signal: opts?.signal });
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{ duration: number; distance: number; geometry: string }>;
    };
    if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('OSRM no route');
    const r = data.routes[0];
    return {
      durationSeconds: Math.round(r.duration),
      distanceMeters: Math.round(r.distance),
      geometry: r.geometry,
      precise: true,
    };
  } catch {
    // Fallback : distance haversine + vitesse moyenne profil.
    const km = haversineDistanceKm(a, b);
    const speed = profile === 'foot' ? 5 : profile === 'cycling' ? 15 : FALLBACK_AVG_KMH;
    return {
      durationSeconds: Math.round((km / speed) * 3600),
      distanceMeters: Math.round(km * 1000),
      geometry: null,
      precise: false,
    };
  }
}

/**
 * ETA combiné livreur→resto→client. Utilisé par l'écran customer
 * pour afficher "Arrivée vers HH:mm" et par l'app driver pour estimer
 * la course.
 */
export async function deliveryEta(args: {
  courier: LatLng | null;
  restaurant: LatLng;
  customer: LatLng;
  /** Marge serveur : temps prep restant en secondes, à additionner. */
  prepRemainingSeconds?: number;
  signal?: AbortSignal;
  baseUrl?: string;
  profile?: 'driving' | 'cycling';
}): Promise<{
  totalSeconds: number;
  legs: { courierToRestaurant?: Route; restaurantToCustomer: Route };
  precise: boolean;
}> {
  const restaurantToCustomer = await routeBetween(args.restaurant, args.customer, {
    signal: args.signal,
    baseUrl: args.baseUrl,
    profile: args.profile ?? 'driving',
  });

  let courierToRestaurant: Route | undefined;
  if (args.courier) {
    courierToRestaurant = await routeBetween(args.courier, args.restaurant, {
      signal: args.signal,
      baseUrl: args.baseUrl,
      profile: args.profile ?? 'driving',
    });
  }

  const prep = args.prepRemainingSeconds ?? 0;
  // ETA = max(prep, courier→resto) + resto→client, pour modéliser que le
  // livreur attend la prep et qu'on ne déduit pas la prep une fois sur place.
  const courierWait = courierToRestaurant
    ? Math.max(prep, courierToRestaurant.durationSeconds)
    : prep;
  const totalSeconds = courierWait + restaurantToCustomer.durationSeconds;
  const precise =
    restaurantToCustomer.precise && (!courierToRestaurant || courierToRestaurant.precise);

  return {
    totalSeconds,
    legs: { courierToRestaurant, restaurantToCustomer },
    precise,
  };
}

/** Décode une polyline Google encoded en coordonnées [lng, lat]. */
export function decodePolyline(str: string, precision = 5): Array<[number, number]> {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<[number, number]> = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    result = 0;
    shift = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    coordinates.push([lng / factor, lat / factor]);
  }
  return coordinates;
}
