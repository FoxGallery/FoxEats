import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@foxeats/auth';
import { db } from '@foxeats/db';
import { orders, restaurants } from '@foxeats/db/schema';
import { and, eq } from 'drizzle-orm';
import { receiptHtml } from '@foxeats/notifications';
import { receiptVatCents } from '@foxeats/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.customerId, session.user.id)))
    .limit(1);
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, order.restaurantId))
    .limit(1);

  const html = receiptHtml({
    shortCode: order.shortCode,
    restaurantName: restaurant?.name ?? 'Restaurant',
    customerName: session.user.name ?? null,
    totalCents: order.totalCents,
    trackingUrl: '',
    items: (order.items as Array<{ name: string; quantity: number; unitPriceCents: number }>) ?? [],
    breakdown: {
      subtotalCents: order.subtotalCents,
      serviceFeeCents: order.serviceFeeCents,
      deliveryFeeCents: order.deliveryFeeCents,
      tipCents: order.tipCents,
      discountCents: order.discountCents,
    },
    vatCents: receiptVatCents(order),
    deliveredAt: order.deliveredAt ?? undefined,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, max-age=0, no-store',
      'content-disposition': `inline; filename="recu-foxeats-${order.shortCode}.html"`,
    },
  });
}
