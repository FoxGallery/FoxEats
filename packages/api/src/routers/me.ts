import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { users, addresses, foxCoinsLedger, foxPassSubscriptions } from '@foxeats/db/schema';
import { addressSchema, localeSchema, dietaryFlagSchema } from '@foxeats/validators';

const profileUpdateSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    phone: z.string().max(30).optional().nullable(),
    locale: localeSchema.optional(),
    dietaryFlags: z.array(dietaryFlagSchema).optional(),
    marketingConsent: z.boolean().optional(),
  })
  .strict();

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const rows = await ctx.db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), sql`${users.deletedAt} IS NULL`))
      .limit(1);
    const user = rows[0];
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    return user;
  }),

  updateProfile: protectedProcedure.input(profileUpdateSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const [updated] = await ctx.db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) throw new TRPCError({ code: 'NOT_FOUND' });
    return updated;
  }),

  // --- Adresses ---
  addresses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, ctx.session.user.id))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
  }),

  createAddress: protectedProcedure.input(addressSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const existing = await ctx.db
      .select({ id: addresses.id })
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .limit(1);
    const isDefault = existing.length === 0;
    const [created] = await ctx.db
      .insert(addresses)
      .values({
        userId,
        label: input.label,
        street: input.street,
        city: input.city,
        postalCode: input.postalCode,
        country: input.country,
        lat: String(input.coords.lat),
        lng: String(input.coords.lng),
        instructions: input.instructions,
        isDefault,
      })
      .returning();
    return created;
  }),

  updateAddress: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: addressSchema.partial() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const patch = input.patch;
      const [updated] = await ctx.db
        .update(addresses)
        .set({
          ...(patch.label !== undefined && { label: patch.label }),
          ...(patch.street !== undefined && { street: patch.street }),
          ...(patch.city !== undefined && { city: patch.city }),
          ...(patch.postalCode !== undefined && { postalCode: patch.postalCode }),
          ...(patch.country !== undefined && { country: patch.country }),
          ...(patch.instructions !== undefined && { instructions: patch.instructions }),
          ...(patch.coords && {
            lat: String(patch.coords.lat),
            lng: String(patch.coords.lng),
          }),
        })
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, userId)))
        .returning();
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND' });
      return updated;
    }),

  deleteAddress: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const deleted = await ctx.db
        .delete(addresses)
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, userId)))
        .returning({ id: addresses.id });
      if (!deleted[0]) throw new TRPCError({ code: 'NOT_FOUND' });
      return { id: deleted[0].id };
    }),

  setDefaultAddress: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
      const [updated] = await ctx.db
        .update(addresses)
        .set({ isDefault: true })
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, userId)))
        .returning();
      if (!updated) throw new TRPCError({ code: 'NOT_FOUND' });
      return updated;
    }),

  // --- Loyalty light (full router in M11) ---
  foxStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const [{ balanceCents } = { balanceCents: 0 }] = await ctx.db
      .select({
        balanceCents: sql<number>`COALESCE(SUM(${foxCoinsLedger.amountCents}), 0)::int`,
      })
      .from(foxCoinsLedger)
      .where(eq(foxCoinsLedger.userId, userId));
    const subs = await ctx.db
      .select()
      .from(foxPassSubscriptions)
      .where(eq(foxPassSubscriptions.userId, userId))
      .limit(1);
    const sub = subs[0];
    const foxPassActive = sub
      ? sub.status === 'active' &&
        (!sub.currentPeriodEnd || sub.currentPeriodEnd.getTime() > Date.now())
      : false;
    return { foxCoinsCents: balanceCents, foxPassActive };
  }),

  // --- RGPD ---
  requestExport: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const [user] = await ctx.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
    const userAddresses = await ctx.db.select().from(addresses).where(eq(addresses.userId, userId));
    const ledger = await ctx.db
      .select()
      .from(foxCoinsLedger)
      .where(eq(foxCoinsLedger.userId, userId));
    // v1 synchronous JSON. M12/M13 routera ça via Inngest + R2 signed URL.
    return {
      requestedAt: new Date().toISOString(),
      user: redactSecrets(user),
      addresses: userAddresses,
      foxCoinsLedger: ledger,
    };
  }),

  deleteAccount: protectedProcedure
    .input(z.object({ confirm: z.literal('SUPPRIMER MON COMPTE') }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const anonEmail = `deleted-${userId}@foxeats.invalid`;
      await ctx.db
        .update(users)
        .set({
          deletedAt: new Date(),
          email: anonEmail,
          name: null,
          avatarUrl: null,
          phone: null,
          marketingConsent: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      await ctx.db.delete(addresses).where(eq(addresses.userId, userId));
      // Sessions/accounts purgés par ON DELETE CASCADE, on garde la ligne
      // anonymisée 30j pour audit légal puis un cron Inngest la purge.
      return { ok: true as const };
    }),
});

function redactSecrets<T extends Record<string, unknown>>(row: T): T {
  const copy: Record<string, unknown> = { ...row };
  for (const k of Object.keys(copy)) {
    if (/token|secret|password/i.test(k)) copy[k] = '[redacted]';
  }
  return copy as T;
}
