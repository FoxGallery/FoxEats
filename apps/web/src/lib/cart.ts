'use client';

import { createCartStore } from '@foxeats/cart';

export const useCart = createCartStore({
  name: 'foxeats-cart-v1',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});
