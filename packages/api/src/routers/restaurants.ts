import { z } from 'zod';
import { and, asc, desc, eq, sql, type SQL } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { restaurants, menuCategories, menuItems } from '@foxeats/db/schema';
import { TRPCError } from '@trpc/server';
import { cuisineSchema, dietaryFlagSchema } from '@foxeats/validators';

const listInput = z.object({
  city: z.string().optional(),
  cuisine: cuisineSchema.optional(),
  priceMax: z.number().int().min(1).max(4).optional(),
  ratingMin: z.number().min(0).max(5).optional(),
  dietary: z.array(dietaryFlagSchema).optional(),
  halal: z.boolean().optional(),
  antiWaste: z.boolean().optional(),
  localSpecialty: z.boolean().optional(),
  sort: z.enum(['nearby', 'rating', 'fastest', 'cheapest']).default('nearby'),
  origin: z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .optional(),
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const restaurantsRouter = router({
  cities: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .selectDistinct({ city: restaurants.city })
      .from(restaurants)
      .where(eq(restaurants.status, 'active'))
      .orderBy(asc(restaurants.city));
    return rows.map((r) => r.city);
  }),

  popular: publicProcedure
    .input(
      z.object({ city: z.string().optional(), limit: z.number().int().min(1).max(20).default(8) }),
    )
    .query(async ({ ctx, input }) => {
      const where: SQL[] = [eq(restaurants.status, 'active')];
      if (input.city) where.push(eq(restaurants.city, input.city));
      return ctx.db
        .select()
        .from(restaurants)
        .where(and(...where))
        .orderBy(desc(restaurants.rating), desc(restaurants.ratingCount))
        .limit(input.limit);
    }),

  list: publicProcedure.input(listInput).query(async ({ ctx, input }) => {
    const where: SQL[] = [eq(restaurants.status, 'active')];
    if (input.city) where.push(eq(restaurants.city, input.city));
    if (input.priceMax) where.push(sql`${restaurants.priceRange} <= ${input.priceMax}`);
    if (input.ratingMin) where.push(sql`${restaurants.rating}::numeric >= ${input.ratingMin}`);
    if (input.cuisine) where.push(sql`${restaurants.cuisines} @> ${[input.cuisine]}::jsonb`);
    if (input.halal) where.push(eq(restaurants.isHalal, true));
    if (input.antiWaste) where.push(eq(restaurants.isAntiWasteEnabled, true));
    if (input.localSpecialty) where.push(eq(restaurants.isLocalSpecialty, true));
    if (input.dietary?.includes('vegan')) where.push(eq(restaurants.isVeganFriendly, true));
    if (input.dietary?.includes('vegetarian'))
      where.push(eq(restaurants.isVegetarianFriendly, true));

    const origin = input.origin;
    const distanceExpr = origin
      ? sql<number>`
          6371 * 2 * asin(sqrt(
            power(sin(radians((${restaurants.lat}::float - ${origin.lat})/2)), 2)
            + cos(radians(${origin.lat})) * cos(radians(${restaurants.lat}::float))
            * power(sin(radians((${restaurants.lng}::float - ${origin.lng})/2)), 2)
          ))
        `
      : sql<number>`0`;

    const offset = input.cursor ? Number.parseInt(atob(input.cursor), 10) || 0 : 0;

    const orderExpr = (() => {
      switch (input.sort) {
        case 'rating':
          return [desc(restaurants.rating), desc(restaurants.ratingCount)];
        case 'fastest':
          return [asc(restaurants.prepTimeMinMinutes)];
        case 'cheapest':
          return [asc(restaurants.priceRange), asc(restaurants.deliveryFeeCents)];
        case 'nearby':
        default:
          return origin ? [asc(distanceExpr)] : [desc(restaurants.rating)];
      }
    })();

    const rows = await ctx.db
      .select({
        id: restaurants.id,
        slug: restaurants.slug,
        name: restaurants.name,
        description: restaurants.description,
        coverUrl: restaurants.coverUrl,
        cuisines: restaurants.cuisines,
        rating: restaurants.rating,
        ratingCount: restaurants.ratingCount,
        priceRange: restaurants.priceRange,
        deliveryFeeCents: restaurants.deliveryFeeCents,
        prepTimeMinMinutes: restaurants.prepTimeMinMinutes,
        prepTimeMaxMinutes: restaurants.prepTimeMaxMinutes,
        city: restaurants.city,
        isLocalSpecialty: restaurants.isLocalSpecialty,
        isAntiWasteEnabled: restaurants.isAntiWasteEnabled,
        distanceKm: origin ? distanceExpr : sql<number | null>`null`,
      })
      .from(restaurants)
      .where(and(...where))
      .orderBy(...orderExpr)
      .limit(input.limit + 1)
      .offset(offset);

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, input.limit) : rows;
    const nextCursor = hasMore ? btoa(String(offset + input.limit)) : null;

    return { items, nextCursor };
  }),

  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const [resto] = await ctx.db
      .select()
      .from(restaurants)
      .where(and(eq(restaurants.slug, input.slug), eq(restaurants.status, 'active')))
      .limit(1);
    if (!resto) throw new TRPCError({ code: 'NOT_FOUND' });

    const cats = await ctx.db
      .select()
      .from(menuCategories)
      .where(and(eq(menuCategories.restaurantId, resto.id), eq(menuCategories.isActive, true)))
      .orderBy(asc(menuCategories.sortOrder));

    const items = await ctx.db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.restaurantId, resto.id), eq(menuItems.isAvailable, true)))
      .orderBy(asc(menuItems.sortOrder));

    const itemsByCategory = new Map<string, typeof items>();
    for (const it of items) {
      const list = itemsByCategory.get(it.categoryId) ?? [];
      list.push(it);
      itemsByCategory.set(it.categoryId, list);
    }

    return {
      restaurant: resto,
      categories: cats.map((c) => ({ ...c, items: itemsByCategory.get(c.id) ?? [] })),
    };
  }),

  search: publicProcedure
    .input(
      z.object({
        q: z.string().min(1).max(80),
        city: z.string().optional(),
        limit: z.number().int().min(1).max(40).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = input.q.trim().toLowerCase();
      const where: SQL[] = [eq(restaurants.status, 'active')];
      if (input.city) where.push(eq(restaurants.city, input.city));
      where.push(sql`(
        lower(${restaurants.name}) % ${q}
        OR lower(${restaurants.name}) ILIKE ${'%' + q + '%'}
        OR lower(${restaurants.city}) ILIKE ${'%' + q + '%'}
        OR ${restaurants.cuisines}::text ILIKE ${'%' + q + '%'}
        OR EXISTS (
          SELECT 1 FROM menu_items mi
          WHERE mi.restaurant_id = ${restaurants.id}
            AND lower(mi.name) ILIKE ${'%' + q + '%'}
        )
      )`);

      const rows = await ctx.db
        .select({
          id: restaurants.id,
          slug: restaurants.slug,
          name: restaurants.name,
          coverUrl: restaurants.coverUrl,
          cuisines: restaurants.cuisines,
          rating: restaurants.rating,
          ratingCount: restaurants.ratingCount,
          priceRange: restaurants.priceRange,
          deliveryFeeCents: restaurants.deliveryFeeCents,
          prepTimeMinMinutes: restaurants.prepTimeMinMinutes,
          prepTimeMaxMinutes: restaurants.prepTimeMaxMinutes,
          city: restaurants.city,
          score: sql<number>`(
            CASE WHEN lower(${restaurants.name}) ILIKE ${q + '%'} THEN 0
                 WHEN lower(${restaurants.name}) ILIKE ${'%' + q + '%'} THEN 1
                 ELSE 2 END
          )`,
        })
        .from(restaurants)
        .where(and(...where))
        .orderBy(sql`score asc`, desc(restaurants.rating))
        .limit(input.limit);

      return { items: rows };
    }),
});
