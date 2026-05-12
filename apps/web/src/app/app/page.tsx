'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@foxeats/api';

type RestaurantListItem = inferRouterOutputs<AppRouter>['restaurants']['list']['items'][number];
type Cuisine = inferRouterInputs<AppRouter>['restaurants']['list']['cuisine'];

const CATEGORIES = [
  { id: 'all', label: 'Tout', color: 'bg-primary' },
  { id: 'niçoise', label: 'Niçois', color: 'bg-accent' },
  { id: 'italian', label: 'Italien', color: 'bg-[#3a8c5b]' },
  { id: 'pizza', label: 'Pizza', color: 'bg-[#c8261a]' },
  { id: 'japanese', label: 'Japonais', color: 'bg-[#171c2a]' },
  { id: 'burger', label: 'Burger', color: 'bg-[#e6a100]' },
  { id: 'healthy', label: 'Healthy', color: 'bg-[#1a8f4e]' },
  { id: 'vegan', label: 'Vegan', color: 'bg-[#4fb3a4]' },
  { id: 'dessert', label: 'Dessert', color: 'bg-[#d6336c]' },
];

export default function AppHomePage() {
  const [city, setCity] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<string | null>(null);

  const cities = trpc.restaurants.cities.useQuery();
  const list = trpc.restaurants.list.useQuery({
    city: city ?? undefined,
    cuisine: cuisine && cuisine !== 'all' ? (cuisine as Cuisine) : undefined,
    sort: 'rating',
    limit: 20,
  });
  const popular = trpc.restaurants.popular.useQuery({ city: city ?? undefined, limit: 8 });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <header className="flex items-center justify-between">
        <CitySelector cities={cities.data ?? []} value={city} onChange={setCity} />
        <Link
          href="/app/account"
          className="text-ink grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-neutral-100"
          aria-label="Compte"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
        </Link>
      </header>

      <Link
        href="/app/search"
        className="text-ink-muted hover:border-primary/30 mt-4 flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 shadow-sm transition"
      >
        <SearchIcon />
        <span className="text-[15px]">Rechercher un plat, un resto, une cuisine…</span>
      </Link>

      <section className="mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCuisine(c.id === cuisine ? null : c.id)}
              className={`flex shrink-0 flex-col items-center gap-1.5`}
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-full text-2xl shadow-md ring-2 transition ${
                  cuisine === c.id
                    ? `${c.color} ring-primary/30 scale-105`
                    : `${c.color} ring-transparent`
                }`}
              >
                <CategoryEmoji id={c.id} />
              </span>
              <span
                className={`text-[12px] ${cuisine === c.id ? 'text-ink font-semibold' : 'text-ink-muted'}`}
              >
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="Les meilleurs" subtitle={city ? `à ${city}` : "sur la Côte d'Azur"} />
        <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {popular.data?.map((r) => (
            <RestaurantCardCompact key={r.id} resto={r} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Tous les restaurants"
          subtitle={
            cuisine && cuisine !== 'all'
              ? `${CATEGORIES.find((c) => c.id === cuisine)?.label} · ${list.data?.items.length ?? 0} résultats`
              : `${list.data?.items.length ?? 0} adresses`
          }
        />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {list.data?.items.map((r) => (
            <RestaurantCard key={r.id} resto={r} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-ink text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle && <span className="text-ink-muted text-[13px]">{subtitle}</span>}
    </div>
  );
}

function CitySelector({
  cities,
  value,
  onChange,
}: {
  cities: string[];
  value: string | null;
  onChange: (c: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="bg-accent/15 text-accent grid h-10 w-10 place-items-center rounded-full">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 22s-8-7.5-8-13a8 8 0 1 1 16 0c0 5.5-8 13-8 13z" />
          <circle cx="12" cy="9" r="3" />
        </svg>
      </span>
      <div>
        <p className="text-ink-muted text-[11px] uppercase tracking-wider">Livrer à</p>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="font-display text-ink bg-transparent text-[16px] font-semibold outline-none"
        >
          <option value="">Toute la Côte d&apos;Azur</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RestaurantCard({ resto }: { resto: RestaurantListItem }) {
  return (
    <Link
      href={`/app/r/${resto.slug}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {resto.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resto.coverUrl}
            alt={resto.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        )}
        {resto.isLocalSpecialty && (
          <span className="bg-accent/95 absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-md">
            Spécialité Côte d&apos;Azur
          </span>
        )}
        {resto.isAntiWasteEnabled && (
          <span className="bg-success/95 absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-md">
            Anti-gaspi
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-ink truncate text-[17px] font-semibold">
              {resto.name}
            </h3>
            <p className="text-ink-muted mt-0.5 line-clamp-1 text-[13px]">
              {(resto.cuisines as string[]).slice(0, 3).join(' · ')}
            </p>
          </div>
          <div className="bg-ink flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-white">
            <span className="text-[12px]">★</span>
            <span className="text-[12px] font-semibold">
              {Number(resto.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="text-ink-muted mt-3 flex items-center gap-3 text-[12px]">
          <span>
            {resto.prepTimeMinMinutes}–{resto.prepTimeMaxMinutes} min
          </span>
          <span>·</span>
          <span>
            {resto.deliveryFeeCents === 0
              ? 'Livraison offerte'
              : `${(resto.deliveryFeeCents / 100).toFixed(2)} € livraison`}
          </span>
          {'distanceKm' in resto &&
            typeof resto.distanceKm === 'number' &&
            resto.distanceKm > 0 && (
              <>
                <span>·</span>
                <span>{resto.distanceKm.toFixed(1)} km</span>
              </>
            )}
        </div>
      </div>
    </Link>
  );
}

function RestaurantCardCompact({
  resto,
}: {
  resto: {
    id: string;
    slug: string;
    name: string;
    coverUrl: string | null;
    rating: string | null;
    prepTimeMinMinutes: number;
    prepTimeMaxMinutes: number;
    city: string;
    cuisines: unknown;
  };
}) {
  return (
    <Link
      href={`/app/r/${resto.slug}`}
      className="group block w-[240px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        {resto.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resto.coverUrl}
            alt={resto.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-ink truncate text-[14px] font-semibold">{resto.name}</h3>
          <span className="text-accent text-[12px] font-semibold">
            ★ {Number(resto.rating ?? 0).toFixed(1)}
          </span>
        </div>
        <p className="text-ink-muted mt-0.5 truncate text-[11px]">
          {(resto.cuisines as string[]).slice(0, 2).join(' · ')} · {resto.city}
        </p>
      </div>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CategoryEmoji({ id }: { id: string }) {
  const map: Record<string, string> = {
    all: '🍽️',
    niçoise: '🥗',
    italian: '🍝',
    pizza: '🍕',
    japanese: '🍱',
    burger: '🍔',
    healthy: '🥑',
    vegan: '🌱',
    dessert: '🍰',
  };
  return <span aria-hidden="true">{map[id] ?? '🍴'}</span>;
}
