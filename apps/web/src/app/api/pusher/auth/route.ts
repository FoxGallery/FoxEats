import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@foxeats/auth';
import { authenticate } from '@foxeats/api/lib/pusher';
import { db } from '@foxeats/db';
import { orders, restaurants, couriers } from '@foxeats/db/schema';
import { and, eq } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * Pusher private channel authentication.
 * Channels: private-order-{id}, private-merchant-{id}, private-courier-{id}.
 * Auth strict: l'user doit avoir un lien légitime (customer de l'ordre,
 * owner du resto, ou le livreur lui-même).
 */
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const socketId = String(form.get('socket_id') ?? '');
  const channel = String(form.get('channel_name') ?? '');
  if (!socketId || !channel.startsWith('private-')) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  // Validation du droit d'accès au canal
  const match = channel.match(/^private-(order|merchant|courier)-(.+)$/);
  if (!match || !match[2]) return NextResponse.json({ error: 'unknown_channel' }, { status: 403 });
  const kind = match[1] as 'order' | 'merchant' | 'courier';
  const id: string = match[2];
  const userId = session.user.id;

  let allowed = false;
  if (kind === 'order') {
    const [o] = await db
      .select({
        customerId: orders.customerId,
        restaurantId: orders.restaurantId,
        courierId: orders.courierId,
      })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    if (o) {
      if (o.customerId === userId || o.courierId === userId) allowed = true;
      else {
        const [r] = await db
          .select({ ownerId: restaurants.ownerId })
          .from(restaurants)
          .where(eq(restaurants.id, o.restaurantId))
          .limit(1);
        if (r?.ownerId === userId) allowed = true;
      }
    }
  } else if (kind === 'merchant') {
    const [r] = await db
      .select({ ownerId: restaurants.ownerId })
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);
    allowed = r?.ownerId === userId;
  } else if (kind === 'courier') {
    const [c] = await db
      .select({ userId: couriers.userId })
      .from(couriers)
      .where(and(eq(couriers.id, id), eq(couriers.userId, userId)))
      .limit(1);
    allowed = !!c;
  }

  if (!allowed) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const authPayload = authenticate(socketId, channel);
  if (!authPayload) {
    return NextResponse.json({ error: 'pusher_not_configured' }, { status: 503 });
  }
  return NextResponse.json(authPayload);
}
