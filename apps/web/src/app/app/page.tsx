'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  User,
  Sparkles,
  Salad,
  UtensilsCrossed,
  Pizza,
  Fish,
  Beef,
  Apple,
  Leaf,
  Cake,
  Leaf as Sprout,
  Crown,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@foxeats/api';
import { Chip } from '@/components/ui/chip';
import { RestaurantCard, type RestaurantCardData } from '@/components/ui/food-card';
import { restoPhoto } from '@/lib/photos';

type RestaurantListItem = inferRouterOutputs<AppRouter>['restaurants']['list']['items'][number];
type Cuisine = inferRouterInputs<AppRouter>['restaurants']['list']['cuisine'];

const CATEGORIES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'Tout', icon: Sparkles },
  { id: 'niçoise', label: 'Niçois', icon: Salad },
  { id: 'italian', label: 'Italien', icon: UtensilsCrossed },
  { id: 'pizza', label: 'Pizza', icon: Pizza },
  { id: 'japanese', label: 'Japonais', icon: Fish },
  { id: 'burger', label: 'Burger', icon: Beef },
  { id: 'healthy', label: 'Healthy', icon: Apple },
  { id: 'vegan', label: 'Vegan', icon: Leaf },
  { id: 'dessert', label: 'Dessert', icon: Cake },
];

function withFallbackPhoto(r: RestaurantListItem): RestaurantCardData {
  return {
    slug: r.slug,
    name: r.name,
    coverUrl: r.coverUrl ?? restoPhoto(r.slug),
    rating: r.rating ?? 0,
    prepTimeMinMinutes: r.prepTimeMinMinutes,
    prepTimeMaxMinutes: r.prepTimeMaxMinutes,
    deliveryFeeCents: r.deliveryFeeCents,
    cuisines: r.cuisines,
    city: 'city' in r ? (r as any).city : undefined,
    isLocalSpecialty: r.isLocalSpecialty,
    isAntiWasteEnabled: r.isAntiWasteEnabled,
    distanceKm: 'distanceKm' in r ? (r as any).distanceKm : null,
  };
}

export default function AppHomePage() {
  const [city, setCity] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<string>('all');

  const cities = trpc.restaurants.cities.useQuery();
  const list = trpc.restaurants.list.useQuery({
    city: city ?? undefined,
    cuisine: cuisine !== 'all' ? (cuisine as Cuisine) : undefined,
    sort: 'rating',
    limit: 20,
  });
  const popular = trpc.restaurants.popular.useQuery({ city: city ?? undefined, limit: 8 });

  return (
    <main className="pb-32">
      {/* Top bar */}
      <header className="border-border bg-bg/85 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="bg-brand-soft text-brand grid h-9 w-9 shrink-0 place-items-center rounded-full">
              <MapPin size={16} strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <p className="text-ink-subtle text-[10px] font-semibold uppercase tracking-widest">
                Livrer à
              </p>
              <select
                value={city ?? ''}
                onChange={(e) => setCity(e.target.value || null)}
                className="font-display text-ink max-w-[200px] truncate bg-transparent text-[15px] font-bold tracking-tight outline-none sm:max-w-none"
              >
                <option value="">Côte d&apos;Azur</option>
                {cities.data?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Link
            href="/app/account"
            className="border-border bg-bg-elevated text-ink hover:bg-bg-subtle grid h-9 w-9 place-items-center rounded-full border"
            aria-label="Compte"
          >
            <User size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Search */}
        <Link
          href="/app/search"
          className="border-border bg-bg-elevated text-ink-muted shadow-xs hover:border-brand/30 mt-5 flex h-14 items-center gap-3 rounded-2xl border px-4 transition"
        >
          <Search size={18} strokeWidth={2.2} />
          <span className="text-[15px]">Rechercher un plat, un resto, une cuisine…</span>
        </Link>

        {/* Cuisine chips */}
        <section className="mt-5">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <Chip
                  key={c.id}
                  active={cuisine === c.id}
                  tone={c.id === 'all' ? 'brand' : 'ink'}
                  onClick={() => setCuisine(c.id)}
                  leading={<Icon size={14} strokeWidth={2.2} aria-hidden />}
                >
                  {c.label}
                </Chip>
              );
            })}
          </div>
        </section>

        {/* Highlight banner anti-gaspi / FoxPass */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <BannerCard
            title="Anti-gaspi"
            subtitle="Jusqu'à -50 % sur les invendus du jour"
            href="/app/search?antiWaste=1"
            tone="success"
            icon={Sprout}
          />
          <BannerCard
            title="FoxPass"
            subtitle="Livraison offerte, illimitée — 4,99 €/mois"
            href="/app/account"
            tone="brand"
            icon={Crown}
          />
        </section>

        {/* Popular */}
        <section className="mt-10">
          <SectionHeader
            title="Les meilleurs"
            subtitle={city ? `à ${city}` : "sur la Côte d'Azur"}
          />
          <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
            {popular.data?.map((r) => (
              <Link key={r.id} href={`/app/r/${r.slug}`} className="block w-[260px] shrink-0">
                <div className="bg-bg-subtle relative aspect-[4/3] overflow-hidden rounded-2xl">
                  {(r.coverUrl ?? restoPhoto(r.slug)) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.coverUrl ?? restoPhoto(r.slug)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
                  <span className="bg-ink/90 text-ink-inverse absolute right-2 top-2 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                    ★ {Number(r.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 px-1">
                  <p className="font-display text-ink truncate text-[15px] font-semibold">
                    {r.name}
                  </p>
                  <p className="text-ink-muted truncate text-[12px]">
                    {Array.isArray(r.cuisines)
                      ? (r.cuisines as string[]).slice(0, 2).join(' · ')
                      : ''}
                    {' · '}
                    {r.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All restaurants */}
        <section className="mt-12">
          <SectionHeader
            title="Tous les restaurants"
            subtitle={
              cuisine !== 'all'
                ? `${CATEGORIES.find((c) => c.id === cuisine)?.label} · ${list.data?.items.length ?? 0} résultats`
                : `${list.data?.items.length ?? 0} adresses`
            }
          />
          <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.data?.items.map((r) => (
              <RestaurantCard key={r.id} resto={withFallbackPhoto(r)} href={`/app/r/${r.slug}`} />
            ))}
          </div>
          {list.isLoading && (
            <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton aspect-[16/10] rounded-2xl" />
                  <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                  <div className="skeleton mt-2 h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-display text-ink text-[22px] font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {subtitle && <span className="text-ink-muted text-[12px]">{subtitle}</span>}
    </div>
  );
}

function BannerCard({
  title,
  subtitle,
  href,
  tone,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  href: string;
  tone: 'brand' | 'success';
  icon: LucideIcon;
}) {
  const cls =
    tone === 'brand'
      ? 'from-brand to-brand-hover text-white'
      : 'from-success to-[#0E7A60] text-white';
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${cls} hover:shadow-food p-4 shadow-sm transition hover:-translate-y-0.5`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
        <Icon size={22} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-[16px] font-bold tracking-tight">{title}</p>
        <p className="truncate text-[12px] opacity-90">{subtitle}</p>
      </div>
      <ArrowRight size={18} strokeWidth={2.4} className="ml-auto shrink-0 text-white/80" />
    </Link>
  );
}
