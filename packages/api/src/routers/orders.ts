import { router, protectedProcedure } from '../trpc';

export const ordersRouter = router({
  myOrders: protectedProcedure.query(async () => ({ items: [] as unknown[] })),
  // place, get, cancel, rate → M3/M4
});
