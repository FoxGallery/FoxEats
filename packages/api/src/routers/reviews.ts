import { router, publicProcedure } from '../trpc';

export const reviewsRouter = router({
  forRestaurant: publicProcedure.query(async () => ({ items: [] as unknown[] })),
});
