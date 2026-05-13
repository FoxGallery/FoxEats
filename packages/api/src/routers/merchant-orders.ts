import { z } from 'zod';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { router, merchantProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { orders, restaurants, users } from '@foxeats/db/schema';
import { transitionOrder } from '../lib/order-state';
import { publish, publishMany } from '../lib/pusher';
import { stripe, isStripeConfigured } from '../lib/stripe';
import { sendOrderPlaced, sendOrderCancelled, sendOrderDelivered } from '@foxeats/notifications';
import { sendPush } from '@foxeats/notifications';
import { pushNotification, notifyTemplates } from '../lib/notify';
import { quote } from '@foxeats/cart';

async function assertOwner(
  db: typeof orders extends never ? never : Parameters<typeof transitionOrder>[0]['db'],
  orderId: string,
  userId: string,
): Promise<{
  order: typeof orders.$inferSelect;
  restaurant: typeof restaurants.$inferSelect;
}> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, order.restaurantId))
    .limit(1);
  if (!restaurant || restaurant.ownerId !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return { order, restaurant };
}

async function notifyCustomerStatus(args: {
  db: Parameters<typeof transitionOrder>[0]['db'];
  orderId: string;
  status: string;
}) {
  // Publication temps réel sur le canal commande
  await publish({ kind: 'order', id: args.orderId }, 'status', { status: args.status });
}

