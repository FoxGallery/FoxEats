import { router, courierProcedure } from '../trpc';

export const couriersRouter = router({
  // status, location, offers → M5/M7
  status: courierProcedure.query(async () => ({ status: 'offline' })),
});
