'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Receipt } from 'lucide-react';
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
    <main className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
      <header className="border-border bg-bg/85 sticky top-0 z-20 -mx-4 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Link
          href="/app"
          aria-label="Accueil"
          className="hover:bg-bg-subtle grid h-10 w-10 place-items-center rounded-full"
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </Link>
        <h1 className="font-display text-ink flex-1 text-[18px] font-bold tracking-tight">
          Mes commandes
        </h1>
      </header>

      {list.isLoading && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {!list.isLoading && all.length === 0 && (
        <div className="border-border bg-bg-elevated mt-10 rounded-3xl border border-dashed px-4 py-12 text-center">
          <span className="bg-bg-subtle text-ink-muted mx-auto grid h-14 w-14 place-items-center rounded-2xl">
            <Receipt size={22} strokeWidth={2} />
          </span>
          <p className="font-display text-ink mt-4 text-[16px] font-bold">Pas encore de commande</p>
          <p className="text-ink-muted mt-1 text-[13px]">
            Vos prochaines commandes apparaîtront ici.
          </p>
          <Link
            href="/app"
            className="bg-ink text-ink-inverse mt-5 inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-[13px] font-semibold hover:opacity-90"
          >
            Explorer les restos
            <ArrowRight size={13} strokeWidth={2.6} />
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <section className="mt-6">
          <h2 className="text-ink-subtle text-[11px] font-semibold uppercase tracking-widest">
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
          <h2 className="text-ink-subtle text-[11px] font-semibold uppercase tracking-widest">
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
      className="border-border bg-bg-elevated shadow-xs hover:border-brand/30 hover:shadow-food block rounded-2xl border p-4 transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-ink-subtle text-[11px] font-bold uppercase tracking-widest">
              #{order.shortCode}
            </p>
            {active && (
              <span className="bg-brand-soft text-brand inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="bg-brand inline-flex h-1.5 w-1.5 animate-pulse rounded-full" />
                En cours
              </span>
            )}
          </div>
          <p className="text-ink mt-1 truncate text-[14px] font-semibold">{summary || '—'}</p>
          <p className="text-ink-muted mt-0.5 text-[12px]">
            {STATUS_LABELS[order.status] ?? order.status} ·{' '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <span className="font-display text-ink shrink-0 text-[16px] font-extrabold tracking-tight">
          {(order.totalCents / 100).toFixed(2)} €
        </span>
      </div>
    </Link>
  );
}
