'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Receipt, Check, ChefHat, Package, Truck, PartyPopper } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { usePrivateChannel } from '@/lib/pusher-client';

const DeliveryMap = dynamic(() => import('@/components/delivery-map').then((m) => m.DeliveryMap), {
  ssr: false,
  loading: () => <div className="bg-bg-subtle h-64 animate-pulse rounded-2xl" />,
});

type Params = Promise<{ id: string }>;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'En attente du paiement',
  placed: 'Commande passée',
  accepted_by_restaurant: 'Acceptée par le restaurant',
  rejected_by_restaurant: 'Refusée',
  preparing: 'En préparation',
  ready_for_pickup: 'Prête',
  courier_assigned: 'Livreur en route',
  picked_up: 'En livraison',
  in_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const TIMELINE_STEPS: Array<{ status: string; label: string; icon: LucideIcon }> = [
  { status: 'placed', label: 'Commande reçue', icon: Receipt },
  { status: 'accepted_by_restaurant', label: 'Acceptée', icon: Check },
  { status: 'preparing', label: 'En préparation', icon: ChefHat },
  { status: 'ready_for_pickup', label: 'Prête', icon: Package },
  { status: 'in_delivery', label: 'En livraison', icon: Truck },
  { status: 'delivered', label: 'Livrée', icon: PartyPopper },
];

const RANK: Record<string, number> = {
  pending_payment: -1,
  placed: 0,
  accepted_by_restaurant: 1,
  rejected_by_restaurant: 1,
  preparing: 2,
  ready_for_pickup: 3,
  courier_assigned: 4,
  picked_up: 4,
  in_delivery: 4,
  delivered: 5,
  cancelled: 99,
  refunded: 99,
};

