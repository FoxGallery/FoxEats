import { z } from 'zod';
import { and, eq, desc, sql, isNull } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { supportThreads, supportMessages, users, orders } from '@foxeats/db/schema';
import { pushNotification } from '../lib/notify';

const subjectSchema = z.string().min(3).max(160);
const bodySchema = z.string().min(1).max(4000);

export const supportRouter = router({
  /** Liste des threads de l'utilisateur courant */
  myThreads: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db
      .select()
      .from(supportThreads)
      .where(eq(supportThreads.userId, userId))
      .orderBy(desc(supportThreads.lastMessageAt))
      .limit(50);
  }),

  /** Détail d'un thread + messages */
  thread: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = (ctx.session.user as { role?: string }).role === 'admin';
      const [t] = await ctx.db
        .select()
        .from(supportThreads)
        .where(eq(supportThreads.id, input.id))
        .limit(1);
      if (!t) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!isAdmin && t.userId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });

      const msgs = await ctx.db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.threadId, t.id))
        .orderBy(supportMessages.createdAt);

      // Mark as read par le viewer
      const now = new Date();
      if (isAdmin) {
        await ctx.db
          .update(supportMessages)
          .set({ readByAgentAt: now })
          .where(and(eq(supportMessages.threadId, t.id), isNull(supportMessages.readByAgentAt)));
      } else {
        await ctx.db
          .update(supportMessages)
          .set({ readByCustomerAt: now })
          .where(and(eq(supportMessages.threadId, t.id), isNull(supportMessages.readByCustomerAt)));
      }

      return { thread: t, messages: msgs };
    }),

  /** Ouvre un nouveau thread (client). orderId optionnel pour lier à une commande */
  open: protectedProcedure
    .input(
      z.object({
        subject: subjectSchema,
        message: bodySchema,
        orderId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      // Valide la commande si fournie
      if (input.orderId) {
        const [o] = await ctx.db
          .select({ id: orders.id, customerId: orders.customerId })
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);
        if (!o || o.customerId !== userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }
      const now = new Date();
      const [thread] = await ctx.db
        .insert(supportThreads)
        .values({
          userId,
          orderId: input.orderId ?? null,
          subject: input.subject,
          status: 'open',
          lastMessageAt: now,
        })
        .returning();
      if (!thread) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await ctx.db.insert(supportMessages).values({
        threadId: thread.id,
        senderType: 'customer',
        senderUserId: userId,
        body: input.message,
        readByCustomerAt: now,
      });
      return thread;
    }),

  /** Envoie un message dans un thread existant (client ou agent) */
  reply: protectedProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        body: bodySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isAdmin = (ctx.session.user as { role?: string }).role === 'admin';
      const [t] = await ctx.db
        .select()
        .from(supportThreads)
        .where(eq(supportThreads.id, input.threadId))
        .limit(1);
      if (!t) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!isAdmin && t.userId !== userId) throw new TRPCError({ code: 'FORBIDDEN' });
      if (t.status === 'closed')
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Thread fermé' });

      const now = new Date();
      const senderType = isAdmin ? 'agent' : 'customer';
      await ctx.db.insert(supportMessages).values({
        threadId: t.id,
        senderType,
        senderUserId: userId,
        body: input.body,
        ...(isAdmin ? { readByAgentAt: now } : { readByCustomerAt: now }),
      });
      await ctx.db
        .update(supportThreads)
        .set({
          lastMessageAt: now,
          status: isAdmin ? 'pending' : 'open',
          assignedAgentId: isAdmin && !t.assignedAgentId ? userId : t.assignedAgentId,
        })
        .where(eq(supportThreads.id, t.id));

      // Notify l'autre partie
      if (isAdmin) {
        await pushNotification(ctx.db, {
          userId: t.userId,
          kind: 'system',
          title: 'Réponse du support',
          body: input.body.slice(0, 120),
          href: `/app/support/${t.id}`,
          data: { threadId: t.id },
        });
      }
      return { ok: true } as const;
    }),

  /** Compteur unread pour badge (côté client) */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(supportMessages)
      .innerJoin(supportThreads, eq(supportMessages.threadId, supportThreads.id))
      .where(
        and(
          eq(supportThreads.userId, userId),
          eq(supportMessages.senderType, 'agent'),
          isNull(supportMessages.readByCustomerAt),
        ),
      );
    return result[0]?.count ?? 0;
  }),

  // ============ ADMIN ============

  /** Liste tous les threads (admin), avec filtre statut */
  adminList: adminProcedure
    .input(
      z
        .object({
          status: z.enum(['open', 'pending', 'resolved', 'closed', 'all']).default('open'),
          limit: z.number().int().min(1).max(100).default(50),
        })
        .default({ status: 'open', limit: 50 }),
    )
    .query(async ({ ctx, input }) => {
      const where =
        input.status === 'all'
          ? sql`true`
          : eq(supportThreads.status, input.status as 'open' | 'pending' | 'resolved' | 'closed');
      const rows = await ctx.db
        .select({
          id: supportThreads.id,
          subject: supportThreads.subject,
          status: supportThreads.status,
          userId: supportThreads.userId,
          userEmail: users.email,
          userName: users.name,
          lastMessageAt: supportThreads.lastMessageAt,
          createdAt: supportThreads.createdAt,
          orderId: supportThreads.orderId,
        })
        .from(supportThreads)
        .innerJoin(users, eq(supportThreads.userId, users.id))
        .where(where)
        .orderBy(desc(supportThreads.lastMessageAt))
        .limit(input.limit);
      return rows;
    }),

  /** Stats admin */
  adminStats: adminProcedure.query(async ({ ctx }) => {
    const [open, pending, resolved] = await Promise.all([
      ctx.db
        .select({ c: sql<number>`count(*)::int` })
        .from(supportThreads)
        .where(eq(supportThreads.status, 'open')),
      ctx.db
        .select({ c: sql<number>`count(*)::int` })
        .from(supportThreads)
        .where(eq(supportThreads.status, 'pending')),
      ctx.db
        .select({ c: sql<number>`count(*)::int` })
        .from(supportThreads)
        .where(eq(supportThreads.status, 'resolved')),
    ]);
    return {
      open: open[0]?.c ?? 0,
      pending: pending[0]?.c ?? 0,
      resolved: resolved[0]?.c ?? 0,
    };
  }),

  /** Change statut d'un thread (admin) */
  setStatus: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['open', 'pending', 'resolved', 'closed']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const closedAt = input.status === 'closed' ? new Date() : null;
      await ctx.db
        .update(supportThreads)
        .set({ status: input.status, closedAt })
        .where(eq(supportThreads.id, input.id));
      return { ok: true } as const;
    }),
});
