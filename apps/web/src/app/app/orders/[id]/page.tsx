'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { usePrivateChannel } from '@/lib/pusher-client';

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

const TIMELINE_STEPS: Array<{ status: string; label: string; icon: string }> = [
  { status: 'placed', label: 'Commande reçue', icon: '🧾' },
  { status: 'accepted_by_restaurant', label: 'Acceptée', icon: '✅' },
  { status: 'preparing', label: 'En préparation', icon: '👨‍🍳' },
  { status: 'ready_for_pickup', label: 'Prête', icon: '📦' },
  { status: 'in_delivery', label: 'En livraison', icon: '🛵' },
  { status: 'delivered', label: 'Livrée', icon: '🎉' },
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

  // Realtime Pusher si configuré, sinon fallback polling 10s (déjà actif).
  usePrivateChannel(order.data ? `private-order-${id}` : null, 'status', () => {
    utils.orders.get.invalidate({ id });
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
      <Link href="/app/orders" className="text-ink-muted text-sm hover:underline">
        ← Mes commandes
      </Link>

      <div className="from-primary to-accent mt-3 rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl">
        <p className="text-[11px] uppercase tracking-widest opacity-90">Commande #{o.shortCode}</p>
        <h1 className="font-display mt-1 text-3xl font-bold leading-tight">
          {STATUS_LABELS[o.status] ?? o.status}
        </h1>
        <p className="mt-1 text-[14px] opacity-90">
          {(o.totalCents / 100).toFixed(2)} € · {items.length} plat{items.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Timeline */}
      {!['cancelled', 'refunded', 'rejected_by_restaurant'].includes(o.status) && (
        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <h2 className="text-ink font-semibold">Suivi</h2>
          <ol className="mt-4 space-y-3">
            {TIMELINE_STEPS.map((step, idx) => {
              const stepRank = idx;
              const reached = currentRank >= stepRank;
              const active = currentRank === stepRank && !isTerminal;
              return (
                <li key={step.status} className="flex items-center gap-3">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-[16px] transition ${
                      active
                        ? 'bg-accent animate-pulse text-white'
                        : reached
                          ? 'bg-primary text-white'
                          : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {step.icon}
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

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
        <h2 className="text-ink font-semibold">Récapitulatif</h2>
        <ul className="mt-3 divide-y divide-neutral-100">
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
        <div className="mt-3 space-y-1 border-t border-neutral-100 pt-3 text-[14px]">
          <Row label="Sous-total" cents={o.subtotalCents} />
          <Row label="Frais de service" cents={o.serviceFeeCents} />
          <Row label="Livraison" cents={o.deliveryFeeCents} />
          {o.tipCents > 0 && <Row label="Pourboire livreur" cents={o.tipCents} />}
          {o.discountCents > 0 && <Row label="Remise" cents={-o.discountCents} highlight />}
          <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 font-semibold">
            <span className="text-ink">Total</span>
            <span className="text-ink">{(o.totalCents / 100).toFixed(2)} €</span>
          </div>
        </div>
        {o.status === 'delivered' && (
          <a
            href={`/api/orders/${o.id}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 px-4 text-[13px] font-medium transition hover:bg-neutral-50"
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
                className="h-10 rounded-lg border border-neutral-200 px-4 text-[13px]"
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
