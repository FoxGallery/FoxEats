'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Receipt, User } from 'lucide-react';

const TABS = [
  { href: '/app', label: 'Accueil', Icon: Home, match: /^\/app$/ },
  { href: '/app/search', label: 'Explorer', Icon: Search, match: /^\/app\/search/ },
  { href: '/app/orders', label: 'Commandes', Icon: Receipt, match: /^\/app\/orders/ },
  {
    href: '/app/account',
    label: 'Compte',
    Icon: User,
    match: /^\/app\/(account|profile|addresses|privacy)/,
  },
] as const;

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="border-border bg-bg-elevated/95 sticky bottom-0 z-30 mt-auto border-t backdrop-blur-md md:hidden">
      <ul className="mx-auto flex h-[72px] max-w-md items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">
        {TABS.map((t) => {
          const active = t.match.test(pathname);
          const Icon = t.Icon;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className="flex h-full flex-col items-center justify-center gap-0.5"
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 2}
                  className={active ? 'text-ink' : 'text-ink-muted'}
                />
                <span
                  className={`text-[10px] font-medium tracking-tight ${
                    active ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {t.label}
                </span>
                {active && <span className="bg-brand -mt-0.5 h-1 w-1 rounded-full" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
