import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, isStripeConfigured } from '@foxeats/api/lib/stripe';
import { db } from '@foxeats/db';
import { orders, orderEvents, payments, restaurants } from '@foxeats/db/schema';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const sig = (await headers()).get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'missing_signature_or_secret' }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] bad signature', err);
    return NextResponse.json({ error: 'bad_signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        if (!orderId) break;
        const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!order || order.status !== 'pending_payment') break;
        await db
          .update(orders)
          .set({ status: 'placed', placedAt: new Date(), updatedAt: new Date() })
          .where(eq(orders.id, orderId));
        await db
          .update(payments)
          .set({ status: 'succeeded' })
          .where(eq(payments.stripePaymentIntentId, pi.id));
        await db.insert(orderEvents).values({
          orderId,
          fromStatus: 'pending_payment',
          toStatus: 'placed',
          payload: { stripeEvent: event.type, paymentIntentId: pi.id },
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        if (!orderId) break;
        await db
          .update(orders)
          .set({
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: 'payment_failed',
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId));
        await db
          .update(payments)
          .set({
            status: 'failed',
            failureReason: pi.last_payment_error?.message ?? 'unknown',
          })
          .where(eq(payments.stripePaymentIntentId, pi.id));
        await db.insert(orderEvents).values({
          orderId,
          fromStatus: 'pending_payment',
          toStatus: 'cancelled',
          payload: { reason: 'payment_failed' },
        });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const piId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!piId) break;
        await db
          .update(payments)
          .set({ refundedCents: charge.amount_refunded })
          .where(eq(payments.stripePaymentIntentId, piId));
        break;
      }
      case 'account.updated': {
        const account = event.data.object;
        const restaurantId = account.metadata?.restaurantId;
        if (!restaurantId) break;
        await db
          .update(restaurants)
          .set({ updatedAt: new Date() })
          .where(eq(restaurants.id, restaurantId));
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error', event.type, err);
    return NextResponse.json({ received: true, handled: false }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
