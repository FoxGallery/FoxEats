import { z } from 'zod';
import { and, eq, desc, isNull, sql } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { notifications, notifPrefs } from '@foxeats/db/schema';

export const notificationsRouter = router({
  /** Liste paginée des notifications de l'utilisateur courant */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).default(20),
          unreadOnly: z.boolean().default(false),
        })
        .default({ limit: 20, unreadOnly: false }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const whereClause = input.unreadOnly
        ? and(eq(notifications.userId, userId), isNull(notifications.readAt))
        : eq(notifications.userId, userId);
      const rows = await ctx.db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit);
      return rows;
    }),

  /** Compteur non-lus pour badge bell */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return result[0]?.count ?? 0;
  }),

  /** Marquer une notif comme lue */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, userId)));
      return { ok: true } as const;
    }),

  /** Marquer toutes comme lues */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await ctx.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return { ok: true } as const;
  }),

  /** Récupérer les préférences */
  getPrefs: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const rows = await ctx.db
      .select()
      .from(notifPrefs)
      .where(eq(notifPrefs.userId, userId))
      .limit(1);
    if (rows[0]) return rows[0];
    // Defaults si pas encore enregistrés
    return {
      userId,
      emailOrderUpdates: true,
      emailPromotions: true,
      emailNewsletter: false,
      pushOrderUpdates: true,
      pushPromotions: false,
      systemTransactional: true,
      updatedAt: new Date(),
    };
  }),

  /** Mettre à jour les préférences (upsert) */
  updatePrefs: protectedProcedure
    .input(
      z
        .object({
          emailOrderUpdates: z.boolean().optional(),
          emailPromotions: z.boolean().optional(),
          emailNewsletter: z.boolean().optional(),
          pushOrderUpdates: z.boolean().optional(),
          pushPromotions: z.boolean().optional(),
        })
        .strict(),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      // Upsert
      await ctx.db
        .insert(notifPrefs)
        .values({ userId, ...input, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: notifPrefs.userId,
          set: { ...input, updatedAt: new Date() },
        });
      return { ok: true } as const;
    }),
});
