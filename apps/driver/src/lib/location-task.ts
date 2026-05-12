/**
 * Background location task — Expo Location + TaskManager.
 *
 * Inscription/désinscription liée au statut online/offline du livreur.
 * Push position serveur via fetch tRPC direct (pas de hook React dans une
 * task). Throttle effectué via les options de la subscription Expo.
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Constants from 'expo-constants';

export const LOCATION_TASK = 'foxeats-courier-location';

TaskManager.defineTask(LOCATION_TASK, async (body) => {
  const { data, error } = body as {
    data?: { locations?: Location.LocationObject[] };
    error?: unknown;
  };
  if (error) {
    console.warn('[location-task] error', error);
    return;
  }
  const locs = data?.locations;
  if (!locs?.length) return;
  const last = locs[locs.length - 1];
  if (!last) return;
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
    'https://foxeats.vercel.app/api/trpc';
  try {
    await fetch(`${apiUrl}/couriers.publishLocation?batch=1`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        0: {
          json: {
            lat: last.coords.latitude,
            lng: last.coords.longitude,
            accuracy: last.coords.accuracy ?? undefined,
            heading: last.coords.heading ?? undefined,
            speed: last.coords.speed ?? undefined,
          },
        },
      }),
    });
  } catch (err) {
    console.warn('[location-task] publish failed', err);
  }
});

export async function startCourierLocationTracking(): Promise<{ ok: boolean; reason?: string }> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return { ok: false, reason: 'foreground_denied' };
  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') return { ok: false, reason: 'background_denied' };

  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000,
      distanceInterval: 25,
      activityType: Location.ActivityType.AutomotiveNavigation,
      pausesUpdatesAutomatically: true,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'FoxEats Driver',
        notificationBody: 'Partage de votre position pendant les livraisons.',
        notificationColor: '#FF6B5C',
      },
    });
  }
  return { ok: true };
}

export async function stopCourierLocationTracking(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}

export async function isCourierLocationTracking(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
}
