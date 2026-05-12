'use client';

import dynamic from 'next/dynamic';
import { trpc } from '@/lib/trpc';

const LiveMap = dynamic(() => import('@/components/admin-live-map').then((m) => m.AdminLiveMap), {
  ssr: false,
  loading: () => <div className="h-[500px] animate-pulse rounded-2xl bg-neutral-100" />,
});

export default function AdminLive() {
  const orders = trpc.admin.liveOps.activeOrders.useQuery(undefined, { refetchInterval: 8_000 });
  const couriers = trpc.admin.liveOps.onlineCouriers.useQuery(undefined, {
    refetchInterval: 5_000,
  });

  return (
    <div className="px-6 py-8 lg:px-10">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl font-bold tracking-tight">
            Monitoring live
          </h1>
          <p className="text-ink-muted mt-1 text-[14px]">
            {orders.data?.length ?? 0} commande{(orders.data?.length ?? 0) > 1 ? 's' : ''} active
            {(orders.data?.length ?? 0) > 1 ? 's' : ''} · {couriers.data?.length ?? 0} livreur
            {(couriers.data?.length ?? 0) > 1 ? 's en ligne' : ' en ligne'}
          </p>
        </div>
        <span className="bg-success/10 text-success rounded-full px-3 py-1 text-[12px] font-medium">
          ● Live (refresh 5–8s)
        </span>
      </header>

      <section className="mt-6">
        <LiveMap orders={orders.data ?? []} couriers={couriers.data ?? []} />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <h2 className="font-display text-ink text-lg font-semibold">Commandes actives</h2>
          <ul className="mt-3 divide-y divide-neutral-100">
            {orders.data?.slice(0, 10).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 text-[13px]">
                <span className="text-ink font-mono">#{o.shortCode}</span>
                <span className="text-ink-muted truncate">{o.restaurantName}</span>
                <span className="text-ink-subtle text-[11px]">{o.status}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
          <h2 className="font-display text-ink text-lg font-semibold">Livreurs en ligne</h2>
          <ul className="mt-3 divide-y divide-neutral-100">
            {couriers.data?.slice(0, 10).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-[13px]">
                <span className="text-ink">{c.vehicle}</span>
                <span className="text-ink-subtle text-[11px]">
                  {c.lastSeenAt
                    ? `vu il y a ${Math.round((Date.now() - new Date(c.lastSeenAt).getTime()) / 1000)}s`
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
