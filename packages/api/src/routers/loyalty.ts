import { router, protectedProcedure } from '../trpc';

export const loyaltyRouter = router({
  // FoxCoins balance + FoxPass status → M11
  balance: protectedProcedure.query(async () => ({ foxCoinsCents: 0, foxPassActive: false })),
});
