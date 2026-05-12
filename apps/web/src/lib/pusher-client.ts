'use client';

import { useEffect, useRef } from 'react';
import PusherClient from 'pusher-js';

let _client: PusherClient | null = null;

function getClient(): PusherClient | null {
  if (_client) return _client;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu';
  if (!key) return null;
  _client = new PusherClient(key, {
    cluster,
    forceTLS: true,
    authEndpoint: '/api/pusher/auth',
  });
  return _client;
}

/**
 * Subscribe to a private Pusher channel and run `onEvent` on each event of
 * the given name. No-op si Pusher non configuré (les pages ont déjà un
 * fallback polling).
 */
export function usePrivateChannel(
  channel: string | null,
  eventName: string,
  onEvent: (data: unknown) => void,
) {
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    if (!channel) return;
    const client = getClient();
    if (!client) return;
    const ch = client.subscribe(channel);
    const handler = (data: unknown) => cbRef.current(data);
    ch.bind(eventName, handler);
    return () => {
      ch.unbind(eventName, handler);
      client.unsubscribe(channel);
    };
  }, [channel, eventName]);
}
