import { router, adminProcedure } from '../trpc';

export const adminRouter = router({
  stats: adminProcedure.query(async () => ({
    liveOrders: 0,
    onlineCouriers: 0,
    activeRestaurants: 0,
  })),
});
