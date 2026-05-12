import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { promos } from '@foxeats/db/schema';

export const promosRouter = router({
  validate: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(40) }))
    .query(async ({ ctx, input }) => {
      const [p] = await ctx.db
        .select()
        .from(promos)
        .where(eq(promos.code, input.code.toUpperCase()))
        .limit(1);
      if (!p) return { valid: false as const, reason: 'Code inconnu' };
      if (!p.isActive) return { valid: false as const, reason: 'Code désactivé' };
      if (p.validUntil && p.validUntil.getTime() < Date.now())
        return { valid: false as const, reason: 'Code expiré' };
      if (p.maxUsages && p.usagesCount >= p.maxUsages)
        return { valid: false as const, reason: 'Code épuisé' };
      return {
        valid: true as const,
        type: p.type,
        valueCents: p.valueCents,
        valuePercent: p.valuePercent,
        minOrderCents: p.minOrderCents,
      };
    }),
});
