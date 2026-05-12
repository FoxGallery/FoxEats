import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const restaurantsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        city: z.string().optional(),
        cuisine: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input: _input, ctx: _ctx }) => {
      // M2 — query Drizzle avec filtres + pagination cursor + geosort
      return { items: [] as unknown[], nextCursor: null as string | null };
    }),

  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async () => {
    // M2 — fetch resto avec menu en cascade
    return null as unknown;
  }),
});
