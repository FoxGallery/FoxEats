import { router, protectedProcedure } from '../trpc';

export const paymentsRouter = router({
  // createPaymentIntent, confirmPayment → M3 (Stripe Connect)
  setupIntent: protectedProcedure.query(async () => ({ clientSecret: '' })),
});
