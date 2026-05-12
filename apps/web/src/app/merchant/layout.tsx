'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';

const NAV = [
  { href: '/merchant', label: "Vue d'ensemble", icon: '📊' },
  { href: '/merchant/orders', label: 'Commandes', icon: '🧾' },
  { href: '/merchant/menu', label: 'Menu', icon: '🍽️' },
  { href: '/merchant/promotions', label: 'Promotions', icon: '🎟️' },
  { href: '/merchant/settings', label: 'Paramètres', icon: '⚙️' },
] as const;

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const restaurants = trpc.merchant.myRestaurants.useQuery();

  // Si l'utilisateur n'a aucun resto et n'est pas sur l'onboarding, redirect.
  useEffect(() => {
    if (
      restaurants.data &&
      restaurants.data.length === 0 &&
      !pathname.startsWith('/merchant/onboarding')
    ) {
      router.replace('/merchant/onboarding');
    }
  }, [restaurants.data, pathname, router]);

  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-neutral-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-neutral-100 px-5 py-5">
              <Link href="/" className="font-display text-primary text-xl font-bold tracking-tight">
                FoxEats
              </Link>
              <p className="text-ink-muted mt-0.5 text-[11px] uppercase tracking-widest">
                Espace restaurant
              </p>
            </div>

            <div className="border-b border-neutral-100 px-5 py-3">
              <p className="text-ink-subtle mb-1.5 text-[11px] font-semibold uppercase tracking-wider">
                Établissement
              </p>
              <RestaurantSwitcher />
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {NAV.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/merchant' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition ${
                          active
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-ink hover:bg-neutral-50'
                        }`}
                      >
                        <span aria-hidden>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-neutral-100 px-5 py-3">
              <Link
                href="/app"
                className="text-ink-muted hover:text-ink block text-[12px] hover:underline"
              >
                ← Retour à l&apos;app client
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function RestaurantSwitcher() {
  const restaurants = trpc.merchant.myRestaurants.useQuery();
  if (restaurants.isLoading) {
    return <div className="h-9 animate-pulse rounded-lg bg-neutral-100" />;
  }
  if (!restaurants.data || restaurants.data.length === 0) {
    return (
      <Link
        href="/merchant/onboarding"
        className="bg-accent block rounded-lg px-3 py-2 text-[13px] font-medium text-white"
      >
        + Créer un restaurant
      </Link>
    );
  }
  return (
    <select
      className="focus:border-primary focus:ring-primary/15 h-9 w-full rounded-lg border border-neutral-200 bg-white px-2 text-[14px] outline-none focus:ring-2"
      defaultValue={restaurants.data[0]?.id}
    >
      {restaurants.data.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
