'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin', label: "Vue d'ensemble", icon: '📊' },
  { href: '/admin/live', label: 'Live ops', icon: '🛰️' },
  { href: '/admin/restaurants', label: 'Restos', icon: '🏪' },
  { href: '/admin/couriers', label: 'Livreurs', icon: '🛵' },
  { href: '/admin/disputes', label: 'Litiges', icon: '⚖️' },
  { href: '/admin/promos', label: 'Promos', icon: '🎟️' },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="bg-ink text-ink-inverse min-h-screen">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-white/10 lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-white/10 px-5 py-5">
              <Link href="/" className="font-display text-xl font-bold tracking-tight text-white">
                FoxEats
              </Link>
              <p className="mt-0.5 text-[11px] uppercase tracking-widest text-white/50">Admin</p>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {NAV.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition ${
                          active
                            ? 'bg-accent text-white shadow-sm'
                            : 'text-white/80 hover:bg-white/5'
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
            <div className="border-t border-white/10 px-5 py-3">
              <Link
                href="/app"
                className="block text-[12px] text-white/60 hover:text-white hover:underline"
              >
                ← Retour client
              </Link>
            </div>
          </div>
        </aside>

        <main className="bg-surface text-ink min-w-0">{children}</main>
      </div>
    </div>
  );
}
