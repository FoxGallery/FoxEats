import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type HeroStat = { value: string; label: string };

type HeroCTA = {
  label: string;
  href: string;
  /** primary = bg-white text-ink ; secondary = glass border-white/30 */
  variant?: 'primary' | 'secondary';
};

type Props = {
  /** Mot-clé / catégorie affiché dans le badge ("Restaurateurs", "Livreurs FoxEats", etc.) */
  badge: string;
  /** Icône lucide pour le badge */
  badgeIcon: LucideIcon;
  /** Première ligne du H1 — en blanc plein */
  titleLine1: ReactNode;
  /** Deuxième ligne du H1 — rendue avec gradient text */
  titleLine2: ReactNode;
  /** Paragraphe sous-titre 17px */
  description: ReactNode;
  /** 1 ou 2 CTA. Premier = primary (bouton blanc), 2e = secondary (glass) */
  ctas: HeroCTA[];
  /** 3 stats inline avec dividers (28 min / 4.8 / 8 villes) */
  stats: HeroStat[];
  /** Élément visuel à droite — mockup, card, illustration */
  visual: ReactNode;
};

export function HeroBlock({
  badge,
  badgeIcon: BadgeIcon,
  titleLine1,
  titleLine2,
  description,
  ctas,
  stats,
  visual,
}: Props) {
  return (
    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-24 pt-12 text-white md:grid-cols-[1.1fr_1fr] md:pt-20 lg:pb-32 lg:pt-24">
      <div className="flex flex-col items-start">
        {/* Badge */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-widest ring-1 ring-white/20 backdrop-blur-md">
          <BadgeIcon size={12} strokeWidth={2.4} />
          {badge}
        </span>

        {/* H1 — 2 lignes, line 2 en gradient */}
        <h1 className="font-display max-w-3xl text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-[56px] md:text-[72px] lg:text-[88px]">
          {titleLine1 as any}
          <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            {titleLine2 as any}
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/95 md:text-[18px]">
          {description as any}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap gap-3">
          {ctas.map((cta, i) => {
            const isPrimary = (cta.variant ?? (i === 0 ? 'primary' : 'secondary')) === 'primary';
            return (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className={
                  isPrimary
                    ? 'text-ink inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-[14px] font-semibold shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95'
                    : 'inline-flex h-12 items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 text-[14px] font-semibold text-white backdrop-blur-md transition hover:bg-white/20'
                }
              >
                {cta.label}
                <ArrowRight size={14} strokeWidth={2.6} />
              </Link>
            );
          })}
        </div>

        {/* Stats inline avec dividers */}
        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-white">
          {stats.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-center gap-5">
              <div>
                <p className="font-display text-[28px] font-extrabold leading-none tracking-tight">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] text-white/80">{s.label}</p>
              </div>
              {i < Math.min(stats.length, 3) - 1 && <span className="h-10 w-px bg-white/25" />}
            </div>
          ))}
        </div>
      </div>

      {/* Visual à droite */}
      <div className="relative hidden md:block">
        <div className="absolute -inset-4 -z-10 rounded-[44px] bg-white/10 blur-2xl" />
        {visual as any}
      </div>
    </div>
  );
}
