import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type Variant = 'transparent' | 'solid';

export function SiteHeader({ variant = 'transparent' }: { variant?: Variant }) {
  const isTransparent = variant === 'transparent';
  const linkCls = isTransparent
    ? 'text-white/85 hover:text-white'
    : 'text-ink-muted hover:text-ink';
  const wrap = isTransparent ? 'text-white' : 'border-b border-border bg-bg/80 backdrop-blur-md';

  return (
    <header className={`relative z-20 ${wrap}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className={`font-display text-[22px] font-extrabold tracking-tight ${isTransparent ? 'text-white' : 'text-ink'}`}
        >
          FoxEats
        </Link>
        <nav className="hidden gap-7 text-[14px] md:flex">
          <Link href="/cities/nice" className={linkCls}>
            Villes
          </Link>
          <Link href="/partners" className={linkCls}>
            Partenaires
          </Link>
          <Link href="/couriers" className={linkCls}>
            Livreurs
          </Link>
          <Link href="/blog" className={linkCls}>
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {!isTransparent && (
            <div className="hidden sm:block">
              <ThemeToggle compact />
            </div>
          )}
          <Link
            href="/login"
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              isTransparent
                ? 'bg-bg-elevated text-ink shadow-md hover:bg-white/95'
                : 'bg-ink text-ink-inverse hover:opacity-90'
            }`}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
