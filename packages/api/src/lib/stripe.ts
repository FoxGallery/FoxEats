import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  _stripe = new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
    appInfo: { name: 'FoxEats', version: '0.1.0' },
  });
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Application fee (commission FoxEats) en centimes.
 * Politique v1 : 15 % du subtotal, plafonné par cohérence côté checkout.
 */
export function applicationFeeCents(subtotalCents: number): number {
  return Math.max(50, Math.round(subtotalCents * 0.15));
}
