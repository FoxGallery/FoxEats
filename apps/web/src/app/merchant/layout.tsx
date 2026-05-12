'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Utensils,
  TicketPercent,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/merchant', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/merchant/orders', label: 'Commandes', icon: Receipt },
  { href: '/merchant/menu', label: 'Menu', icon: Utensils },
  { href: '/merchant/promotions', label: 'Promotions', icon: TicketPercent },
  { href: '/merchant/settings', label: 'Paramètres', icon: Settings },
];

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
    <div className="bg-bg text-ink min-h-screen">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-border bg-bg-elevated hidden border-r lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-border border-b px-5 py-5">
              <Link
                href="/"
                className="font-display text-ink text-[20px] font-extrabold tracking-tight"
              >
                FoxEats
              </Link>
              <p className="text-ink-muted mt-0.5 text-[11px] font-semibold uppercase tracking-widest">
                Espace restaurant
              </p>
            </div>

            <div className="border-border border-b px-5 py-3">
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
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                          active ? 'bg-brand text-white shadow-md' : 'text-ink hover:bg-bg-subtle'
                        }`}
                      >
                        <Icon size={18} strokeWidth={2.2} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-border border-t px-5 py-3">
              <Link
                href="/app"
                className="text-ink-muted hover:text-ink flex items-center gap-2 text-[12px] hover:underline"
              >
                <ArrowLeft size={12} strokeWidth={2.4} />
                Retour à l&apos;app client
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0">{children as any}</main>
      </div>
    </div>
  );
}

function RestaurantSwitcher() {
  const restaurants = trpc.merchant.myRestaurants.useQuery();
  if (restaurants.isLoading) {
    return <div className="skeleton h-9 rounded-lg" />;
  }
  if (!restaurants.data || restaurants.data.length === 0) {
    return (
      <Link
        href="/merchant/onboarding"
        className="bg-brand block rounded-lg px-3 py-2 text-[13px] font-semibold text-white"
      >
        + Créer un restaurant
      </Link>
    );
  }
  return (
    <select
      className="border-border bg-bg text-ink focus:border-brand focus:ring-brand/15 h-9 w-full rounded-lg border px-2 text-[14px] outline-none focus:ring-4"
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
