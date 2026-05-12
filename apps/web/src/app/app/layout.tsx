import type { ReactNode } from 'react';
import { CartFab } from '@/components/cart-fab';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CartFab />
    </>
  );
}
