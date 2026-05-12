import { z } from 'zod';
import { and, eq, inArray } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { restaurants, menuItems, promos as promosTable } from '@foxeats/db/schema';
import { quote, type QuoteInput } from '@foxeats/cart';
import { TRPCError } from '@trpc/server';

const lineInput = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  options: z.array(z.object({ id: z.string(), priceDeltaCents: z.number().int() })).default([]),
});

export const cartRouter = router({
  quote: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().uuid(),
        lines: z.array(lineInput).min(1).max(50),
        promoCode: z.string().min(1).max(40).optional(),
        tipCents: z.number().int().min(0).max(10_000).default(0),
        foxCoinsAppliedCents: z.number().int().min(0).max(10_000).default(0),
        addressOk: z.boolean().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [resto] = await ctx.db
        .select({
          id: restaurants.id,
          status: restaurants.status,
          deliveryFeeCents: restaurants.deliveryFeeCents,
          deliveryMinCents: restaurants.deliveryMinCents,
        })
        .from(restaurants)
        .where(eq(restaurants.id, input.restaurantId))
        .limit(1);
      if (!resto || resto.status !== 'active') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Restaurant indisponible' });
      }

      const itemIds = input.lines.map((l) => l.menuItemId);
      const items = await ctx.db
        .select({
          id: menuItems.id,
          restaurantId: menuItems.restaurantId,
          priceCents: menuItems.priceCents,
          isAvailable: menuItems.isAvailable,
          name: menuItems.name,
        })
        .from(menuItems)
        .where(and(eq(menuItems.restaurantId, resto.id), inArray(menuItems.id, itemIds)));
      const byId = new Map(items.map((i) => [i.id, i]));

      const serverLines: QuoteInput['lines'] = [];
      const unavailable: string[] = [];
      for (const line of input.lines) {
        const it = byId.get(line.menuItemId);
        if (!it || !it.isAvailable) {
          unavailable.push(it?.name ?? line.menuItemId);
          continue;
        }
        serverLines.push({
          unitPriceCents: it.priceCents,
          quantity: line.quantity,
          options: line.options.map((o) => ({
            id: o.id,
            name: '',
            priceDeltaCents: o.priceDeltaCents,
          })),
        });
      }

      let promo: QuoteInput['promo'] = null;
      let promoError: string | null = null;
      if (input.promoCode) {
        const [p] = await ctx.db
          .select()
          .from(promosTable)
          .where(eq(promosTable.code, input.promoCode.toUpperCase()))
          .limit(1);
        if (!p || !p.isActive) {
          promoError = 'Code invalide';
        } else if (p.validUntil && p.validUntil.getTime() < Date.now()) {
          promoError = 'Code expiré';
        } else if (p.maxUsages && p.usagesCount >= p.maxUsages) {
          promoError = 'Code épuisé';
        } else {
          switch (p.type) {
            case 'percent_off':
              promo = { kind: 'percent', valuePercent: p.valuePercent ?? 0 };
              break;
            case 'amount_off':
              promo = { kind: 'amount', valueCents: p.valueCents ?? 0 };
              break;
            case 'free_delivery':
              promo = { kind: 'free_delivery' };
              break;
            case 'first_order':
              promo = { kind: 'amount', valueCents: p.valueCents ?? 500 };
              break;
            case 'referral':
              promo = { kind: 'amount', valueCents: p.valueCents ?? 500 };
              break;
            case 'foxpass_perk':
              promo = { kind: 'free_delivery' };
              break;
          }
        }
      }

      const q = quote({
        lines: serverLines,
        deliveryFeeCents: resto.deliveryFeeCents,
        promo,
        tipCents: input.tipCents,
        foxCoinsAppliedCents: input.foxCoinsAppliedCents,
      });

      const belowMin = q.subtotalCents < resto.deliveryMinCents;

      return {
        ...q,
        deliveryMinCents: resto.deliveryMinCents,
        belowMinimum: belowMin,
        unavailableItems: unavailable,
        promoError,
        promoApplied: !!promo,
        canPlaceOrder: !belowMin && unavailable.length === 0 && input.addressOk,
      };
    }),
});
