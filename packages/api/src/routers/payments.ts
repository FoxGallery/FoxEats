import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, protectedProcedure, merchantProcedure } from '../trpc';
import { restaurants, orders } from '@foxeats/db/schema';
import { TRPCError } from '@trpc/server';
import { stripe, isStripeConfigured } from '../lib/stripe';

export const paymentsRouter = router({
  startConnectOnboarding: merchantProcedure
    .input(z.object({ restaurantId: z.string().uuid(), returnUrl: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Stripe non configuré' });
      }
      const [resto] = await ctx.db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!resto) throw new TRPCError({ code: 'NOT_FOUND' });
      if (resto.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      let accountId = resto.stripeAccountId;
      if (!accountId) {
        const account = await stripe().accounts.create({
          type: 'express',
          country: 'FR',
          email: ctx.session.user.email ?? undefined,
          business_profile: { name: resto.name, url: process.env.NEXT_PUBLIC_APP_URL },
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          metadata: { restaurantId: resto.id, slug: resto.slug },
        });
        accountId = account.id;
        await ctx.db
          .update(restaurants)
          .set({ stripeAccountId: accountId, updatedAt: new Date() })
          .where(eq(restaurants.id, resto.id));
      }

      const link = await stripe().accountLinks.create({
        account: accountId,
        refresh_url: input.returnUrl,
        return_url: input.returnUrl,
        type: 'account_onboarding',
      });

      return { url: link.url, accountId };
    }),

  connectStatus: merchantProcedure
    .input(z.object({ restaurantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [resto] = await ctx.db
        .select({
          id: restaurants.id,
          ownerId: restaurants.ownerId,
          stripeAccountId: restaurants.stripeAccountId,
        })
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!resto) throw new TRPCError({ code: 'NOT_FOUND' });
      if (resto.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      if (!resto.stripeAccountId || !isStripeConfigured()) {
        return { hasAccount: false as const };
      }
      const account = await stripe().accounts.retrieve(resto.stripeAccountId);
      return {
        hasAccount: true as const,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements,
      };
    }),

  connectDashboardLink: merchantProcedure
    .input(z.object({ restaurantId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!isStripeConfigured()) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });
      }
      const [resto] = await ctx.db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!resto || resto.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      if (!resto.stripeAccountId) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Compte non créé' });
      }
      const link = await stripe().accounts.createLoginLink(resto.stripeAccountId);
      return { url: link.url };
    }),

  publishableKey: protectedProcedure.query(() => {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? null,
      configured: isStripeConfigured(),
    };
  }),

  confirm: protectedProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, input.paymentIntentId))
        .limit(1);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      if (order.customerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return { orderId: order.id, status: order.status };
    }),
});
