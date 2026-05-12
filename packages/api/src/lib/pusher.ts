/**
 * Wrapper Pusher Channels. No-op si `PUSHER_*` env vars absentes (dev sans
 * compte). Pour les modules qui dépendent du temps réel, on logue
 * l'événement en console pour traçabilité.
 */
import Pusher from 'pusher';

let _client: Pusher | null = null;

function client(): Pusher | null {
  if (_client) return _client;
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    return null;
  }
  _client = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
  return _client;
}

export function isPusherConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER,
  );
}

export type RealtimeChannel =
  | { kind: 'order'; id: string }
  | { kind: 'merchant'; id: string }
  | { kind: 'courier'; id: string };

function channelName(c: RealtimeChannel): string {
  // private-* car les canaux exigent une auth via /api/pusher/auth
  return `private-${c.kind}-${c.id}`;
}

export async function publish(
  channel: RealtimeChannel,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const c = client();
  if (!c) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[pusher:dev] ${channelName(channel)} :: ${event}`, data);
    }
    return;
  }
  try {
    await c.trigger(channelName(channel), event, data);
  } catch (err) {
    console.error('[pusher] trigger failed', err);
  }
}

export async function publishMany(
  channels: RealtimeChannel[],
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  await Promise.all(channels.map((c) => publish(c, event, data)));
}

export function authenticate(socketId: string, channel: string): { auth: string } | null {
  const c = client();
  if (!c) return null;
  return c.authorizeChannel(socketId, channel);
}

export { channelName };
