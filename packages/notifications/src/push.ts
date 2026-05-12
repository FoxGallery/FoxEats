// Expo Push Notifications — wrapper minimal.

type PushPayload = {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function sendPush(payload: PushPayload) {
  const messages = Array.isArray(payload.to)
    ? payload.to.map((to) => ({ to, sound: 'default', title: payload.title, body: payload.body, data: payload.data }))
    : [{ to: payload.to, sound: 'default', title: payload.title, body: payload.body, data: payload.data }];

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) {
    throw new Error(`Expo push failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<{ data: { status: 'ok' | 'error'; id?: string; message?: string }[] }>;
}