export const merchantOrdersRouter = router({
  list: merchantProcedure
    .input(
      z
        .object({
          restaurantId: z.string().uuid().optional(),
          status: z.array(z.string()).optional(),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const myRestaurants = await ctx.db
        .select({ id: restaurants.id })
        .from(restaurants)
        .where(eq(restaurants.ownerId, ctx.session.user.id));
      const restaurantIds = input.restaurantId
        ? [input.restaurantId]
        : myRestaurants.map((r) => r.id);
      if (restaurantIds.length === 0) return { items: [] };
      const where = [inArray(orders.restaurantId, restaurantIds)];
      if (input.status?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where.push(inArray(orders.status, input.status as any));
      }
      const items = await ctx.db
        .select()
        .from(orders)
        .where(and(...where))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit);
      return { items };
    }),

  accept: merchantProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { order, restaurant } = await assertOwner(ctx.db, input.orderId, ctx.session.user.id);
      const result = await transitionOrder({
        db: ctx.db,
        orderId: input.orderId,
        to: 'accepted_by_restaurant',
        actorUserId: ctx.session.user.id,
        expectedFrom: 'placed',
      });
      if (!result) return { ok: false, reason: 'already_transitioned' as const };

      // Capture le PaymentIntent (capture_method=manual au moment de place)
      if (order.stripePaymentIntentId && isStripeConfigured()) {
        try {
          await stripe().paymentIntents.capture(order.stripePaymentIntentId);
        } catch (err) {
          console.warn('[merchant.accept] stripe capture failed', err);
        }
      }

      await notifyCustomerStatus({
        db: ctx.db,
        orderId: order.id,
        status: 'accepted_by_restaurant',
      });

      // Email + push customer
      const [customer] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, order.customerId))
        .limit(1);
      if (customer?.email) {
        const items =
          (order.items as Array<{ name: string; quantity: number; unitPriceCents: number }>) ?? [];
        try {
          await sendOrderPlaced(customer.email, {
            shortCode: order.shortCode,
            restaurantName: restaurant.name,
            customerName: customer.name,
            totalCents: order.totalCents,
            trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app'}/app/orders/${order.id}`,
            items,
            breakdown: {
              subtotalCents: order.subtotalCents,
              serviceFeeCents: order.serviceFeeCents,
              deliveryFeeCents: order.deliveryFeeCents,
              tipCents: order.tipCents,
              discountCents: order.discountCents,
            },
          });
        } catch (err) {
          console.warn('[merchant.accept] sendOrderPlaced failed', err);
        }
      }
      // In-app notif
      const accT = notifyTemplates.orderAccepted(order.shortCode, restaurant.name);
      await pushNotification(ctx.db, {
        userId: order.customerId,
        kind: 'order_accepted',
        title: accT.title,
        body: accT.body,
        href: `/app/orders/${order.id}`,
        data: { orderId: order.id, restaurantId: order.restaurantId },
      });
      return { ok: true as const };
    }),

  reject: merchantProcedure
    .input(z.object({ orderId: z.string().uuid(), reason: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { order, restaurant } = await assertOwner(ctx.db, input.orderId, ctx.session.user.id);
      await transitionOrder({
        db: ctx.db,
        orderId: input.orderId,
        to: 'rejected_by_restaurant',
        actorUserId: ctx.session.user.id,
        expectedFrom: 'placed',
        payload: { reason: input.reason },
      });

      if (order.stripePaymentIntentId && isStripeConfigured()) {
        try {
          await stripe().paymentIntents.cancel(order.stripePaymentIntentId);
        } catch (err) {
          console.warn('[merchant.reject] stripe cancel failed', err);
        }
      }

      await transitionOrder({
        db: ctx.db,
        orderId: input.orderId,
        to: 'refunded',
        actorUserId: ctx.session.user.id,
        expectedFrom: 'rejected_by_restaurant',
        payload: { autoRefundReason: 'merchant_rejected' },
      });

      await notifyCustomerStatus({
        db: ctx.db,
        orderId: order.id,
        status: 'rejected_by_restaurant',
      });

      const [customer] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, order.customerId))
        .limit(1);
      if (customer?.email) {
        const items =
          (order.items as Array<{ name: string; quantity: number; unitPriceCents: number }>) ?? [];
        await sendOrderCancelled(customer.email, {
          shortCode: order.shortCode,
          restaurantName: restaurant.name,
          customerName: customer.name,
          totalCents: order.totalCents,
          trackingUrl: '',
          items,
          breakdown: {
            subtotalCents: order.subtotalCents,
            serviceFeeCents: order.serviceFeeCents,
            deliveryFeeCents: order.deliveryFeeCents,
            tipCents: order.tipCents,
            discountCents: order.discountCents,
          },
          reason: input.reason ?? 'Refus du restaurant',
        });
      }
      return { ok: true as const };
    }),

  markPreparing: merchantProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx.db, input.orderId, ctx.session.user.id);
      await transitionOrder({
        db: ctx.db,
        orderId: input.orderId,
        to: 'preparing',
        actorUserId: ctx.session.user.id,
        expectedFrom: 'accepted_by_restaurant',
      });
      await notifyCustomerStatus({ db: ctx.db, orderId: input.orderId, status: 'preparing' });
      // In-app notif
      const [ord] = await ctx.db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (ord) {
        const t = notifyTemplates.orderPreparing(ord.shortCode);
        await pushNotification(ctx.db, {
          userId: ord.customerId,
          kind: 'order_preparing',
          title: t.title,
          body: t.body,
          href: `/app/orders/${ord.id}`,
          data: { orderId: ord.id },
        });
      }
      return { ok: true as const };
    }),

  markReady: merchantProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { order } = await assertOwner(ctx.db, input.orderId, ctx.session.user.id);
      await transitionOrder({
        db: ctx.db,
        orderId: input.orderId,
        to: 'ready_for_pickup',
        actorUserId: ctx.session.user.id,
        expectedFrom: 'preparing',
      });
      await notifyCustomerStatus({
        db: ctx.db,
        orderId: input.orderId,
        status: 'ready_for_pickup',
      });
      // Notifie aussi le canal merchant (KDS auto-refresh)
      await publish({ kind: 'merchant', id: order.restaurantId }, 'order:ready', {
        orderId: order.id,
      });
      // In-app notif
      const tR = notifyTemplates.orderReady(order.shortCode);
      await pushNotification(ctx.db, {
        userId: order.customerId,
        kind: 'order_ready',
        title: tR.title,
        body: tR.body,
        href: `/app/orders/${order.id}`,
        data: { orderId: order.id },
      });
      return { ok: true as const };
    }),

  /** Endpoint de simulation pour M4: marquer la commande livrée sans
   *  passer par le flow livreur (M7). Utile pour les tests beta. */
  simulateDelivered: merchantProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { order, restaurant } = await assertOwner(ctx.db, input.orderId, ctx.session.user.id);
      // Chain transitions via la state machine
      await transitionOrder({
        db: ctx.db,
        orderId: order.id,
        to: 'courier_assigned',
        expectedFrom: 'ready_for_pickup',
        actorUserId: ctx.session.user.id,
        payload: { simulated: true },
      });
      await transitionOrder({
        db: ctx.db,
        orderId: order.id,
        to: 'picked_up',
        expectedFrom: 'courier_assigned',
        actorUserId: ctx.session.user.id,
      });
      await transitionOrder({
        db: ctx.db,
        orderId: order.id,
        to: 'in_delivery',
        expectedFrom: 'picked_up',
        actorUserId: ctx.session.user.id,
      });
      await transitionOrder({
        db: ctx.db,
        orderId: order.id,
        to: 'delivered',
        expectedFrom: 'in_delivery',
        actorUserId: ctx.session.user.id,
      });
      await publishMany([{ kind: 'order', id: order.id }], 'status', { status: 'delivered' });

      const [customer] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, order.customerId))
        .limit(1);
      if (customer?.email) {
        const items =
          (order.items as Array<{ name: string; quantity: number; unitPriceCents: number }>) ?? [];
        await sendOrderDelivered(customer.email, {
          shortCode: order.shortCode,
          restaurantName: restaurant.name,
          customerName: customer.name,
          totalCents: order.totalCents,
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app'}/app/orders/${order.id}`,
          items,
          breakdown: {
            subtotalCents: order.subtotalCents,
            serviceFeeCents: order.serviceFeeCents,
            deliveryFeeCents: order.deliveryFeeCents,
            tipCents: order.tipCents,
            discountCents: order.discountCents,
          },
        });
      }
      // In-app notif livraison + invitation review
      const dT = notifyTemplates.orderDelivered(order.shortCode, restaurant.name);
      await pushNotification(ctx.db, {
        userId: order.customerId,
        kind: 'order_delivered',
        title: dT.title,
        body: dT.body,
        href: `/app/orders/${order.id}`,
        data: { orderId: order.id },
      });
      const rT = notifyTemplates.reviewRequest(restaurant.name);
      await pushNotification(ctx.db, {
        userId: order.customerId,
        kind: 'review_request',
        title: rT.title,
        body: rT.body,
        href: `/app/orders/${order.id}`,
        data: { orderId: order.id, restaurantId: order.restaurantId },
      });
      return { ok: true as const };
    }),
});

// Helper to compute the receipt VAT amount based on the same logic as quote()
export function receiptVatCents(order: typeof orders.$inferSelect): number {
  const items =
    (order.items as Array<{
      unitPriceCents: number;
      quantity: number;
      options: Array<{ priceDeltaCents: number }>;
    }>) ?? [];
  const q = quote({
    lines: items.map((i) => ({
      unitPriceCents: i.unitPriceCents,
      quantity: i.quantity,
      options: (i.options ?? []).map((o) => ({
        id: '',
        name: '',
        priceDeltaCents: o.priceDeltaCents,
      })),
    })),
    deliveryFeeCents: order.deliveryFeeCents,
  });
  return q.vatCents;
}

// Suppress unused import warning for sendPush — kept available for future
// per-transition push notifications.
void sendPush;
