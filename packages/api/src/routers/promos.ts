import { router, protectedProcedure } from '../trpc';

export const promosRouter = router({
  validate: protectedProcedure.query(async () => ({ valid: false })),
});
