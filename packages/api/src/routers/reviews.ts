import { z } from 'zod';
import { and, desc, eq, sql } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { reviews, restaurants, users } from '@foxeats/db/schema';
import { TRPCError } from '@trpc/server';

export const reviewsRouter = router({
  forRestaurant: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [resto] = await ctx.db
        .select({ id: restaurants.id })
        .from(restaurants)
        .where(eq(restaurants.slug, input.slug))
        .limit(1);
      if (!resto) throw new TRPCError({ code: 'NOT_FOUND' });

      const offset = input.cursor ? Number.parseInt(atob(input.cursor), 10) || 0 : 0;

      const rows = await ctx.db
        .select({
          id: reviews.id,
          rating: reviews.restaurantRating,
          comment: reviews.comment,
          response: reviews.response,
          createdAt: reviews.createdAt,
          authorName: users.name,
        })
        .from(reviews)
        .leftJoin(users, eq(users.id, reviews.customerId))
        .where(and(eq(reviews.restaurantId, resto.id), eq(reviews.isPublic, true)))
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit + 1)
        .offset(offset);

      const hasMore = rows.length > input.limit;
      const items = (hasMore ? rows.slice(0, input.limit) : rows).map((r) => ({
        ...r,
        authorInitial: r.authorName ? r.authorName.slice(0, 1).toUpperCase() : '?',
      }));

      const [agg] = await ctx.db
        .select({
          avg: sql<number>`COALESCE(AVG(${reviews.restaurantRating})::numeric(3,2), 0)::float`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(reviews)
        .where(and(eq(reviews.restaurantId, resto.id), eq(reviews.isPublic, true)));

      return {
        items,
        nextCursor: hasMore ? btoa(String(offset + input.limit)) : null,
        aggregate: agg ?? { avg: 0, count: 0 },
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        restaurantId: z.string().uuid(),
        courierId: z.string().uuid().nullable().optional(),
        restaurantRating: z.number().int().min(1).max(5),
        courierRating: z.number().int().min(1).max(5).optional(),
        comment: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [review] = await ctx.db
        .insert(reviews)
        .values({
          orderId: input.orderId,
          restaurantId: input.restaurantId,
          customerId: ctx.session.user.id,
          courierId: input.courierId ?? null,
          restaurantRating: input.restaurantRating,
          courierRating: input.courierRating,
          comment: input.comment,
        })
        .returning();
      if (!review) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const [agg] = await ctx.db
        .select({
          avg: sql<string>`AVG(${reviews.restaurantRating})::numeric(3,2)::text`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(reviews)
        .where(eq(reviews.restaurantId, input.restaurantId));
      if (agg) {
        await ctx.db
          .update(restaurants)
          .set({ rating: agg.avg, ratingCount: agg.count })
          .where(eq(restaurants.id, input.restaurantId));
      }

      return review;
    }),
});
