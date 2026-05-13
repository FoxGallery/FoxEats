'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Store,
  Bike,
  Scale,
  TicketPercent,
  ArrowLeft,
  Palette,
  Headphones,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/admin/live', label: 'Live ops', icon: Radio },
  { href: '/admin/restaurants', label: 'Restos', icon: Store },
  { href: '/admin/couriers', label: 'Livreurs', icon: Bike },
  { href: '/admin/disputes', label: 'Litiges', icon: Scale },
  { href: '/admin/support', label: 'Support', icon: Headphones },
  { href: '/admin/promos', label: 'Promos', icon: TicketPercent },
  { href: '/admin/design', label: 'Design system', icon: Palette },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="bg-ink text-ink-inverse min-h-screen">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-white/10 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-white/10 px-5 py-5">
              <Link
                href="/"
                className="font-display text-xl font-extrabold tracking-tight text-white"
              >
                FoxEats
              </Link>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-white/50">
                Admin
              </p>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {NAV.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                          active
                            ? 'bg-brand text-white shadow-md'
                            : 'text-white/80 hover:bg-white/5 hover:text-white'
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
            <div className="border-t border-white/10 px-5 py-3">
              <Link
                href="/app"
                className="flex items-center gap-2 text-[12px] text-white/60 hover:text-white hover:underline"
              >
                <ArrowLeft size={12} strokeWidth={2.4} />
                Retour client
              </Link>
            </div>
          </div>
        </aside>

        <main className="bg-bg text-ink min-w-0">{children as any}</main>
      </div>
    </div>
  );
}