export default function OrderPage({ params }: { params: Params }) {
  const { id } = use(params);
  const order = trpc.orders.get.useQuery({ id }, { refetchInterval: 10_000 });
  const cancel = trpc.orders.cancel.useMutation({ onSuccess: () => order.refetch() });
  const utils = trpc.useUtils();

  const eta = trpc.couriers.eta.useQuery({ orderId: id }, { refetchInterval: 30_000 });
  const courierLocation = trpc.couriers.lastLocationForOrder.useQuery(
    { orderId: id },
    { refetchInterval: 15_000 },
  );

  // Realtime Pusher si configuré, sinon fallback polling 10s (déjà actif).
  usePrivateChannel(order.data ? `private-order-${id}` : null, 'status', () => {
    utils.orders.get.invalidate({ id });
    eta.refetch();
  });
  usePrivateChannel(order.data ? `private-order-${id}` : null, 'courier:location', () => {
    courierLocation.refetch();
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (order.isLoading) {
    return <p className="text-ink-muted px-5 py-10">Chargement…</p>;
  }
  if (!order.data) {
    return <p className="text-ink-muted px-5 py-10">Commande introuvable.</p>;
  }

  const o = order.data;
  const items =
    (o.items as Array<{ name: string; quantity: number; unitPriceCents: number }>) ?? [];
  const currentRank = RANK[o.status] ?? 0;
  const isTerminal = ['delivered', 'cancelled', 'refunded', 'rejected_by_restaurant'].includes(
    o.status,
  );
  const isCancellable =
    ['pending_payment', 'placed', 'accepted_by_restaurant'].includes(o.status) && !o.acceptedAt;

  return (
    <main className="mx-auto max-w-2xl px-5 py-6 pb-24">
      <Link
        href="/app/orders"
        className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline"
      >
        ← Mes commandes
      </Link>

      <div className="from-brand to-accent shadow-food relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br via-[#E84838] p-7 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/85">
            Commande #{o.shortCode}
          </p>
          <h1 className="font-display mt-1 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
            {STATUS_LABELS[o.status] ?? o.status}
          </h1>
          <p className="mt-2 text-[14px] font-medium text-white/90">
            {(o.totalCents / 100).toFixed(2)} € · {items.length} plat{items.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Timeline */}
      {!['cancelled', 'refunded', 'rejected_by_restaurant'].includes(o.status) && (
        <section className="border-border bg-bg-elevated shadow-xs mt-4 rounded-2xl border p-5">
          <h2 className="text-ink font-semibold">Suivi</h2>
          <ol className="mt-4 space-y-3">
            {TIMELINE_STEPS.map((step, idx) => {
              const stepRank = idx;
              const reached = currentRank >= stepRank;
              const active = currentRank === stepRank && !isTerminal;
              const Icon = step.icon;
              return (
                <li key={step.status} className="flex items-center gap-3">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full transition ${
                      active
                        ? 'bg-brand animate-pulse text-white'
                        : reached
                          ? 'bg-ink text-ink-inverse'
                          : 'bg-bg-subtle text-ink-subtle'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.4} />
                  </span>
                  <span
                    className={`text-[14px] ${
                      active ? 'text-ink font-semibold' : reached ? 'text-ink' : 'text-ink-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {eta.data?.restaurant && eta.data.customer && (
        <section className="border-border bg-bg-elevated shadow-xs mt-4 rounded-2xl border p-3">
          <DeliveryMap
            restaurant={eta.data.restaurant}
            customer={eta.data.customer}
            courier={courierLocation.data ?? eta.data.courier ?? undefined}
            routePolyline={
              eta.data.legs.courierToRestaurant?.geometry ??
              eta.data.legs.restaurantToCustomer.geometry ??
              null
            }
            heightClass="h-72"
          />
          {eta.data.totalSeconds > 0 &&
            !['delivered', 'cancelled', 'refunded'].includes(o.status) && (
              <p className="text-ink-muted mt-3 px-2 text-center text-[14px]">
                Arrivée estimée vers{' '}
                <span className="text-ink font-semibold">
                  {new Date(eta.data.arrivalIso).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>{' '}
                · {Math.round(eta.data.totalSeconds / 60)} min
              </p>
            )}
        </section>
      )}

      <section className="border-border bg-bg-elevated shadow-xs mt-4 rounded-2xl border p-5">
        <h2 className="text-ink font-semibold">Récapitulatif</h2>
        <ul className="divide-border mt-3 divide-y">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between py-2 text-[14px]">
              <span className="text-ink">
                {it.quantity}× {it.name}
              </span>
              <span className="text-ink font-medium">
                {((it.unitPriceCents * it.quantity) / 100).toFixed(2)} €
              </span>
            </li>
          ))}
        </ul>
        <div className="border-border mt-3 space-y-1 border-t pt-3 text-[14px]">
          <Row label="Sous-total" cents={o.subtotalCents} />
          <Row label="Frais de service" cents={o.serviceFeeCents} />
          <Row label="Livraison" cents={o.deliveryFeeCents} />
          {o.tipCents > 0 && <Row label="Pourboire livreur" cents={o.tipCents} />}
          {o.discountCents > 0 && <Row label="Remise" cents={-o.discountCents} highlight />}
          <div className="border-border mt-2 flex justify-between border-t pt-2 font-semibold">
            <span className="text-ink">Total</span>
            <span className="text-ink">{(o.totalCents / 100).toFixed(2)} €</span>
          </div>
        </div>
        {o.status === 'delivered' && (
          <a
            href={`/api/orders/${o.id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink border-border hover:bg-bg-subtle mt-4 inline-flex h-10 items-center justify-center rounded-lg border px-4 text-[13px] font-medium transition"
          >
            Télécharger le reçu (HTML)
          </a>
        )}
      </section>

      {isCancellable && (
        <section className="border-danger/30 bg-danger/[0.03] mt-4 rounded-2xl border p-5">
          <h2 className="text-danger font-semibold">Annuler la commande</h2>
          <p className="text-ink-muted mt-1 text-[13px]">
            Annulation possible avant l&apos;acceptation par le restaurant. Remboursement
            automatique.
          </p>
          {!showCancelConfirm ? (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="border-danger text-danger hover:bg-danger mt-3 h-10 rounded-lg border px-4 text-[13px] font-medium hover:text-white"
            >
              Annuler ma commande
            </button>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="border-border h-10 rounded-lg border px-4 text-[13px]"
              >
                Garder
              </button>
              <button
                type="button"
                onClick={() => cancel.mutate({ id: o.id, reason: 'cancelled_by_customer' })}
                disabled={cancel.isPending}
                className="bg-danger h-10 rounded-lg px-4 text-[13px] font-medium text-white disabled:opacity-50"
              >
                {cancel.isPending ? 'Annulation…' : 'Confirmer'}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function Row({ label, cents, highlight }: { label: string; cents: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className={highlight ? 'text-success' : 'text-ink'}>
        {cents < 0 ? '-' : ''}
        {(Math.abs(cents) / 100).toFixed(2)} €
      </span>
    </div>
  );
}
