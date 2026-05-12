'use client';

import { use } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

type Params = Promise<{ id: string }>;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'En attente du paiement',
  placed: 'Commande passée',
  accepted_by_restaurant: 'Acceptée par le restaurant',
  rejected_by_restaurant: 'Refusée',
  preparing: 'En préparation',
  ready_for_pickup: 'Prête à être récupérée',
  courier_assigned: 'Livreur assigné',
  picked_up: 'En livraison',
  in_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export default function OrderPage({ params }: { params: Params }) {
  const { id } = use(params);
  const order = trpc.orders.get.useQuery({ id }, { refetchInterval: 5000 });

  if (order.isLoading) {
    return <p className="text-ink-muted px-5 py-10">Chargement…</p>;
  }
  if (!order.data) {
    return <p className="text-ink-muted px-5 py-10">Commande introuvable.</p>;
  }

  const o = order.data;
  const items =
    (o.items as Array<{ name: string; quantity: number; unitPriceCents: number }>) ?? [];

  return (
    <main className="mx-auto max-w-2xl px-5 py-6">
      <Link href="/app" className="text-ink-muted text-sm hover:underline">
        ← Accueil
      </Link>
      <div className="from-primary to-accent mt-3 rounded-2xl bg-gradient-to-br p-6 text-white">
        <p className="text-[11px] uppercase tracking-widest opacity-90">Commande #{o.shortCode}</p>
        <h1 className="font-display mt-1 text-3xl font-bold">
          {STATUS_LABELS[o.status] ?? o.status}
        </h1>
        <p className="mt-1 text-[14px] opacity-90">
          {o.totalCents / 100} € · {items.length} plat{items.length > 1 ? 's' : ''}
        </p>
      </div>

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
          {o.tipCents > 0 && <Row label="Pourboire" cents={o.tipCents} />}
          {o.discountCents > 0 && <Row label="Remise" cents={-o.discountCents} highlight />}
          <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 font-semibold">
            <span className="text-ink">Total</span>
            <span className="text-ink">{(o.totalCents / 100).toFixed(2)} €</span>
          </div>
        </div>
      </section>
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
