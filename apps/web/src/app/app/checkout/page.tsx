'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '@/lib/cart';
import { trpc } from '@/lib/trpc';

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
      <main className="mx-auto max-w-md px-5 py-12 text-center">
        <p className="text-5xl">⚠️</p>
        <h1 className="font-display text-ink mt-3 text-2xl font-bold">Paiement indisponible</h1>
        <p className="text-ink-muted mt-2 text-[14px]">
          La clé Stripe publique n&apos;est pas configurée. L&apos;équipe est notifiée.
        </p>
        <Link
          href="/app/cart"
          className="text-primary mt-6 inline-block text-[14px] hover:underline"
        >
          ← Retour au panier
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-6">
      <Link href="/app/cart" className="text-ink-muted text-sm hover:underline">
        ← Modifier le panier
      </Link>
      <h1 className="font-display text-ink mt-3 text-3xl font-bold tracking-tight">Paiement</h1>

      {error && (
        <div
          role="alert"
          className="border-danger/30 bg-danger/10 text-danger mt-4 rounded-lg border px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {!clientSecret ? (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
          <p className="text-ink-muted text-[14px]">
            Confirmez votre commande pour générer le paiement sécurisé Stripe.
          </p>
          <button
            type="button"
            onClick={startPayment}
            disabled={place.isPending || !defaultAddress}
            className="bg-primary hover:bg-primary-600 mt-4 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white shadow-md transition disabled:opacity-50"
          >
            {place.isPending ? 'Préparation…' : 'Continuer vers le paiement'}
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0B3D91',
                  colorBackground: '#ffffff',
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
    window.location.href = `/app/orders/${orderId}`;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      {err && (
        <p role="alert" className="text-danger text-sm">
          {err}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="bg-primary hover:bg-primary-600 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white shadow-md transition disabled:opacity-50"
      >
        {submitting ? 'Paiement en cours…' : 'Payer'}
      </button>
    </form>
  );
}
