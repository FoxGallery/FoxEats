'use client';

import { use, useState } from 'react';
import { Star, Clock, Truck, MapPin, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useCart } from '@/lib/cart';
import { notFound } from 'next/navigation';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@foxeats/api';
import { MenuItemRow } from '@/components/ui/food-card';
import { restoPhoto, dishPhoto } from '@/lib/photos';

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
      <main className="pb-24">
        <div className="skeleton aspect-[16/9] w-full" />
        <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6">
          <div className="skeleton h-9 w-2/3 rounded" />
          <div className="skeleton mt-3 h-4 w-full rounded" />
          <div className="skeleton mt-2 h-4 w-1/2 rounded" />
        </div>
      </main>
    );
  }

  if (!query.data) {
    notFound();
  }

  const data: BySlugOutput = query.data;
  const { restaurant: r, categories } = data;
  const cuisines = (r.cuisines as string[]) ?? [];
  const restaurantCtx = { id: r.id, slug: r.slug, name: r.name };
  const cover = r.coverUrl ?? restoPhoto(r.slug);

  return (
    <main className="pb-32">
      {/* Hero with cover */}
      <div className="relative">
        <div className="bg-bg-subtle relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={r.name} className="h-full w-full object-cover" />
          )}
          <div className="to-bg absolute inset-0 bg-gradient-to-b from-black/30 via-transparent" />
          <Link
            href="/app"
            aria-label="Retour"
            className="text-ink absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-105"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </Link>
          <div className="absolute right-4 top-4 flex gap-2">
            {r.isLocalSpecialty && (
              <span className="bg-brand rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
                Spé. Riviera
              </span>
            )}
            {r.isAntiWasteEnabled && (
              <span className="bg-success rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
                Anti-gaspi
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-3xl px-4 sm:px-6">
        {/* Card resto */}
        <div className="border-border bg-bg-elevated shadow-food rounded-3xl border p-5">
          <h1 className="font-display text-ink text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">
            {r.name}
          </h1>
          {r.description && (
            <p className="text-ink-muted mt-2 text-[14px] leading-relaxed">{r.description}</p>
          )}

          {cuisines.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cuisines.slice(0, 5).map((c) => (
                <span
                  key={c}
                  className="bg-bg-subtle text-ink-muted rounded-full px-2.5 py-1 text-[11px] font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="divide-border bg-bg-subtle mt-4 grid grid-cols-3 divide-x overflow-hidden rounded-2xl">
            <StatBox
              icon={<Star size={14} fill="currentColor" strokeWidth={0} className="text-brand" />}
              top={Number(r.rating ?? 0).toFixed(1)}
              bottom={`${r.ratingCount} avis`}
            />
            <StatBox
              icon={<Clock size={14} strokeWidth={2.4} />}
              top={`${r.prepTimeMinMinutes}–${r.prepTimeMaxMinutes}'`}
              bottom="préparation"
            />
            <StatBox
              icon={<Truck size={14} strokeWidth={2.4} />}
              top={
                r.deliveryFeeCents === 0 ? 'Offerte' : `${(r.deliveryFeeCents / 100).toFixed(2)} €`
              }
              bottom="livraison"
            />
          </div>

          <p className="text-ink-muted mt-3 flex items-center gap-1.5 text-[12px]">
            <MapPin size={12} strokeWidth={2.2} />
            {r.street}, {r.postalCode} {r.city}
          </p>
        </div>

        {/* Quick category nav */}
        {categories.length > 1 && (
          <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="border-border bg-bg-elevated text-ink hover:border-ink/30 shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium"
              >
                {cat.name}
              </a>
            ))}
          </nav>
        )}

        {/* Menu sections */}
        <section className="mt-8 space-y-3">
          {categories.map((cat) => (
            <CategorySection key={cat.id} category={cat} restaurant={restaurantCtx} />
          ))}
        </section>

        {/* Reviews */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-ink text-[22px] font-bold tracking-tight">Avis</h2>
            {(reviews.data?.aggregate.count ?? 0) > 0 && (
              <span className="text-ink-muted text-[12px]">
                ★ {reviews.data?.aggregate.avg.toFixed(1)} · {reviews.data?.aggregate.count} avis
              </span>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {reviews.data?.items.length === 0 && (
              <p className="border-border bg-bg-elevated text-ink-muted rounded-2xl border border-dashed px-4 py-8 text-center text-[13px]">
                Pas encore d&apos;avis. Soyez le premier !
              </p>
            )}
            {reviews.data?.items.map((rv) => (
              <article
                key={rv.id}
                className="border-border bg-bg-elevated shadow-xs rounded-2xl border p-4"
              >
                <header className="flex items-center gap-3">
                  <span className="bg-brand-soft text-brand grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold">
                    {rv.authorInitial}
                  </span>
                  <div className="flex-1">
                    <p className="text-ink text-[14px] font-semibold">
                      {rv.authorName ?? 'Anonyme'}
                    </p>
                    <p className="text-ink-subtle text-[11px]">
                      {new Date(rv.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="bg-ink text-ink-inverse flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold">
                    <Star size={10} fill="currentColor" strokeWidth={0} />
                    {rv.rating}
                  </span>
                </header>
                {rv.comment && (
                  <p className="text-ink-muted mt-3 text-[14px] leading-relaxed">{rv.comment}</p>
                )}
                {rv.response && (
                  <div className="bg-bg-subtle text-ink-muted mt-3 rounded-xl p-3 text-[13px]">
                    <span className="text-ink font-semibold">Réponse : </span>
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

function StatBox({ icon, top, bottom }: { icon: React.ReactNode; top: string; bottom: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-3 text-center">
      <span className="font-display text-ink flex items-center gap-1 text-[14px] font-bold tracking-tight">
        {icon as any}
        <span>{top}</span>
      </span>
      <span className="text-ink-subtle mt-0.5 text-[11px]">{bottom}</span>
    </div>
  );
}

function CategorySection({
  category,
  restaurant,
}: {
  category: CategoryWithItems;
  restaurant: { id: string; slug: string; name: string };
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      id={`cat-${category.id}`}
      className="border-border bg-bg-elevated overflow-hidden rounded-2xl border"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hover:bg-bg-subtle flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition"
      >
        <div>
          <h3 className="font-display text-ink text-[18px] font-semibold tracking-tight">
            {category.name}
          </h3>
          <p className="text-ink-subtle mt-0.5 text-[11px]">
            {category.items.length} plat{category.items.length > 1 ? 's' : ''}
          </p>
        </div>
        <span
          className={`bg-bg-subtle text-ink-muted grid h-8 w-8 place-items-center rounded-full transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          <ChevronDown size={16} strokeWidth={2.4} />
        </span>
      </button>
      {open && (
        <ul className="divide-border divide-y px-5">
          {category.items.map((item) => (
            <ItemConnected key={item.id} item={item} restaurant={restaurant} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemConnected({
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
  const qty = line?.quantity ?? 0;

  const itemData = {
    id: item.id,
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    photoUrl: item.photoUrl ?? dishPhoto(item.name),
    isPopular: item.isPopular,
    isVegan: item.isVegan,
    isLocalSpecialty: item.isLocalSpecialty,
    isSpicy: item.isSpicy,
  };

  function add() {
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

  return (
    <MenuItemRow
      item={itemData}
      qty={qty}
      onAdd={add}
      onInc={() => line && cart.setQuantity(line.lineId, qty + 1)}
      onDec={() => line && cart.setQuantity(line.lineId, qty - 1)}
    />
  );
}
