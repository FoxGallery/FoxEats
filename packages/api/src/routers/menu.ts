import { router, merchantProcedure } from '../trpc';

export const menuRouter = router({
  // CRUD catégories/items pour le merchant → M6
  myMenu: merchantProcedure.query(async () => ({ categories: [] as unknown[] })),
});
