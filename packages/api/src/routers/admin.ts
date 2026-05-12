import { z } from 'zod';
import { and, desc, eq, gte, inArray, sql, type SQL } from 'drizzle-orm';
import { router, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { users, restaurants, couriers, orders, promos, payments } from '@foxeats/db/schema';
import { stripe, isStripeConfigured } from '../lib/stripe';

export const adminRouter = router({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [active] = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inArray(orders.status, [
          'placed',
          'accepted_by_restaurant',
          'preparing',
          'ready_for_pickup',
          'courier_assigned',
          'picked_up',
          'in_delivery',
        ] as any),
      );
    const [online] = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(couriers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(inArray(couriers.status, ['online', 'on_delivery'] as any));
    const [activeRestos] = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(restaurants)
      .where(eq(restaurants.status, 'active'));
    const [pendingRestos] = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(restaurants)
      .where(eq(restaurants.status, 'pending'));
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [todayRevenue] = await ctx.db
      .select({ totalCents: sql<number>`COALESCE(SUM(${orders.totalCents}), 0)::int` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, since24h),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inArray(orders.status, ['delivered', 'in_delivery', 'picked_up'] as any),
        ),
      );
    return {
      liveOrders: active?.count ?? 0,
      onlineCouriers: online?.count ?? 0,
      activeRestaurants: activeRestos?.count ?? 0,
      pendingRestaurants: pendingRestos?.count ?? 0,
      todayRevenueCents: todayRevenue?.totalCents ?? 0,
    };
  }),

  restaurants: router({
    list: adminProcedure
      .input(
        z
          .object({
            status: z
              .enum(['draft', 'pending', 'active', 'paused', 'rejected', 'all'])
              .default('pending'),
            search: z.string().optional(),
            limit: z.number().int().min(1).max(100).default(50),
          })
          .default({ status: 'pending', limit: 50 }),
      )
      .query(async ({ ctx, input }) => {
        const where: SQL[] = [];
        if (input.status !== 'all') where.push(eq(restaurants.status, input.status));
        if (input.search) {
          where.push(
            sql`(lower(${restaurants.name}) ILIKE ${'%' + input.search.toLowerCase() + '%'} OR ${restaurants.slug} ILIKE ${'%' + input.search.toLowerCase() + '%'})`,
          );
        }
        return ctx.db
          .select()
          .from(restaurants)
          .where(where.length > 0 ? and(...where) : undefined)
          .orderBy(desc(restaurants.createdAt))
          .limit(input.limit);
      }),

    approve: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(restaurants)
          .set({ status: 'active', updatedAt: new Date() })
          .where(eq(restaurants.id, input.id));
        return { ok: true as const };
      }),

    reject: adminProcedure
      .input(z.object({ id: z.string().uuid(), reason: z.string().min(1).max(500) }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(restaurants)
          .set({ status: 'rejected', updatedAt: new Date() })
          .where(eq(restaurants.id, input.id));
        void input.reason;
        return { ok: true as const };
      }),

    pause: adminProcedure
      .input(z.object({ id: z.string().uuid(), paused: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(restaurants)
          .set({ status: input.paused ? 'paused' : 'active', updatedAt: new Date() })
          .where(eq(restaurants.id, input.id));
        return { ok: true as const };
      }),
  }),

  couriers: router({
    list: adminProcedure
      .input(
        z
          .object({
            kycStatus: z.enum(['pending', 'approved', 'rejected', 'all']).default('all'),
            limit: z.number().int().min(1).max(100).default(50),
          })
          .default({ kycStatus: 'all', limit: 50 }),
      )
      .query(async ({ ctx, input }) => {
        const where: SQL[] = [];
        if (input.kycStatus !== 'all') where.push(eq(couriers.kycStatus, input.kycStatus));
        const rows = await ctx.db
          .select({
            id: couriers.id,
            userId: couriers.userId,
            vehicle: couriers.vehicle,
            kycStatus: couriers.kycStatus,
            status: couriers.status,
            siret: couriers.siret,
            iban: couriers.iban,
            documents: couriers.documents,
            completedDeliveries: couriers.completedDeliveries,
            rating: couriers.rating,
            createdAt: couriers.createdAt,
            userEmail: users.email,
            userName: users.name,
          })
          .from(couriers)
          .leftJoin(users, eq(users.id, couriers.userId))
          .where(where.length > 0 ? and(...where) : undefined)
          .orderBy(desc(couriers.createdAt))
          .limit(input.limit);
        return rows.map((r) => ({
          ...r,
          ibanMasked: r.iban ? `${r.iban.slice(0, 4)} ****` : null,
        }));
      }),

    approveKyc: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(couriers)
          .set({ kycStatus: 'approved', updatedAt: new Date() })
          .where(eq(couriers.id, input.id));
        return { ok: true as const };
      }),

    rejectKyc: adminProcedure
      .input(z.object({ id: z.string().uuid(), reason: z.string().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(couriers)
          .set({ kycStatus: 'rejected', updatedAt: new Date() })
          .where(eq(couriers.id, input.id));
        void input.reason;
        return { ok: true as const };
      }),
  }),

  disputes: router({
    list: adminProcedure
      .input(
        z
          .object({
            limit: z.number().int().min(1).max(100).default(50),
            search: z.string().optional(),
          })
          .default({ limit: 50 }),
      )
      .query(async ({ ctx, input }) => {
        const where: SQL[] = [];
        if (input.search) {
          where.push(sql`${orders.shortCode} ILIKE ${'%' + input.search.toUpperCase() + '%'}`);
        }
        return ctx.db
          .select({
            id: orders.id,
            shortCode: orders.shortCode,
            status: orders.status,
            totalCents: orders.totalCents,
            createdAt: orders.createdAt,
            stripePaymentIntentId: orders.stripePaymentIntentId,
            customerNotes: orders.customerNotes,
          })
          .from(orders)
          .where(where.length > 0 ? and(...where) : undefined)
          .orderBy(desc(orders.createdAt))
          .limit(input.limit);
      }),

    refund: adminProcedure
      .input(
        z.object({
          orderId: z.string().uuid(),
          amountCents: z.number().int().min(0).optional(),
          reason: z.string().max(500).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [order] = await ctx.db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
        if (!order.stripePaymentIntentId || !isStripeConfigured()) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Stripe non configuré ou payment intent absent.',
          });
        }
        const refund = await stripe().refunds.create({
          payment_intent: order.stripePaymentIntentId,
          ...(input.amountCents ? { amount: input.amountCents } : {}),
          reason: 'requested_by_customer',
          metadata: {
            orderId: order.id,
            adminUserId: ctx.session.user.id,
            reason: input.reason ?? '',
          },
        });
        await ctx.db
          .update(orders)
          .set({ status: 'refunded', updatedAt: new Date() })
          .where(eq(orders.id, order.id));
        await ctx.db
          .update(payments)
          .set({ refundedCents: input.amountCents ?? order.totalCents })
          .where(eq(payments.stripePaymentIntentId, order.stripePaymentIntentId));
        return { ok: true as const, refundId: refund.id };
      }),
  }),

  promos: router({
    list: adminProcedure
      .input(
        z.object({ limit: z.number().int().min(1).max(100).default(50) }).default({ limit: 50 }),
      )
      .query(async ({ ctx, input }) => {
        return ctx.db.select().from(promos).orderBy(desc(promos.createdAt)).limit(input.limit);
      }),

    create: adminProcedure
      .input(
        z.object({
          code: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[A-Z0-9_-]+$/),
          type: z.enum([
            'percent_off',
            'amount_off',
            'free_delivery',
            'first_order',
            'referral',
            'foxpass_perk',
          ]),
          valuePercent: z.number().int().min(0).max(100).optional(),
          valueCents: z.number().int().min(0).max(50_000).optional(),
          minOrderCents: z.number().int().min(0).max(50_000).optional(),
          maxUsages: z.number().int().min(1).max(100_000).optional(),
          perUserLimit: z.number().int().min(1).max(50).default(1),
          cityScope: z.string().optional(),
          validUntil: z.string().datetime().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [created] = await ctx.db
          .insert(promos)
          .values({
            code: input.code.toUpperCase(),
            type: input.type,
            valuePercent: input.valuePercent,
            valueCents: input.valueCents,
            minOrderCents: input.minOrderCents,
            maxUsages: input.maxUsages,
            perUserLimit: input.perUserLimit,
            cityScope: input.cityScope,
            validUntil: input.validUntil ? new Date(input.validUntil) : null,
            isActive: true,
            restaurantId: null,
          })
          .returning();
        return created;
      }),

    toggleActive: adminProcedure
      .input(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.db
          .update(promos)
          .set({ isActive: input.isActive })
          .where(eq(promos.id, input.id));
        return { ok: true as const };
      }),
  }),

  liveOps: router({
    activeOrders: adminProcedure.query(async ({ ctx }) => {
      const rows = await ctx.db
        .select({
          id: orders.id,
          shortCode: orders.shortCode,
          status: orders.status,
          createdAt: orders.createdAt,
          totalCents: orders.totalCents,
          courierId: orders.courierId,
          restaurantId: orders.restaurantId,
          deliveryAddress: orders.deliveryAddress,
          restaurantName: restaurants.name,
          restaurantLat: restaurants.lat,
          restaurantLng: restaurants.lng,
        })
        .from(orders)
        .leftJoin(restaurants, eq(restaurants.id, orders.restaurantId))
        .where(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inArray(orders.status, [
            'placed',
            'accepted_by_restaurant',
            'preparing',
            'ready_for_pickup',
            'courier_assigned',
            'picked_up',
            'in_delivery',
          ] as any),
        )
        .orderBy(desc(orders.createdAt))
        .limit(200);
      return rows.map((r) => ({
        ...r,
        restaurantLat: Number(r.restaurantLat),
        restaurantLng: Number(r.restaurantLng),
      }));
    }),

    onlineCouriers: adminProcedure.query(async ({ ctx }) => {
      const rows = await ctx.db
        .select({
          id: couriers.id,
          userId: couriers.userId,
          status: couriers.status,
          vehicle: couriers.vehicle,
          lastLat: couriers.lastLat,
          lastLng: couriers.lastLng,
          lastSeenAt: couriers.lastSeenAt,
        })
        .from(couriers)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where(inArray(couriers.status, ['online', 'on_delivery'] as any))
        .limit(200);
      return rows
        .filter((r) => r.lastLat && r.lastLng)
        .map((r) => ({ ...r, lat: Number(r.lastLat), lng: Number(r.lastLng) }));
    }),
  }),
});
