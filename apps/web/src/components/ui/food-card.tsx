'use client';

import Link from 'next/link';
import { Star, Clock } from 'lucide-react';

export type RestaurantCardData = {
  slug: string;
  name: string;
  coverUrl: string | null;
  rating: number | string | null;
  ratingCount?: number;
  prepTimeMinMinutes: number;
  prepTimeMaxMinutes: number;
  deliveryFeeCents: number;
  cuisines?: unknown;
  city?: string;
  isLocalSpecialty?: boolean;
  isAntiWasteEnabled?: boolean;
  distanceKm?: number | null;
};

/** Card resto principale style proto Home — photo 16:10 + nom + rating + delivery + temps */
export function RestaurantCard({ resto, href }: { resto: RestaurantCardData; href: string }) {
  const rating = Number(resto.rating ?? 0);
  return (
    <Link href={href} className="group block">
      <div className="bg-bg-subtle relative aspect-[16/10] overflow-hidden rounded-2xl">
        {resto.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resto.coverUrl}
            alt={resto.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        {resto.isLocalSpecialty && (
          <span className="bg-brand absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
            Spé. Riviera
          </span>
        )}
        {resto.isAntiWasteEnabled && (
          <span className="bg-success absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
            Anti-gaspi
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-ink truncate text-[17px] font-semibold leading-tight">
            {resto.name}
          </h3>
          <p className="text-ink-muted mt-0.5 flex items-center gap-2 text-[12px]">
            <Clock size={12} strokeWidth={2.2} />
            <span>
              {resto.prepTimeMinMinutes}–{resto.prepTimeMaxMinutes} min
            </span>
            <span>·</span>
            <span>
              {resto.deliveryFeeCents === 0
                ? 'Livraison offerte'
                : `${(resto.deliveryFeeCents / 100).toFixed(2)} € livraison`}
            </span>
          </p>
        </div>
        <div className="bg-ink text-ink-inverse flex shrink-0 items-center gap-1 rounded-lg px-2 py-1">
          <Star size={11} fill="currentColor" strokeWidth={0} />
          <span className="text-[12px] font-semibold tabular-nums">{rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Variant compacte horizontale (pour résultats search ou listes secondaires) */
export function RestaurantRow({ resto, href }: { resto: RestaurantCardData; href: string }) {
  const rating = Number(resto.rating ?? 0);
  return (
    <Link
      href={href}
      className="bg-bg-elevated shadow-xs ring-border hover:ring-brand/30 group flex gap-3 rounded-2xl p-2 ring-1 transition"
    >
      <div className="bg-bg-subtle relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        {resto.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resto.coverUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-ink truncate font-semibold">{resto.name}</h3>
          <span className="text-ink flex shrink-0 items-center gap-0.5 text-[12px] font-semibold">
            <Star size={11} fill="currentColor" strokeWidth={0} className="text-brand" />
            {rating.toFixed(1)}
          </span>
        </div>
        <p className="text-ink-muted mt-0.5 truncate text-[12px]">
          {Array.isArray(resto.cuisines)
            ? (resto.cuisines as string[]).slice(0, 2).join(' · ')
            : '—'}
          {resto.city ? ` · ${resto.city}` : ''}
        </p>
        <p className="text-ink-subtle mt-0.5 text-[11px]">
          {resto.prepTimeMinMinutes}–{resto.prepTimeMaxMinutes} min ·{' '}
          {(resto.deliveryFeeCents / 100).toFixed(2)} € livraison
        </p>
      </div>
    </Link>
  );
}

export type MenuItemCardData = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  photoUrl: string | null;
  isPopular?: boolean;
  isVegan?: boolean;
  isLocalSpecialty?: boolean;
  isSpicy?: boolean;
};

/** ListItem plat — proto-style : nom + prix + description gauche, photo carrée droite, bouton/stepper en overlay */
export function MenuItemRow({
  item,
  qty,
  onAdd,
  onInc,
  onDec,
}: {
  item: MenuItemCardData;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <li className="flex gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h4 className="text-ink text-[15px] font-semibold leading-tight">{item.name}</h4>
          {item.isPopular && (
            <span className="bg-brand-soft text-brand rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-wider">
              Pop.
            </span>
          )}
          {item.isLocalSpecialty && (
            <span className="bg-accent-soft text-accent rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-wider">
              Spé.
            </span>
          )}
          {item.isVegan && (
            <span className="bg-success-soft text-success rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-wider">
              Vegan
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-ink-muted mt-1 line-clamp-2 text-[13px] leading-snug">
            {item.description}
          </p>
        )}
        <p className="text-ink mt-2 text-[14px] font-semibold">
          {(item.priceCents / 100).toFixed(2)} €
        </p>
      </div>
      <div className="relative shrink-0">
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt=""
            loading="lazy"
            className="ring-border h-24 w-24 rounded-xl object-cover ring-1"
          />
        ) : (
          <div className="bg-bg-subtle ring-border h-24 w-24 rounded-xl ring-1" />
        )}
        {qty === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            aria-label="Ajouter au panier"
            className="bg-ink text-ink-inverse ring-border-strong absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full shadow-md ring-1 transition hover:scale-105 active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        ) : (
          <div className="bg-ink text-ink-inverse absolute -bottom-2 right-0 flex items-center gap-0 rounded-full px-1 py-1 shadow-md">
            <button
              type="button"
              onClick={onDec}
              aria-label="Diminuer"
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/15"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <span className="min-w-[20px] text-center text-[13px] font-bold">{qty}</span>
            <button
              type="button"
              onClick={onInc}
              aria-label="Augmenter"
              className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/15"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
