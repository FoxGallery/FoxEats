import { z } from 'zod';
import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import { router, courierProcedure, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { couriers, courierLocations, orders, restaurants } from '@foxeats/db/schema';
import { publish } from '../lib/pusher';
import { deliveryEta, type Route } from '@foxeats/maps/eta';
import type { LatLng } from '@foxeats/maps';

const latLngInput = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  heading: z.number().optional(),
  speed: z.number().optional(),
});

export const couriersRouter = router({
  me: courierProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    let [me] = await ctx.db.select().from(couriers).where(eq(couriers.userId, userId)).limit(1);
    if (!me) {
      [me] = await ctx.db.insert(couriers).values({ userId }).returning();
    }
    if (!me) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    return me;
  }),

  status: courierProcedure.query(async ({ ctx }) => {
    const [me] = await ctx.db
      .select({ status: couriers.status, vehicle: couriers.vehicle })
      .from(couriers)
      .where(eq(couriers.userId, ctx.session.user.id))
      .limit(1);
    return me ?? { status: 'offline' as const, vehicle: 'bike' as const };
  }),

  setStatus: courierProcedure
    .input(z.object({ status: z.enum(['offline', 'online', 'on_delivery', 'paused']) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .update(couriers)
        .set({ status: input.status, updatedAt: new Date(), lastSeenAt: new Date() })
        .where(eq(couriers.userId, userId));
      return { ok: true as const };
    }),

  publishLocation: courierProcedure.input(latLngInput).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const [me] = await ctx.db
      .select({ id: couriers.id })
      .from(couriers)
      .where(eq(couriers.userId, userId))
      .limit(1);
    if (!me) throw new TRPCError({ code: 'NOT_FOUND' });

    await ctx.db
      .update(couriers)
      .set({
        lastLat: String(input.lat),
        lastLng: String(input.lng),
        lastSeenAt: new Date(),
      })
      .where(eq(couriers.id, me.id));

    await ctx.db.insert(courierLocations).values({
      courierId: me.id,
      lat: String(input.lat),
      lng: String(input.lng),
      accuracy: input.accuracy != null ? String(input.accuracy) : null,
      heading: input.heading != null ? String(input.heading) : null,
      speed: input.speed != null ? String(input.speed) : null,
    });

    const activeOrders = await ctx.db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.courierId, userId),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inArray(orders.status, ['courier_assigned', 'picked_up', 'in_delivery'] as any),
        ),
      );
    await Promise.all(
      activeOrders.map((o) =>
        publish({ kind: 'order', id: o.id }, 'courier:location', {
          lat: input.lat,
          lng: input.lng,
          heading: input.heading ?? null,
          speed: input.speed ?? null,
          at: Date.now(),
        }),
      ),
    );

    return { ok: true as const, activeOrders: activeOrders.length };
  }),

  lastLocationForOrder: protectedProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select({ courierId: orders.courierId, customerId: orders.customerId })
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      if (order.customerId !== ctx.session.user.id && order.courierId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      if (!order.courierId) return null;
      const [c] = await ctx.db
        .select({ lat: couriers.lastLat, lng: couriers.lastLng, lastSeenAt: couriers.lastSeenAt })
        .from(couriers)
        .where(eq(couriers.userId, order.courierId))
        .limit(1);
      if (!c?.lat || !c?.lng) return null;
      return {
        lat: Number(c.lat),
        lng: Number(c.lng),
        lastSeenAt: c.lastSeenAt,
      };
    }),

  /** Onboarding livreur — sauvegarde profil + véhicule + IBAN + zones. */
  updateProfile: courierProcedure
    .input(
      z.object({
        vehicle: z.enum(['bike', 'ebike', 'scooter', 'motorbike', 'car', 'walk']).optional(),
        siret: z.string().max(20).nullable().optional(),
        iban: z.string().max(40).nullable().optional(),
        isAvailableForRiviera: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [me] = await ctx.db
        .select({ id: couriers.id })
        .from(couriers)
        .where(eq(couriers.userId, userId))
        .limit(1);
      if (!me) {
        const [created] = await ctx.db
          .insert(couriers)
          .values({ userId, ...input })
          .returning();
        return created;
      }
      const [updated] = await ctx.db
        .update(couriers)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(couriers.id, me.id))
        .returning();
      return updated;
    }),

  /** Préférences zones favorites — pour le dispatch matching. */
  setPreferredCities: courierProcedure
    .input(z.object({ cities: z.array(z.string().min(2).max(80)).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [me] = await ctx.db
        .select({ id: couriers.id, documents: couriers.documents })
        .from(couriers)
        .where(eq(couriers.userId, userId))
        .limit(1);
      if (!me) throw new TRPCError({ code: 'NOT_FOUND' });
      const docs = (me.documents as Record<string, unknown>) ?? {};
      docs['preferredCities'] = input.cities;
      await ctx.db
        .update(couriers)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .set({ documents: docs as any })
        .where(eq(couriers.id, me.id));
      return { ok: true as const, cities: input.cities };
    }),

  /**
   * Offres de courses disponibles pour le livreur courant.
   * Sélectionne les orders status=ready_for_pickup sans courier assigné,
   * filtre par villes préférées si définies, trie par distance haversine
   * depuis lastLat/Lng du livreur.
   */
  offers: courierProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }).default({ limit: 10 }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [me] = await ctx.db
        .select({
          status: couriers.status,
          lastLat: couriers.lastLat,
          lastLng: couriers.lastLng,
          documents: couriers.documents,
        })
        .from(couriers)
        .where(eq(couriers.userId, userId))
        .limit(1);
      if (!me || me.status === 'offline') return { items: [] };

      const docs = (me.documents as Record<string, unknown>) ?? {};
      const preferred = (docs['preferredCities'] as string[] | undefined) ?? [];

      // Sélectionne les commandes "ready_for_pickup" sans courier
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where = [
        eq(orders.status, 'ready_for_pickup' as any),
        sql`${orders.courierId} IS NULL`,
      ];
      const all = await ctx.db
        .select({
          id: orders.id,
          shortCode: orders.shortCode,
          restaurantId: orders.restaurantId,
          totalCents: orders.totalCents,
          deliveryFeeCents: orders.deliveryFeeCents,
          tipCents: orders.tipCents,
          deliveryAddress: orders.deliveryAddress,
          restaurantName: restaurants.name,
          restaurantCity: restaurants.city,
          restaurantLat: restaurants.lat,
          restaurantLng: restaurants.lng,
        })
        .from(orders)
        .leftJoin(restaurants, eq(restaurants.id, orders.restaurantId))
        .where(and(...where))
        .limit(50);

      // Hav distance & filter
      const myLat = me.lastLat ? Number(me.lastLat) : null;
      const myLng = me.lastLng ? Number(me.lastLng) : null;
      const items = all
        .filter((o) => (preferred.length === 0 ? true : preferred.includes(o.restaurantCity ?? '')))
        .map((o) => {
          const rLat = Number(o.restaurantLat);
          const rLng = Number(o.restaurantLng);
          let distanceKm: number | null = null;
          if (myLat != null && myLng != null) {
            const toRad = (d: number) => (d * Math.PI) / 180;
            const dLat = toRad(rLat - myLat);
            const dLng = toRad(rLng - myLng);
            const lat1 = toRad(myLat);
            const lat2 = toRad(rLat);
            const a =
              Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
            distanceKm = 2 * 6371 * Math.asin(Math.sqrt(a));
          }
          const estimatedGainCents = (o.deliveryFeeCents ?? 0) + (o.tipCents ?? 0);
          return {
            id: o.id,
            shortCode: o.shortCode,
            restaurantName: o.restaurantName,
            restaurantCity: o.restaurantCity,
            restaurantLat: rLat,
            restaurantLng: rLng,
            deliveryAddress: o.deliveryAddress,
            estimatedGainCents,
            distanceKm,
          };
        })
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999))
        .slice(0, input.limit);

      return { items };
    }),

  /** Gains et stats du livreur. */
  earnings: courierProcedure
    .input(
      z
        .object({ period: z.enum(['day', 'week', 'month']).default('week') })
        .default({ period: 'week' }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const days = input.period === 'day' ? 1 : input.period === 'week' ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const rows = await ctx.db
        .select({
          deliveryFeeCents: orders.deliveryFeeCents,
          tipCents: orders.tipCents,
          deliveredAt: orders.deliveredAt,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(
          and(
            eq(orders.courierId, userId),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eq(orders.status, 'delivered' as any),
            gte(orders.deliveredAt, since),
          ),
        );
      const totalCents = rows.reduce(
        (sum, r) => sum + (r.deliveryFeeCents ?? 0) + (r.tipCents ?? 0),
        0,
      );
      const deliveriesCount = rows.length;
      const tipsCents = rows.reduce((sum, r) => sum + (r.tipCents ?? 0), 0);
      return {
        period: input.period,
        totalCents,
        deliveriesCount,
        tipsCents,
        avgPerDeliveryCents: deliveriesCount > 0 ? Math.round(totalCents / deliveriesCount) : 0,
      };
    }),

  /** Export URSSAF trimestriel — CSV pour auto-entrepreneur. */
  exportUrssaf: courierProcedure
    .input(
      z.object({
        year: z.number().int().min(2025).max(2100),
        quarter: z.number().int().min(1).max(4),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const startMonth = (input.quarter - 1) * 3;
      const start = new Date(Date.UTC(input.year, startMonth, 1));
      const end = new Date(Date.UTC(input.year, startMonth + 3, 1));

      const rows = await ctx.db
        .select({
          deliveredAt: orders.deliveredAt,
          shortCode: orders.shortCode,
          deliveryFeeCents: orders.deliveryFeeCents,
          tipCents: orders.tipCents,
        })
        .from(orders)
        .where(
          and(
            eq(orders.courierId, userId),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eq(orders.status, 'delivered' as any),
            gte(orders.deliveredAt, start),
          ),
        );
      const filtered = rows.filter((r) => r.deliveredAt && r.deliveredAt < end);

      const totalGrossCents = filtered.reduce(
        (s, r) => s + (r.deliveryFeeCents ?? 0) + (r.tipCents ?? 0),
        0,
      );
      const lines = [
        ['Date', 'Référence', 'Frais livraison (€)', 'Pourboire (€)', 'Total brut (€)'],
        ...filtered.map((r) => [
          r.deliveredAt!.toISOString().slice(0, 10),
          `#${r.shortCode}`,
          ((r.deliveryFeeCents ?? 0) / 100).toFixed(2),
          ((r.tipCents ?? 0) / 100).toFixed(2),
          (((r.deliveryFeeCents ?? 0) + (r.tipCents ?? 0)) / 100).toFixed(2),
        ]),
        ['', '', '', 'TOTAL', (totalGrossCents / 100).toFixed(2)],
      ];
      const csv = lines
        .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
        .join('\n');
      return {
        csv,
        filename: `urssaf-foxeats-Q${input.quarter}-${input.year}.csv`,
        totalGrossCents,
        deliveriesCount: filtered.length,
      };
    }),

  eta: publicProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [order] = await ctx.db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
      const [resto] = await ctx.db
        .select({
          lat: restaurants.lat,
          lng: restaurants.lng,
          prepMin: restaurants.prepTimeMinMinutes,
        })
        .from(restaurants)
        .where(eq(restaurants.id, order.restaurantId))
        .limit(1);
      if (!resto) throw new TRPCError({ code: 'NOT_FOUND' });

      const customer = (order.deliveryAddress as { lat: number; lng: number } | null) ?? null;
      if (!customer) return null;

      let courierLatLng: LatLng | null = null;
      if (order.courierId) {
        const [c] = await ctx.db
          .select({ lat: couriers.lastLat, lng: couriers.lastLng })
          .from(couriers)
          .where(eq(couriers.userId, order.courierId))
          .limit(1);
        if (c?.lat && c?.lng) courierLatLng = { lat: Number(c.lat), lng: Number(c.lng) };
      }

      const prepRemainingSeconds = order.acceptedAt
        ? Math.max(
            0,
            resto.prepMin * 60 - Math.floor((Date.now() - order.acceptedAt.getTime()) / 1000),
          )
        : resto.prepMin * 60;

      const eta = await deliveryEta({
        courier: courierLatLng,
        restaurant: { lat: Number(resto.lat), lng: Number(resto.lng) },
        customer,
        prepRemainingSeconds,
      });

      return {
        totalSeconds: eta.totalSeconds,
        arrivalIso: new Date(Date.now() + eta.totalSeconds * 1000).toISOString(),
        precise: eta.precise,
        legs: simplifyLegs(eta.legs),
        courier: courierLatLng,
        restaurant: { lat: Number(resto.lat), lng: Number(resto.lng) },
        customer,
      };
    }),
});

function simplifyLegs(legs: { courierToRestaurant?: Route; restaurantToCustomer: Route }) {
  return {
    courierToRestaurant: legs.courierToRestaurant
      ? {
          durationSeconds: legs.courierToRestaurant.durationSeconds,
          distanceMeters: legs.courierToRestaurant.distanceMeters,
          geometry: legs.courierToRestaurant.geometry,
        }
      : null,
    restaurantToCustomer: {
      durationSeconds: legs.restaurantToCustomer.durationSeconds,
      distanceMeters: legs.restaurantToCustomer.distanceMeters,
      geometry: legs.restaurantToCustomer.geometry,
    },
  };
}
