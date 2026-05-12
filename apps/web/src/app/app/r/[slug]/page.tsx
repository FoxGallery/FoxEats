'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useCart } from '@/lib/cart';
import { notFound } from 'next/navigation';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@foxeats/api';

type Params = Promise<{ slug: string }>;
type BySlugOutput = inferRouterOutputs<AppRouter>['restaurants']['bySlug'];
type CategoryWithItems = BySlugOutput['categories'][number];
type MenuItem = CategoryWithItems['items'][number];

export default function RestaurantPage({ params }: { params: Params }) {
  const { slug } = use(params);
  const query = trpc.restaurants.bySlug.useQuery({ slug });
  const reviews = trpc.reviews.forRestaurant.useQuery({ slug, limit: 5 });

  if (query.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="aspect-[16/9] animate-pulse rounded-3xl bg-neutral-200" />
        <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-neutral-200" />
      </main>
    );
  }

  if (!query.data) {
    notFound();
  }

  const data: BySlugOutput = query.data;
  const { restaurant: r, categories } = data;
  const photos = (r.photos as string[]) ?? [];
  const cuisines = (r.cuisines as string[]) ?? [];
  const restaurantCtx = { id: r.id, slug: r.slug, name: r.name };

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <BackBar />
      <div className="relative -mt-12 px-4 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-neutral-100 shadow-xl">
          {r.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.coverUrl} alt={r.name} className="h-full w-full object-cover" />
          )}
          {r.isLocalSpecialty && (
            <span className="bg-accent/95 absolute left-4 top-4 rounded-full px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md">
              Spécialité Côte d&apos;Azur
            </span>
          )}
          {r.isAntiWasteEnabled && (
            <span className="bg-success/95 absolute right-4 top-4 rounded-full px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md">
              Anti-gaspi
            </span>
          )}
        </div>

        <div className="mt-6">
          <h1 className="font-display text-ink text-4xl font-bold tracking-tight">{r.name}</h1>
          {r.description && (
            <p className="text-ink-muted mt-2 text-[15px] leading-relaxed">{r.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <span
                key={c}
                className="text-ink-muted rounded-full bg-neutral-100 px-3 py-1 text-[12px] font-medium"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white p-4 ring-1 ring-neutral-100">
            <Stat
              top={`★ ${Number(r.rating ?? 0).toFixed(1)}`}
              bottom={`${r.ratingCount} avis`}
              color="text-accent"
            />
            <Stat
              top={`${r.prepTimeMinMinutes}–${r.prepTimeMaxMinutes} min`}
              bottom="Préparation"
            />
            <Stat
              top={
                r.deliveryFeeCents === 0 ? 'Gratuit' : `${(r.deliveryFeeCents / 100).toFixed(2)} €`
              }
              bottom="Livraison"
            />
          </div>

          <p className="text-ink-muted mt-3 text-[13px]">
            📍 {r.street}, {r.postalCode} {r.city}
          </p>
        </div>

        {photos.length > 1 && (
          <div className="mt-8">
            <h2 className="font-display text-ink text-xl font-semibold tracking-tight">Galerie</h2>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              {photos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={p}
                  alt=""
                  loading="lazy"
                  className="h-32 w-48 shrink-0 rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <section className="mt-8">
          <h2 className="font-display text-ink text-2xl font-bold tracking-tight">Carte</h2>
          <div className="mt-4 space-y-3">
            {categories.map((cat) => (
              <CategoryAccordion key={cat.id} category={cat} restaurant={restaurantCtx} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-ink text-2xl font-bold tracking-tight">Avis</h2>
            {(reviews.data?.aggregate.count ?? 0) > 0 && (
              <span className="text-ink-muted text-[13px]">
                Note moyenne ★ {reviews.data?.aggregate.avg.toFixed(1)} ·{' '}
                {reviews.data?.aggregate.count} avis
              </span>
            )}
          </div>
          <div className="mt-3 space-y-3">
            {reviews.data?.items.length === 0 && (
              <p className="text-ink-muted rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm">
                Pas encore d&apos;avis. Soyez le premier !
              </p>
            )}
            {reviews.data?.items.map((rv) => (
              <article
                key={rv.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100"
              >
                <header className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary grid h-9 w-9 place-items-center rounded-full text-[14px] font-semibold">
                    {rv.authorInitial}
                  </span>
                  <div className="flex-1">
                    <p className="text-ink text-[14px] font-medium">{rv.authorName ?? 'Anonyme'}</p>
                    <p className="text-ink-subtle text-[11px]">
                      {new Date(rv.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="bg-ink rounded-lg px-2 py-1 text-[12px] font-semibold text-white">
                    ★ {rv.rating}
                  </span>
                </header>
                {rv.comment && (
                  <p className="text-ink-muted mt-3 text-[14px] leading-relaxed">{rv.comment}</p>
                )}
                {rv.response && (
                  <div className="text-ink-muted mt-3 rounded-xl bg-neutral-50 p-3 text-[13px]">
                    <span className="text-ink font-medium">Réponse du restaurant : </span>
                    {rv.response}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function BackBar() {
  return (
    <div className="from-surface to-surface/0 sticky top-0 z-10 bg-gradient-to-b px-4 pt-4 sm:px-6">
      <Link
        href="/app"
        className="text-ink inline-flex h-10 items-center gap-2 rounded-full bg-white px-3 text-[14px] font-medium shadow-md ring-1 ring-neutral-100"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <line x1="20" y1="12" x2="4" y2="12" />
          <polyline points="10 18 4 12 10 6" />
        </svg>
        Retour
      </Link>
    </div>
  );
}

function Stat({ top, bottom, color }: { top: string; bottom: string; color?: string }) {
  return (
    <div className="text-center">
      <p className={`font-display text-[15px] font-bold ${color ?? 'text-ink'}`}>{top}</p>
      <p className="text-ink-muted text-[11px]">{bottom}</p>
    </div>
  );
}

function CategoryAccordion({
  category,
  restaurant,
}: {
  category: CategoryWithItems;
  restaurant: { id: string; slug: string; name: string };
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-display text-ink text-[18px] font-semibold tracking-tight">
            {category.name}
          </h3>
          <p className="text-ink-muted mt-0.5 text-[12px]">{category.items.length} plats</p>
        </div>
        <span
          className={`text-ink-muted grid h-8 w-8 place-items-center rounded-full bg-neutral-100 transition ${
            open ? 'rotate-180' : ''
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && (
        <ul className="divide-y divide-neutral-100">
          {category.items.map((item) => (
            <li key={item.id} className="flex gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-ink text-[15px] font-semibold">{item.name}</h4>
                </div>
                {item.description && (
                  <p className="text-ink-muted mt-1 line-clamp-2 text-[13px] leading-snug">
                    {item.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-ink text-[14px] font-semibold">
                    {(item.priceCents / 100).toFixed(2)} €
                  </span>
                  {item.isLocalSpecialty && (
                    <span className="bg-accent/10 text-accent rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      Spé. locale
                    </span>
                  )}
                  {item.isPopular && (
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      Populaire
                    </span>
                  )}
                  {item.isVegan && (
                    <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      Vegan
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="bg-danger/10 text-danger rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      Épicé
                    </span>
                  )}
                </div>
              </div>
              <div className="relative shrink-0">
                {item.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photoUrl}
                    alt=""
                    loading="lazy"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                )}
                <AddToCartButton item={item} restaurant={restaurant} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddToCartButton({
  item,
  restaurant,
}: {
  item: MenuItem;
  restaurant: { id: string; slug: string; name: string };
}) {
  const cart = useCart();
  const currentRestaurant = useCart((s) => s.restaurantId);
  const line = useCart((s) =>
    s.lines.find((l) => l.menuItemId === item.id && l.options.length === 0),
  );
  function onAdd() {
    if (currentRestaurant && currentRestaurant !== restaurant.id) {
      const ok = window.confirm(
        "Votre panier contient déjà des plats d'un autre restaurant. Le vider et ajouter ce plat ?",
      );
      if (!ok) return;
    }
    cart.setRestaurant(restaurant);
    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      unitPriceCents: item.priceCents,
      photoUrl: item.photoUrl ?? undefined,
      options: [],
    });
  }
  if (line) {
    return (
      <div className="bg-primary absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full px-1 py-1 shadow-md">
        <button
          type="button"
          onClick={() => cart.setQuantity(line.lineId, line.quantity - 1)}
          aria-label="Diminuer"
          className="grid h-7 w-7 place-items-center rounded-full text-white hover:bg-white/20"
        >
          −
        </button>
        <span className="min-w-[20px] text-center text-[13px] font-bold text-white">
          {line.quantity}
        </span>
        <button
          type="button"
          onClick={() => cart.setQuantity(line.lineId, line.quantity + 1)}
          aria-label="Augmenter"
          className="grid h-7 w-7 place-items-center rounded-full text-white hover:bg-white/20"
        >
          +
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Ajouter au panier"
      className="text-primary absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-white shadow-md ring-1 ring-neutral-100 transition hover:scale-105"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
