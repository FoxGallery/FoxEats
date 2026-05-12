'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { trpc } from '@/lib/trpc';

const TIPS = [0, 100, 200, 300];

export default function CartPage() {
  const router = useRouter();
  const cart = useCart();

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
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="font-display text-ink mt-4 text-2xl font-bold">Panier vide</h1>
        <p className="text-ink-muted mt-2 text-[14px]">
          Découvrez les restaurants de la Côte d&apos;Azur.
        </p>
        <Link
          href="/app"
          className="bg-primary mt-6 inline-flex h-12 items-center rounded-xl px-6 font-medium text-white"
        >
          Explorer les restos
        </Link>
      </main>
    );
  }

  const canCheckout = quote.data?.canPlaceOrder && defaultAddress;

  return (
    <main className="mx-auto max-w-2xl px-5 pb-32 pt-6">
      <Link
        href={`/app/r/${cart.restaurantSlug ?? ''}`}
        className="text-ink-muted text-sm hover:underline"
      >
        ← Retour au restaurant
      </Link>
      <h1 className="font-display text-ink mt-3 text-3xl font-bold tracking-tight">
        Votre commande
      </h1>
      <p className="text-ink-muted mt-1 text-[14px]">
        Chez <span className="text-ink font-medium">{cart.restaurantName}</span>
      </p>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <ul className="divide-y divide-neutral-100">
          {cart.lines.map((line) => {
            const optsSum = line.options.reduce((acc, o) => acc + o.priceDeltaCents, 0);
            const linePrice = (line.unitPriceCents + optsSum) * line.quantity;
            return (
              <li key={line.lineId} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink text-[15px] font-semibold">{line.name}</p>
                    {line.options.length > 0 && (
                      <p className="text-ink-subtle mt-0.5 text-[12px]">
                        {line.options.map((o) => o.name).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="text-ink text-[14px] font-semibold">
                    {(linePrice / 100).toFixed(2)} €
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-1">
                    <button
                      type="button"
                      onClick={() => cart.setQuantity(line.lineId, line.quantity - 1)}
                      className="grid h-7 w-7 place-items-center rounded-full hover:bg-white"
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-[13px] font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => cart.setQuantity(line.lineId, line.quantity + 1)}
                      className="grid h-7 w-7 place-items-center rounded-full hover:bg-white"
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.removeLine(line.lineId)}
                    className="text-danger text-[12px] hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-ink font-semibold">Adresse de livraison</h2>
        {addresses.isLoading ? (
          <p className="text-ink-muted mt-2 text-[13px]">Chargement…</p>
        ) : defaultAddress ? (
          <p className="text-ink-muted mt-2 text-[14px]">
            {defaultAddress.label && (
              <span className="text-ink font-medium">{defaultAddress.label} · </span>
            )}
            {defaultAddress.street}, {defaultAddress.postalCode} {defaultAddress.city}
          </p>
        ) : (
          <Link
            href="/app/addresses"
            className="text-primary mt-2 inline-block text-[13px] font-medium hover:underline"
          >
            + Ajouter une adresse
          </Link>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-ink font-semibold">Pourboire livreur</h2>
        <p className="text-ink-muted mt-1 text-[12px]">Reversé intégralement à votre livreur.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIPS.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => cart.setTipCents(cents)}
              className={`rounded-full border px-4 py-1.5 text-[13px] transition ${
                cart.tipCents === cents
                  ? 'border-accent bg-accent text-white'
                  : 'text-ink border-neutral-200 bg-white hover:bg-neutral-50'
              }`}
            >
              {cents === 0 ? 'Pas de pourboire' : `${(cents / 100).toFixed(2)} €`}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-ink font-semibold">Code promo</h2>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={cart.promoCode ?? ''}
            onChange={(e) => cart.setPromoCode(e.target.value.toUpperCase() || null)}
            placeholder="FOX10"
            className="focus:border-primary focus:ring-primary/15 h-11 flex-1 rounded-lg border border-neutral-200 px-3 text-[14px] uppercase outline-none focus:ring-4"
          />
        </div>
        {quote.data?.promoError && (
          <p className="text-danger mt-2 text-[12px]">{quote.data.promoError}</p>
        )}
        {quote.data?.promoApplied && (
          <p className="text-success mt-2 text-[12px]">Code appliqué ✓</p>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <SummaryRow label="Sous-total" cents={quote.data?.subtotalCents ?? cart.subtotalCents()} />
        <SummaryRow label="Frais de service" cents={quote.data?.serviceFeeCents ?? 0} />
        <SummaryRow label="Livraison" cents={quote.data?.deliveryFeeCents ?? 0} />
        {(quote.data?.discountCents ?? 0) > 0 && (
          <SummaryRow label="Remise" cents={-(quote.data?.discountCents ?? 0)} highlight />
        )}
        {(quote.data?.tipCents ?? 0) > 0 && (
          <SummaryRow label="Pourboire livreur" cents={quote.data?.tipCents ?? 0} />
        )}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
          <span className="font-display text-ink text-lg font-bold">Total</span>
          <span className="font-display text-ink text-xl font-bold">
            {((quote.data?.totalCents ?? 0) / 100).toFixed(2)} €
          </span>
        </div>
        {quote.data?.belowMinimum && (
          <p className="text-danger mt-2 text-[12px]">
            Minimum {(quote.data.deliveryMinCents / 100).toFixed(2)} € requis.
          </p>
        )}
        {(quote.data?.unavailableItems.length ?? 0) > 0 && (
          <p className="text-danger mt-2 text-[12px]">
            Indisponibles : {quote.data?.unavailableItems.join(', ')}
          </p>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 mt-8 border-t border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur-md sm:absolute sm:inset-x-auto sm:bottom-auto sm:mt-8 sm:rounded-2xl sm:border sm:border-neutral-100 sm:py-4 sm:shadow-sm">
        <button
          type="button"
          disabled={!canCheckout}
          onClick={() => router.push('/app/checkout')}
          className="bg-primary hover:bg-primary-600 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white shadow-md transition disabled:opacity-50"
        >
          {canCheckout
            ? `Passer la commande · ${((quote.data?.totalCents ?? 0) / 100).toFixed(2)} €`
            : 'Compléter les informations'}
        </button>
      </div>
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
      <span className={highlight ? 'text-success font-medium' : 'text-ink'}>
        {cents < 0 ? '-' : ''}
        {(Math.abs(cents) / 100).toFixed(2)} €
      </span>
    </div>
  );
}
