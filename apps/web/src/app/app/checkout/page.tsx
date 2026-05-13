'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/lib/cart';
import { trpc } from '@/lib/trpc';
import { BottomCta, StickyBottomBar } from '@/components/ui/bottom-cta';

const stripePromise = (() => {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return pk ? loadStripe(pk) : null;
})();

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const addresses = trpc.me.addresses.useQuery();
  const place = trpc.orders.place.useMutation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultAddress = addresses.data?.find((a) => a.isDefault) ?? addresses.data?.[0];

  useEffect(() => {
    if (!cart.restaurantId || cart.lines.length === 0) {
      router.replace('/app');
    }
  }, [cart.restaurantId, cart.lines.length, router]);

  async function startPayment() {
    if (!cart.restaurantId || !defaultAddress) return;
    setError(null);
    try {
      const result = await place.mutateAsync({
        restaurantId: cart.restaurantId,
        lines: cart.lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          options: l.options,
          notes: l.notes,
        })),
        deliveryAddress: {
          street: defaultAddress.street,
          city: defaultAddress.city,
          postalCode: defaultAddress.postalCode,
          country: defaultAddress.country,
          lat: Number(defaultAddress.lat),
          lng: Number(defaultAddress.lng),
          instructions: defaultAddress.instructions ?? undefined,
        },
        tipCents: cart.tipCents,
        customerNotes: cart.customerNotes || undefined,
        paymentMethod: 'card',
      });

      if (result.devNoStripe) {
        cart.reset();
        fetch('/api/cart/abandoned', { method: 'DELETE' }).catch(() => {});
        router.replace(`/app/orders/${result.orderId}?dev=1`);
        return;
      }
      if (!result.clientSecret) {
        setError("Impossible d'initier le paiement.");
        return;
      }
      setOrderId(result.orderId);
      setClientSecret(result.clientSecret);
    } catch (e) {
      setError((e as Error).message ?? 'Erreur lors de la création de la commande.');
    }
  }

  if (!stripePromise) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <span className="bg-warning/15 text-warning mx-auto grid h-16 w-16 place-items-center rounded-full">
          <Lock size={24} strokeWidth={2} />
        </span>
        <h1 className="font-display text-ink mt-4 text-2xl font-bold tracking-tight">
          Paiement indisponible
        </h1>
        <p className="text-ink-muted mt-2 text-[14px]">
          La clé Stripe publique n&apos;est pas configurée.
        </p>
        <Link
          href="/app/cart"
          className="text-brand mt-6 inline-block text-[14px] font-medium hover:underline"
        >
          ← Retour au panier
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-40 sm:px-6">
      <header className="border-border bg-bg/85 sticky top-0 z-20 -mx-4 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Link
          href="/app/cart"
          aria-label="Modifier le panier"
          className="hover:bg-bg-subtle grid h-10 w-10 place-items-center rounded-full"
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </Link>
        <h1 className="font-display text-ink flex-1 text-[18px] font-bold tracking-tight">
          Paiement
        </h1>
      </header>

      <section className="border-border bg-bg-elevated shadow-xs mt-5 flex items-center gap-3 rounded-2xl border p-4">
        <span className="bg-success/15 text-success grid h-10 w-10 shrink-0 place-items-center rounded-full">
          <ShieldCheck size={18} strokeWidth={2.2} />
        </span>
        <p className="text-ink-muted text-[13px] leading-snug">
          Paiement sécurisé via Stripe. Vos données bancaires ne transitent jamais par nos serveurs.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-xl border px-4 py-3 text-[13px]"
        >
          {error}
        </div>
      )}

      {!clientSecret ? (
        <div className="border-border bg-bg-elevated shadow-xs mt-5 rounded-2xl border p-5">
          <h2 className="font-display text-ink text-[18px] font-bold tracking-tight">
            Confirmer la commande
          </h2>
          <p className="text-ink-muted mt-1 text-[13px]">
            Vérifiez les informations avant de générer le paiement.
          </p>
          {defaultAddress && (
            <div className="bg-bg-subtle text-ink-muted mt-4 rounded-xl p-3 text-[13px]">
              <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-wider">
                Livraison
              </p>
              <p className="text-ink mt-1">
                {defaultAddress.street}, {defaultAddress.postalCode} {defaultAddress.city}
              </p>
            </div>
          )}
          <StickyBottomBar>
            <BottomCta
              onClick={startPayment}
              disabled={place.isPending || !defaultAddress}
              label={place.isPending ? 'Préparation…' : 'Continuer vers le paiement'}
            />
          </StickyBottomBar>
        </div>
      ) : (
        <div className="border-border bg-bg-elevated shadow-xs mt-5 rounded-2xl border p-5">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#FF5A4A',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  borderRadius: '12px',
                },
              },
            }}
          >
            <CheckoutForm orderId={orderId!} />
          </Elements>
        </div>
      )}
    </main>
  );
}

function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErr(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app/orders/${orderId}`,
      },
      redirect: 'if_required',
    });
    if (error) {
      setErr(error.message ?? 'Paiement refusé.');
      setSubmitting(false);
      return;
    }
    cart.reset();
    fetch('/api/cart/abandoned', { method: 'DELETE' }).catch(() => {});
    window.location.href = `/app/orders/${orderId}`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      {err && (
        <p role="alert" className="text-danger text-[13px]">
          {err}
        </p>
      )}
      <StickyBottomBar>
        <BottomCta
          onClick={() => {
            const f = document.querySelector('form');
            f?.requestSubmit();
          }}
          disabled={!stripe || submitting}
          label={submitting ? 'Paiement en cours…' : 'Payer'}
          trailing={<Lock size={14} strokeWidth={2.4} />}
        />
      </StickyBottomBar>
      <button type="submit" className="sr-only" aria-hidden>
        Payer
      </button>
    </form>
  );
}
