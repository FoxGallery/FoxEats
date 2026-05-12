import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import {
  orders,
  orderEvents,
  restaurants,
  menuItems,
  payments as paymentsTable,
} from '@foxeats/db/schema';
import { quote } from '@foxeats/cart';
import { TRPCError } from '@trpc/server';
import { stripe, isStripeConfigured } from '../lib/stripe';

const shortCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: 6 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');
};

export const ordersRouter = router({
  myOrders: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).default({ limit: 20 }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select()
        .from(orders)
        .where(eq(orders.customerId, ctx.session.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit);
      return { items };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.id), eq(orders.customerId, ctx.session.user.id)))
        .limit(1);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      return order;
    }),

  /**
   * Place une commande : (1) re-quote serveur strict (anti-tampering),
   * (2) insère la ligne en `pending_payment`, (3) crée un PaymentIntent
   * Stripe Connect destination=resto. Le PaymentIntent capture les
   * fonds dès confirmation client; la création de la commande définitive
   * (passage `placed → accepted_by_restaurant`) est faite côté webhook
   * payment_intent.succeeded.
   */
  place: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().uuid(),
        lines: z
          .array(
            z.object({
              menuItemId: z.string().uuid(),
              quantity: z.number().int().min(1).max(99),
              options: z
                .array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    priceDeltaCents: z.number().int(),
                  }),
                )
                .default([]),
              notes: z.string().max(500).optional(),
            }),
          )
          .min(1)
          .max(50),
        deliveryAddress: z.object({
          street: z.string(),
          city: z.string(),
          postalCode: z.string(),
          country: z.string().default('FR'),
          lat: z.number(),
          lng: z.number(),
          instructions: z.string().optional(),
        }),
        tipCents: z.number().int().min(0).max(10_000).default(0),
        foxCoinsAppliedCents: z.number().int().min(0).max(10_000).default(0),
        customerNotes: z.string().max(1000).optional(),
        paymentMethod: z.enum(['card', 'apple_pay', 'google_pay', 'sepa', 'cash_on_delivery']),
        scheduledFor: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [resto] = await ctx.db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!resto || resto.status !== 'active') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Restaurant indisponible' });
      }

      const serverItems = await ctx.db
        .select({
          id: menuItems.id,
          priceCents: menuItems.priceCents,
          name: menuItems.name,
          isAvailable: menuItems.isAvailable,
        })
        .from(menuItems)
        .where(eq(menuItems.restaurantId, resto.id));
      const itemMap = new Map(serverItems.map((i) => [i.id, i]));

      const quoteLines = input.lines.map((l) => {
        const it = itemMap.get(l.menuItemId);
        if (!it || !it.isAvailable) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Plat indisponible: ${it?.name ?? l.menuItemId}`,
          });
        }
        return {
          unitPriceCents: it.priceCents,
          quantity: l.quantity,
          options: l.options.map((o) => ({
            id: o.id,
            name: o.name,
            priceDeltaCents: o.priceDeltaCents,
          })),
        };
      });

      const q = quote({
        lines: quoteLines,
        deliveryFeeCents: resto.deliveryFeeCents,
        tipCents: input.tipCents,
        foxCoinsAppliedCents: input.foxCoinsAppliedCents,
      });

      if (q.subtotalCents < resto.deliveryMinCents) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Minimum de commande non atteint' });
      }

      const orderItems = input.lines.map((l) => {
        const it = itemMap.get(l.menuItemId);
        return {
          menuItemId: l.menuItemId,
          name: it?.name ?? '',
          unitPriceCents: it?.priceCents ?? 0,
          quantity: l.quantity,
          options: l.options,
          notes: l.notes,
        };
      });

      // 1. Insère la commande pending_payment
      const [order] = await ctx.db
        .insert(orders)
        .values({
          shortCode: shortCode(),
          customerId: ctx.session.user.id,
          restaurantId: resto.id,
          status: 'pending_payment',
          items: orderItems,
          subtotalCents: q.subtotalCents,
          deliveryFeeCents: q.deliveryFeeCents,
          serviceFeeCents: q.serviceFeeCents,
          discountCents: q.discountCents,
          foxCoinsUsedCents: q.foxCoinsUsedCents,
          tipCents: q.tipCents,
          totalCents: q.totalCents,
          paymentMethod: input.paymentMethod,
          deliveryAddress: input.deliveryAddress,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
          customerNotes: input.customerNotes,
        })
        .returning();
      if (!order) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      await ctx.db.insert(orderEvents).values({
        orderId: order.id,
        toStatus: 'pending_payment',
        actorUserId: ctx.session.user.id,
      });

      // 2. Si Stripe est configuré : créer un PaymentIntent destination=resto.
      //    Sinon: mock pour pouvoir tester le flow UI sans Stripe.
      if (input.paymentMethod === 'cash_on_delivery') {
        return { orderId: order.id, clientSecret: null, shortCode: order.shortCode };
      }

      if (!isStripeConfigured()) {
        // Mode dev sans Stripe : on passe directement à `placed`.
        await ctx.db
          .update(orders)
          .set({ status: 'placed', placedAt: new Date(), updatedAt: new Date() })
          .where(eq(orders.id, order.id));
        await ctx.db.insert(orderEvents).values({
          orderId: order.id,
          fromStatus: 'pending_payment',
          toStatus: 'placed',
          payload: { dev: 'no STRIPE_SECRET_KEY, simulated success' },
        });
        return {
          orderId: order.id,
          clientSecret: 'dev-no-stripe',
          shortCode: order.shortCode,
          devNoStripe: true,
        };
      }

      const intent = await stripe().paymentIntents.create({
        amount: q.totalCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        capture_method: 'manual', // capture déclenchée à l'acceptation resto
        application_fee_amount: Math.round(q.totalCents * 0.15),
        transfer_data: resto.stripeAccountId ? { destination: resto.stripeAccountId } : undefined,
        metadata: {
          orderId: order.id,
          shortCode: order.shortCode,
          customerId: ctx.session.user.id,
          restaurantId: resto.id,
        },
      });

      await ctx.db.insert(paymentsTable).values({
        orderId: order.id,
        userId: ctx.session.user.id,
        stripePaymentIntentId: intent.id,
        amountCents: q.totalCents,
        currency: 'eur',
        method: input.paymentMethod,
        status: intent.status,
      });

      await ctx.db
        .update(orders)
        .set({ stripePaymentIntentId: intent.id, updatedAt: new Date() })
        .where(eq(orders.id, order.id));

      return { orderId: order.id, clientSecret: intent.client_secret, shortCode: order.shortCode };
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.id), eq(orders.customerId, ctx.session.user.id)))
        .limit(1);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!['placed', 'pending_payment', 'accepted_by_restaurant'].includes(order.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Annulation impossible à ce stade' });
      }
      const acceptedRecent =
        order.acceptedAt && Date.now() - order.acceptedAt.getTime() > 2 * 60 * 1000;
      if (acceptedRecent) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Délai d'annulation libre dépassé (2 min après acceptation).",
        });
      }

      if (order.stripePaymentIntentId && isStripeConfigured()) {
        try {
          await stripe().paymentIntents.cancel(order.stripePaymentIntentId);
        } catch (err) {
          console.warn('[orders.cancel] stripe cancel failed', err);
        }
      }

      await ctx.db
        .update(orders)
        .set({
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: input.reason ?? 'cancelled_by_customer',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
      await ctx.db.insert(orderEvents).values({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: 'cancelled',
        actorUserId: ctx.session.user.id,
        payload: { reason: input.reason ?? 'cancelled_by_customer' },
      });

      return { ok: true as const };
    }),
});
