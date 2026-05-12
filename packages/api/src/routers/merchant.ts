import { z } from 'zod';
import { and, asc, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { router, merchantProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { restaurants, menuCategories, menuItems, orders, promos } from '@foxeats/db/schema';
import { publish } from '../lib/pusher';

const idInput = z.object({ id: z.string().uuid() });
const restaurantIdInput = z.object({ restaurantId: z.string().uuid() });

async function assertOwner(
  db: Parameters<typeof publish> extends never ? never : never,
  restaurantId: string,
  userId: string,
): Promise<void> {
  void db;
  void restaurantId;
  void userId;
}
void assertOwner;

async function ownerCheck(db: typeof restaurants extends never ? never : never, _: unknown) {
  void db;
  void _;
}
void ownerCheck;

export const merchantRouter = router({
  /** Liste des restos dont l'utilisateur est owner. */
  myRestaurants: merchantProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, ctx.session.user.id))
      .orderBy(asc(restaurants.name));
  }),

  // ─────────────── Restaurant settings ───────────────
  updateRestaurant: merchantProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        patch: z
          .object({
            name: z.string().min(1).max(100).optional(),
            description: z.string().max(2000).nullable().optional(),
            coverUrl: z.string().url().nullable().optional(),
            logoUrl: z.string().url().nullable().optional(),
            phone: z.string().max(30).nullable().optional(),
            siret: z.string().max(20).nullable().optional(),
            deliveryFeeCents: z.number().int().min(0).max(2000).optional(),
            deliveryMinCents: z.number().int().min(0).max(10_000).optional(),
            prepTimeMinMinutes: z.number().int().min(5).max(120).optional(),
            prepTimeMaxMinutes: z.number().int().min(5).max(120).optional(),
            isHalal: z.boolean().optional(),
            isVegetarianFriendly: z.boolean().optional(),
            isVeganFriendly: z.boolean().optional(),
            isAntiWasteEnabled: z.boolean().optional(),
            openingHours: z
              .record(z.string(), z.array(z.object({ open: z.string(), close: z.string() })))
              .optional(),
            status: z.enum(['draft', 'pending', 'active', 'paused']).optional(),
          })
          .strict(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [r] = await ctx.db
        .select({ ownerId: restaurants.ownerId })
        .from(restaurants)
        .where(eq(restaurants.id, input.id))
        .limit(1);
      if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      const [updated] = await ctx.db
        .update(restaurants)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .set({ ...(input.patch as any), updatedAt: new Date() })
        .where(eq(restaurants.id, input.id))
        .returning();
      return updated;
    }),

  // ─────────────── Menu CRUD ───────────────
  menu: router({
    list: merchantProcedure.input(restaurantIdInput).query(async ({ ctx, input }) => {
      const [r] = await ctx.db
        .select({ ownerId: restaurants.ownerId })
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      const cats = await ctx.db
        .select()
        .from(menuCategories)
        .where(eq(menuCategories.restaurantId, input.restaurantId))
        .orderBy(asc(menuCategories.sortOrder));
      const items = await ctx.db
        .select()
        .from(menuItems)
        .where(eq(menuItems.restaurantId, input.restaurantId))
        .orderBy(asc(menuItems.sortOrder));
      const byCat = new Map<string, typeof items>();
      for (const it of items) {
        const list = byCat.get(it.categoryId) ?? [];
        list.push(it);
        byCat.set(it.categoryId, list);
      }
      return cats.map((c) => ({ ...c, items: byCat.get(c.id) ?? [] }));
    }),

    createCategory: merchantProcedure
      .input(
        z.object({
          restaurantId: z.string().uuid(),
          name: z.string().min(1).max(80),
          description: z.string().max(500).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [r] = await ctx.db
          .select({ ownerId: restaurants.ownerId })
          .from(restaurants)
          .where(eq(restaurants.id, input.restaurantId))
          .limit(1);
        if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        const [{ maxSort } = { maxSort: -1 }] = await ctx.db
          .select({ maxSort: sql<number>`COALESCE(MAX(${menuCategories.sortOrder}), -1)::int` })
          .from(menuCategories)
          .where(eq(menuCategories.restaurantId, input.restaurantId));
        const [created] = await ctx.db
          .insert(menuCategories)
          .values({
            restaurantId: input.restaurantId,
            name: input.name,
            description: input.description,
            sortOrder: (maxSort ?? -1) + 1,
          })
          .returning();
        return created;
      }),

    updateCategory: merchantProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          patch: z.object({
            name: z.string().min(1).max(80).optional(),
            description: z.string().max(500).nullable().optional(),
            isActive: z.boolean().optional(),
            sortOrder: z.number().int().optional(),
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [cat] = await ctx.db
          .select({ restaurantId: menuCategories.restaurantId })
          .from(menuCategories)
          .where(eq(menuCategories.id, input.id))
          .limit(1);
        if (!cat) throw new TRPCError({ code: 'NOT_FOUND' });
        const [r] = await ctx.db
          .select({ ownerId: restaurants.ownerId })
          .from(restaurants)
          .where(eq(restaurants.id, cat.restaurantId))
          .limit(1);
        if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        const [updated] = await ctx.db
          .update(menuCategories)
          .set(input.patch)
          .where(eq(menuCategories.id, input.id))
          .returning();
        return updated;
      }),

    deleteCategory: merchantProcedure.input(idInput).mutation(async ({ ctx, input }) => {
      const [cat] = await ctx.db
        .select({ restaurantId: menuCategories.restaurantId })
        .from(menuCategories)
        .where(eq(menuCategories.id, input.id))
        .limit(1);
      if (!cat) throw new TRPCError({ code: 'NOT_FOUND' });
      const [r] = await ctx.db
        .select({ ownerId: restaurants.ownerId })
        .from(restaurants)
        .where(eq(restaurants.id, cat.restaurantId))
        .limit(1);
      if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      await ctx.db.delete(menuCategories).where(eq(menuCategories.id, input.id));
      return { ok: true as const };
    }),

    createItem: merchantProcedure
      .input(
        z.object({
          restaurantId: z.string().uuid(),
          categoryId: z.string().uuid(),
          name: z.string().min(1).max(120),
          description: z.string().max(1000).optional(),
          priceCents: z.number().int().min(0).max(50_000),
          photoUrl: z.string().url().optional(),
          isPopular: z.boolean().optional(),
          isVegan: z.boolean().optional(),
          isVegetarian: z.boolean().optional(),
          isGlutenFree: z.boolean().optional(),
          isSpicy: z.boolean().optional(),
          isLocalSpecialty: z.boolean().optional(),
          allergens: z.array(z.string()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [r] = await ctx.db
          .select({ ownerId: restaurants.ownerId })
          .from(restaurants)
          .where(eq(restaurants.id, input.restaurantId))
          .limit(1);
        if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        const [{ maxSort } = { maxSort: -1 }] = await ctx.db
          .select({ maxSort: sql<number>`COALESCE(MAX(${menuItems.sortOrder}), -1)::int` })
          .from(menuItems)
          .where(eq(menuItems.categoryId, input.categoryId));
        const [created] = await ctx.db
          .insert(menuItems)
          .values({
            restaurantId: input.restaurantId,
            categoryId: input.categoryId,
            name: input.name,
            description: input.description ?? null,
            priceCents: input.priceCents,
            photoUrl: input.photoUrl ?? null,
            isPopular: input.isPopular ?? false,
            isVegan: input.isVegan ?? false,
            isVegetarian: input.isVegetarian ?? false,
            isGlutenFree: input.isGlutenFree ?? false,
            isSpicy: input.isSpicy ?? false,
            isLocalSpecialty: input.isLocalSpecialty ?? false,
            allergens: input.allergens ?? [],
            options: [],
            sortOrder: (maxSort ?? -1) + 1,
          })
          .returning();
        return created;
      }),

    updateItem: merchantProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          patch: z
            .object({
              name: z.string().min(1).max(120).optional(),
              description: z.string().max(1000).nullable().optional(),
              priceCents: z.number().int().min(0).max(50_000).optional(),
              photoUrl: z.string().url().nullable().optional(),
              isAvailable: z.boolean().optional(),
              isPopular: z.boolean().optional(),
              isVegan: z.boolean().optional(),
              isVegetarian: z.boolean().optional(),
              isGlutenFree: z.boolean().optional(),
              isSpicy: z.boolean().optional(),
              isLocalSpecialty: z.boolean().optional(),
              allergens: z.array(z.string()).optional(),
              sortOrder: z.number().int().optional(),
            })
            .strict(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [item] = await ctx.db
          .select({ restaurantId: menuItems.restaurantId })
          .from(menuItems)
          .where(eq(menuItems.id, input.id))
          .limit(1);
        if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
        const [r] = await ctx.db
          .select({ ownerId: restaurants.ownerId })
          .from(restaurants)
          .where(eq(restaurants.id, item.restaurantId))
          .limit(1);
        if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        const [updated] = await ctx.db
          .update(menuItems)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .set({ ...(input.patch as any), updatedAt: new Date() })
          .where(eq(menuItems.id, input.id))
          .returning();
        // Si disponibilité change, push Pusher pour invalider le catalog client
        if (input.patch.isAvailable !== undefined) {
          await publish({ kind: 'merchant', id: item.restaurantId }, 'menu:availability', {
            itemId: input.id,
            isAvailable: input.patch.isAvailable,
          });
        }
        return updated;
      }),

    deleteItem: merchantProcedure.input(idInput).mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .select({ restaurantId: menuItems.restaurantId })
        .from(menuItems)
        .where(eq(menuItems.id, input.id))
        .limit(1);
      if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
      const [r] = await ctx.db
        .select({ ownerId: restaurants.ownerId })
        .from(restaurants)
        .where(eq(restaurants.id, item.restaurantId))
        .limit(1);
      if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      await ctx.db.delete(menuItems).where(eq(menuItems.id, input.id));
      return { ok: true as const };
    }),
  }),

  // ─────────────── Stats ───────────────
  stats: merchantProcedure
    .input(
      z.object({
        restaurantId: z.string().uuid(),
        period: z.enum(['day', 'week', 'month']).default('week'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [r] = await ctx.db
        .select({ ownerId: restaurants.ownerId })
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });

      const days = input.period === 'day' ? 1 : input.period === 'week' ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const completed = await ctx.db
        .select({
          totalCents: orders.totalCents,
          items: orders.items,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(
          and(
            eq(orders.restaurantId, input.restaurantId),
            gte(orders.createdAt, since),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inArray(orders.status, [
              'delivered',
              'in_delivery',
              'picked_up',
              'ready_for_pickup',
            ] as any),
          ),
        );

      const totalRevenueCents = completed.reduce((sum, o) => sum + o.totalCents, 0);
      const orderCount = completed.length;
      const avgTicketCents = orderCount > 0 ? Math.round(totalRevenueCents / orderCount) : 0;

      // Top items
      const itemFreq = new Map<string, { name: string; quantity: number; revenueCents: number }>();
      for (const o of completed) {
        const items =
          (o.items as Array<{
            menuItemId: string;
            name: string;
            quantity: number;
            unitPriceCents: number;
          }>) ?? [];
        for (const it of items) {
          const cur = itemFreq.get(it.menuItemId) ?? {
            name: it.name,
            quantity: 0,
            revenueCents: 0,
          };
          cur.quantity += it.quantity;
          cur.revenueCents += it.unitPriceCents * it.quantity;
          itemFreq.set(it.menuItemId, cur);
        }
      }
      const topItems = Array.from(itemFreq.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8);

      // Heures pic (par heure de la journée)
      const peakByHour = new Array(24).fill(0) as number[];
      for (const o of completed) {
        const hour = o.createdAt.getHours();
        peakByHour[hour] = (peakByHour[hour] ?? 0) + 1;
      }

      return {
        period: input.period,
        totalRevenueCents,
        orderCount,
        avgTicketCents,
        topItems,
        peakByHour,
      };
    }),

  // ─────────────── Promotions ───────────────
  promos: router({
    list: merchantProcedure.input(restaurantIdInput).query(async ({ ctx, input }) => {
      const [r] = await ctx.db
        .select({ ownerId: restaurants.ownerId })
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      return ctx.db
        .select()
        .from(promos)
        .where(eq(promos.restaurantId, input.restaurantId))
        .orderBy(desc(promos.createdAt));
    }),

    create: merchantProcedure
      .input(
        z.object({
          restaurantId: z.string().uuid(),
          code: z
            .string()
            .min(3)
            .max(30)
            .regex(/^[A-Z0-9_-]+$/),
          type: z.enum(['percent_off', 'amount_off', 'free_delivery']),
          valuePercent: z.number().int().min(0).max(100).optional(),
          valueCents: z.number().int().min(0).max(10_000).optional(),
          minOrderCents: z.number().int().min(0).max(50_000).optional(),
          maxUsages: z.number().int().min(1).max(10_000).optional(),
          perUserLimit: z.number().int().min(1).max(50).default(1),
          validUntil: z.string().datetime().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const [r] = await ctx.db
          .select({ ownerId: restaurants.ownerId })
          .from(restaurants)
          .where(eq(restaurants.id, input.restaurantId))
          .limit(1);
        if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        const [created] = await ctx.db
          .insert(promos)
          .values({
            restaurantId: input.restaurantId,
            code: input.code.toUpperCase(),
            type: input.type,
            valuePercent: input.valuePercent,
            valueCents: input.valueCents,
            minOrderCents: input.minOrderCents,
            maxUsages: input.maxUsages,
            perUserLimit: input.perUserLimit,
            validUntil: input.validUntil ? new Date(input.validUntil) : null,
            isActive: true,
          })
          .returning();
        return created;
      }),

    toggleActive: merchantProcedure
      .input(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const [p] = await ctx.db.select().from(promos).where(eq(promos.id, input.id)).limit(1);
        if (!p) throw new TRPCError({ code: 'NOT_FOUND' });
        if (p.restaurantId) {
          const [r] = await ctx.db
            .select({ ownerId: restaurants.ownerId })
            .from(restaurants)
            .where(eq(restaurants.id, p.restaurantId))
            .limit(1);
          if (!r || r.ownerId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        }
        await ctx.db
          .update(promos)
          .set({ isActive: input.isActive })
          .where(eq(promos.id, input.id));
        return { ok: true as const };
      }),
  }),
});
