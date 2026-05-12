import { router, protectedProcedure } from '../trpc';

export const meRouter = router({
  get: protectedProcedure.query(({ ctx }) => ctx.session.user),
  // updateProfile, addresses CRUD, etc. → M1
});
