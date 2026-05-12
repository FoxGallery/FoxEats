'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';

export function CartFab() {
  const count = useCart((s) => s.itemCount());
  const subtotal = useCart((s) => s.subtotalCents());
  if (count === 0) return null;
  return (
    <Link
      href="/app/cart"
      className="bg-brand hover:bg-brand-hover fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between rounded-full px-6 py-3 text-white shadow-2xl transition sm:left-auto sm:right-6 sm:max-w-xs"
    >
      <span className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-[12px] font-bold">
          {count}
        </span>
        <span className="text-[14px] font-semibold">Voir le panier</span>
      </span>
      <span className="text-[14px] font-semibold">{(subtotal / 100).toFixed(2)} €</span>
    </Link>
  );
}
