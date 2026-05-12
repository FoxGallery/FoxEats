'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'En attente du paiement',
  placed: 'Commande passée',
  accepted_by_restaurant: 'Acceptée',
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

const ACTIVE = new Set([
  'pending_payment',
  'placed',
  'accepted_by_restaurant',
  'preparing',
  'ready_for_pickup',
  'courier_assigned',
  'picked_up',
  'in_delivery',
]);

export default function OrdersHistoryPage() {
  const list = trpc.orders.myOrders.useQuery({ limit: 30 });
  const all = list.data?.items ?? [];
  const active = all.filter((o) => ACTIVE.has(o.status));
  const past = all.filter((o) => !ACTIVE.has(o.status));

  return (
    <main className="mx-auto max-w-2xl px-5 py-6">
      <Link href="/app" className="text-ink-muted text-sm hover:underline">
        ← Accueil
      </Link>
      <h1 className="font-display text-ink mt-3 text-3xl font-bold tracking-tight">
        Mes commandes
      </h1>

      {list.isLoading && <p className="text-ink-muted mt-6 text-[14px]">Chargement…</p>}
      {!list.isLoading && all.length === 0 && (
        <p className="text-ink-muted mt-10 rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-[14px]">
          Pas encore de commande.
        </p>
      )}

      {active.length > 0 && (
        <section className="mt-6">
          <h2 className="text-ink-muted text-[12px] font-semibold uppercase tracking-wider">
            En cours
          </h2>
          <div className="mt-3 space-y-3">
            {active.map((o) => (
              <OrderCard key={o.id} order={o} active />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="text-ink-muted text-[12px] font-semibold uppercase tracking-wider">
            Historique
          </h2>
          <div className="mt-3 space-y-3">
            {past.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function OrderCard({
  order,
  active,
}: {
  order: {
    id: string;
    shortCode: string;
    status: string;
    totalCents: number;
    createdAt: Date;
    items: unknown;
  };
  active?: boolean;
}) {
  const items = (order.items as Array<{ name: string; quantity: number }>) ?? [];
  const summary = items
    .slice(0, 3)
    .map((it) => `${it.quantity}× ${it.name}`)
    .join(' · ');
  return (
    <Link
      href={`/app/orders/${order.id}`}
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-ink-subtle text-[12px] uppercase tracking-wider">
              #{order.shortCode}
            </p>
            {active && (
              <span className="bg-accent/10 text-accent rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                En cours
              </span>
            )}
          </div>
          <p className="text-ink mt-1 truncate text-[14px] font-medium">{summary || '—'}</p>
          <p className="text-ink-muted mt-0.5 text-[12px]">
            {STATUS_LABELS[order.status] ?? order.status} ·{' '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <span className="font-display text-ink shrink-0 text-[15px] font-semibold">
          {(order.totalCents / 100).toFixed(2)} €
        </span>
      </div>
    </Link>
  );
}
