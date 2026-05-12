import { router, protectedProcedure } from '../trpc';

export const cartRouter = router({
  // Le panier est stocké côté client (zustand) ; ce router sert au quote/validation côté serveur
  quote: protectedProcedure.query(async () => ({ subtotal: 0, fees: 0, total: 0 })),
});
