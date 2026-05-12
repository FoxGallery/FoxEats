import { z } from 'zod';
import { and, eq, inArray } from 'drizzle-orm';
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
