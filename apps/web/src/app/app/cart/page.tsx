'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Tag, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { trpc } from '@/lib/trpc';
import { BottomCta, StickyBottomBar } from '@/components/ui/bottom-cta';
import { Chip } from '@/components/ui/chip';
import { dishPhoto } from '@/lib/photos';

const TIPS = [0, 100, 200, 300];

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();

  // Fire cart/abandoned event si user quitte la page avec un panier non vide
  // (Inngest gère ensuite la séquence relance 1h/24h/7j et annule au checkout)
  useEffect(() => {
    function fireAbandoned() {
      if (!cart.restaurantId || cart.lines.length === 0) return;
      const subtotalCents = cart.lines.reduce(
        (acc, l) =>
          acc +
          (l.unitPriceCents + l.options.reduce((s, o) => s + o.priceDeltaCents, 0)) * l.quantity,
        0,
      );
      const payload = JSON.stringify({
        restaurantId: cart.restaurantId,
        restaurantSlug: cart.restaurantSlug ?? '',
        restaurantName: cart.restaurantName ?? '',
        subtotalCents,
        itemsCount: cart.lines.reduce((acc, l) => acc + l.quantity, 0),
      });
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/cart/abandoned',
          new Blob([payload], { type: 'application/json' }),
        );
      } else {
        fetch('/api/cart/abandoned', {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {});
      }
    }
    function onVis() {
      if (document.visibilityState === 'hidden') fireAbandoned();
    }
    window.addEventListener('beforeunload', fireAbandoned);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('beforeunload', fireAbandoned);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.restaurantId, cart.lines.length]);

  const quote = trpc.cart.quote.useQuery(
    {
      restaurantId: cart.restaurantId ?? '',
      lines: cart.lines.map((l) => ({
        menuItemId: l.menuItemId,
        quantity: l.quantity,
        options: l.options.map((o) => ({ id: o.id, priceDeltaCents: o.priceDeltaCents })),
      })),
      promoCode: cart.promoCode ?? undefined,
      tipCents: cart.tipCents,
    },
    { enabled: !!cart.restaurantId && cart.lines.length > 0 },
  );

  const addresses = trpc.me.addresses.useQuery();
  const defaultAddress = addresses.data?.find((a) => a.isDefault) ?? addresses.data?.[0];

  if (cart.lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <span className="bg-bg-subtle text-ink-muted mx-auto grid h-20 w-20 place-items-center rounded-full">
          <ShoppingBag size={28} strokeWidth={1.8} />
        </span>
        <h1 className="font-display text-ink mt-5 text-2xl font-bold tracking-tight">
          Votre panier est vide
        </h1>
        <p className="text-ink-muted mt-2 text-[14px]">
          Trouvez votre prochain repas sur la Côte d&apos;Azur.
        </p>
        <Link
          href="/app"
          className="bg-ink text-ink-inverse mt-6 inline-flex h-12 items-center rounded-2xl px-6 text-[14px] font-semibold"
        >
          Explorer
        </Link>
      </main>
    );
  }

  const canCheckout = quote.data?.canPlaceOrder && defaultAddress;
  const total = quote.data?.totalCents ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-40 sm:px-6">
      <header className="border-border bg-bg/85 sticky top-0 z-20 -mx-4 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Link
          href={`/app/r/${cart.restaurantSlug ?? ''}`}
          aria-label="Retour au restaurant"
          className="hover:bg-bg-subtle grid h-10 w-10 place-items-center rounded-full"
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-ink truncate text-[18px] font-bold tracking-tight">
            Panier
          </h1>
          <p className="text-ink-muted truncate text-[12px]">{cart.restaurantName}</p>
        </div>
      </header>

      {/* Items */}
      <section className="border-border bg-bg-elevated shadow-xs mt-5 rounded-2xl border">
        <ul className="divide-border divide-y">
          {cart.lines.map((line) => {
            const optsSum = line.options.reduce((acc, o) => acc + o.priceDeltaCents, 0);
            const linePrice = (line.unitPriceCents + optsSum) * line.quantity;
            const photo = line.photoUrl ?? dishPhoto(line.name);
            return (
              <li key={line.lineId} className="flex gap-3 p-4">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    loading="lazy"
                    className="ring-border h-16 w-16 shrink-0 rounded-xl object-cover ring-1"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-ink truncate text-[15px] font-semibold">{line.name}</p>
                    <span className="text-ink shrink-0 text-[14px] font-semibold">
                      {(linePrice / 100).toFixed(2)} €
                    </span>
                  </div>
                  {line.options.length > 0 && (
                    <p className="text-ink-subtle mt-0.5 truncate text-[11px]">
                      {line.options.map((o) => o.name).join(' · ')}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="bg-bg-subtle flex items-center gap-1 rounded-full px-1 py-1">
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(line.lineId, line.quantity - 1)}
                        className="text-ink hover:bg-bg-elevated grid h-7 w-7 place-items-center rounded-full"
                        aria-label="Diminuer"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-[13px] font-bold tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(line.lineId, line.quantity + 1)}
                        className="text-ink hover:bg-bg-elevated grid h-7 w-7 place-items-center rounded-full"
                        aria-label="Augmenter"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.removeLine(line.lineId)}
                      className="text-danger flex items-center gap-1 text-[12px] hover:underline"
                    >
                      <Trash2 size={12} strokeWidth={2.2} />
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link
          href={`/app/r/${cart.restaurantSlug ?? ''}`}
          className="border-border text-ink-muted hover:bg-bg-subtle block border-t px-4 py-3 text-center text-[13px] font-medium"
        >
          + Ajouter d&apos;autres plats
        </Link>
      </section>

      {/* Address */}
      <section className="border-border bg-bg-elevated shadow-xs mt-4 rounded-2xl border p-4">
        <div className="flex items-start gap-3">
          <span className="bg-brand-soft text-brand grid h-9 w-9 shrink-0 place-items-center rounded-full">
            <MapPin size={16} strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-ink-subtle text-[13px] font-semibold uppercase tracking-wider">
              Adresse de livraison
            </p>
            {addresses.isLoading ? (
              <p className="text-ink-muted mt-1 text-[14px]">Chargement…</p>
            ) : defaultAddress ? (
              <p className="text-ink mt-1 text-[14px]">
                {defaultAddress.label && (
                  <span className="font-semibold">{defaultAddress.label} · </span>
                )}
                {defaultAddress.street}, {defaultAddress.postalCode} {defaultAddress.city}
              </p>
            ) : (
              <Link
                href="/app/addresses"
                className="text-brand mt-1 inline-block text-[13px] font-medium hover:underline"
              >
                + Ajouter une adresse
              </Link>
            )}
          </div>
          <Link
            href="/app/addresses"
            className="text-ink-muted hover:text-ink shrink-0 text-[12px] font-medium"
          >
            Modifier
          </Link>
        </div>
      </section>

      {/* Tip */}
      <section className="border-border bg-bg-elevated shadow-xs mt-4 rounded-2xl border p-4">
        <h2 className="text-ink-subtle text-[13px] font-semibold uppercase tracking-wider">
          Pourboire livreur
        </h2>
        <p className="text-ink-muted mt-1 text-[12px]">Reversé intégralement.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIPS.map((cents) => (
            <Chip
              key={cents}
              active={cart.tipCents === cents}
              tone="brand"
              onClick={() => cart.setTipCents(cents)}
            >
              {cents === 0 ? 'Aucun' : `${(cents / 100).toFixed(2)} €`}
            </Chip>
          ))}
        </div>
      </section>

      {/* Promo */}
      <section className="border-border bg-bg-elevated shadow-xs mt-4 rounded-2xl border p-4">
        <h2 className="text-ink-subtle flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider">
          <Tag size={12} strokeWidth={2.4} />
          Code promo
        </h2>
        <div className="mt-2">
          <input
            type="text"
            value={cart.promoCode ?? ''}
            onChange={(e) => cart.setPromoCode(e.target.value.toUpperCase() || null)}
            placeholder="FOX10"
            className="border-border bg-bg text-ink focus:border-brand focus:ring-brand/15 h-11 w-full rounded-xl border px-3 text-[14px] uppercase tracking-wider outline-none focus:ring-4"
          />
        </div>
        {quote.data?.promoError && (
          <p className="text-danger mt-2 text-[12px]">{quote.data.promoError}</p>
        )}
        {quote.data?.promoApplied && (
          <p className="text-success mt-2 text-[12px]">✓ Code appliqué</p>
        )}
      </section>

      {/* Summary */}
      <section className="border-border bg-bg-elevated shadow-xs mt-4 rounded-2xl border p-4">
        <SummaryRow label="Sous-total" cents={quote.data?.subtotalCents ?? cart.subtotalCents()} />
        <SummaryRow label="Frais de service" cents={quote.data?.serviceFeeCents ?? 0} />
        <SummaryRow label="Livraison" cents={quote.data?.deliveryFeeCents ?? 0} />
        {(quote.data?.discountCents ?? 0) > 0 && (
          <SummaryRow label="Remise" cents={-(quote.data?.discountCents ?? 0)} highlight />
        )}
        {(quote.data?.tipCents ?? 0) > 0 && (
          <SummaryRow label="Pourboire livreur" cents={quote.data?.tipCents ?? 0} />
        )}
        <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
          <span className="font-display text-ink text-[16px] font-bold">Total</span>
          <span className="font-display text-ink text-[20px] font-bold tracking-tight">
            {(total / 100).toFixed(2)} €
          </span>
        </div>
        {quote.data?.belowMinimum && (
          <p className="text-danger mt-2 text-[12px]">
            Minimum {(quote.data.deliveryMinCents / 100).toFixed(2)} € requis pour ce restaurant.
          </p>
        )}
        {(quote.data?.unavailableItems.length ?? 0) > 0 && (
          <p className="text-danger mt-2 text-[12px]">
            Indisponibles : {quote.data?.unavailableItems.join(', ')}
          </p>
        )}
      </section>

      <StickyBottomBar>
        <BottomCta
          onClick={() => router.push('/app/checkout')}
          disabled={!canCheckout}
          label={canCheckout ? 'Passer la commande' : 'Compléter les infos'}
          trailing={canCheckout ? <span>{(total / 100).toFixed(2)} €</span> : null}
        />
      </StickyBottomBar>
    </main>
  );
}

function SummaryRow({
  label,
  cents,
  highlight,
}: {
  label: string;
  cents: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-[14px]">
      <span className="text-ink-muted">{label}</span>
      <span className={highlight ? 'text-success font-semibold' : 'text-ink'}>
        {cents < 0 ? '-' : ''}
        {(Math.abs(cents) / 100).toFixed(2)} €
      </span>
    </div>
  );
}
