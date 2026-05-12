'use client';

import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { usePrivateChannel } from '@/lib/pusher-client';

type OrderStatus =
  | 'placed'
  | 'accepted_by_restaurant'
  | 'preparing'
  | 'ready_for_pickup'
  | 'courier_assigned'
  | 'picked_up'
  | 'in_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected_by_restaurant'
  | 'refunded'
  | 'pending_payment';

const KDS_STATUS_GROUPS = {
  new: ['placed'] as OrderStatus[],
  preparing: ['accepted_by_restaurant', 'preparing'] as OrderStatus[],
  ready: ['ready_for_pickup', 'courier_assigned'] as OrderStatus[],
};

export default function KDSPage() {
  const restaurants = trpc.merchant.myRestaurants.useQuery();
  const active = restaurants.data?.[0];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const orders = trpc.merchantOrders.list.useQuery(
    { restaurantId: active?.id, limit: 50 },
    { enabled: !!active?.id, refetchInterval: 5000 },
  );

  const accept = trpc.merchantOrders.accept.useMutation({ onSuccess: () => orders.refetch() });
  const reject = trpc.merchantOrders.reject.useMutation({ onSuccess: () => orders.refetch() });
  const markPreparing = trpc.merchantOrders.markPreparing.useMutation({
    onSuccess: () => orders.refetch(),
  });
  const markReady = trpc.merchantOrders.markReady.useMutation({
    onSuccess: () => orders.refetch(),
  });

  // Beep sur nouvelle commande (placed)
  useEffect(() => {
    if (!orders.data) return;
    const newPlaced = orders.data.items.filter(
      (o) => o.status === 'placed' && !seenIds.current.has(o.id),
    );
    if (newPlaced.length > 0) {
      audioRef.current?.play().catch(() => {});
      newPlaced.forEach((o) => seenIds.current.add(o.id));
    }
  }, [orders.data]);

  usePrivateChannel(active?.id ? `private-merchant-${active.id}` : null, 'order:ready', () =>
    orders.refetch(),
  );

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!active) return <p className="text-ink-muted p-8">Chargement…</p>;

  const all = orders.data?.items ?? [];
  const byCol = {
    new: all.filter((o) => KDS_STATUS_GROUPS.new.includes(o.status as OrderStatus)),
    preparing: all.filter((o) => KDS_STATUS_GROUPS.preparing.includes(o.status as OrderStatus)),
    ready: all.filter((o) => KDS_STATUS_GROUPS.ready.includes(o.status as OrderStatus)),
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAAAA"
        preload="auto"
      />
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-ink text-3xl font-bold tracking-tight">KDS</h1>
          <p className="text-ink-muted mt-1 text-[13px]">{active.name}</p>
        </div>
        <span className="bg-success/10 text-success rounded-full px-3 py-1 text-[12px] font-medium">
          ● Live
        </span>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Column title="Nouvelles" tone="accent" count={byCol.new.length}>
          {byCol.new.map((o) => (
            <KdsCard key={o.id} order={o}>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => accept.mutate({ orderId: o.id })}
                  disabled={accept.isPending}
                  className="bg-success flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-white"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingId(o.id)}
                  className="border-danger text-danger rounded-lg border px-3 py-2 text-[13px] font-medium"
                >
                  Refuser
                </button>
              </div>
              {rejectingId === o.id && (
                <div className="bg-danger/[0.03] mt-2 space-y-2 rounded-lg p-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Raison (optionnel)"
                    className="border-border bg-bg-elevated h-9 w-full rounded border px-2 text-[12px]"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                      className="border-border flex-1 rounded border px-2 py-1 text-[12px]"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reject.mutate({ orderId: o.id, reason: rejectReason || undefined });
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                      className="bg-danger flex-1 rounded px-2 py-1 text-[12px] font-semibold text-white"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              )}
            </KdsCard>
          ))}
        </Column>

        <Column title="En préparation" tone="primary" count={byCol.preparing.length}>
          {byCol.preparing.map((o) => (
            <KdsCard key={o.id} order={o}>
              <div className="mt-3 flex gap-2">
                {o.status === 'accepted_by_restaurant' && (
                  <button
                    type="button"
                    onClick={() => markPreparing.mutate({ orderId: o.id })}
                    className="bg-primary flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-white"
                  >
                    Démarrer la prep
                  </button>
                )}
                {o.status === 'preparing' && (
                  <button
                    type="button"
                    onClick={() => markReady.mutate({ orderId: o.id })}
                    className="bg-accent flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-white"
                  >
                    Marquer prête
                  </button>
                )}
              </div>
            </KdsCard>
          ))}
        </Column>

        <Column title="Prêtes" tone="success" count={byCol.ready.length}>
          {byCol.ready.map((o) => (
            <KdsCard key={o.id} order={o}>
              <p className="text-ink-muted mt-2 text-[12px]">
                {o.status === 'courier_assigned' ? 'Livreur en route' : 'En attente du livreur'}
              </p>
            </KdsCard>
          ))}
        </Column>
      </div>
    </div>
  );
}

function Column({
  title,
  tone,
  count,
  children,
}: {
  title: string;
  tone: 'accent' | 'primary' | 'success';
  count: number;
  children: React.ReactNode;
}) {
  const toneMap = {
    accent: 'border-accent/30 bg-accent/5',
    primary: 'border-primary/30 bg-primary/5',
    success: 'border-success/30 bg-success/5',
  };
  const dotMap = { accent: 'bg-accent', primary: 'bg-primary', success: 'bg-success' };
  return (
    <div className={`rounded-2xl border p-3 ${toneMap[tone]}`}>
      <div className="flex items-center justify-between px-2 py-1">
        <h2 className="font-display text-ink flex items-center gap-2 text-base font-semibold">
          <span className={`h-2 w-2 rounded-full ${dotMap[tone]}`} />
          {title}
        </h2>
        <span className="text-ink-muted text-[12px]">{count}</span>
      </div>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function KdsCard({
  order,
  children,
}: {
  order: { id: string; shortCode: string; items: unknown; totalCents: number; createdAt: Date };
  children?: React.ReactNode;
}) {
  const items = (order.items as Array<{ name: string; quantity: number }>) ?? [];
  const ageMin = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60_000);
  return (
    <div className="bg-bg-elevated ring-border rounded-xl p-3 shadow-sm ring-1">
      <div className="flex items-center justify-between">
        <span className="font-display text-ink text-[14px] font-bold">#{order.shortCode}</span>
        <span
          className={`text-[11px] ${ageMin > 5 ? 'text-danger font-semibold' : 'text-ink-muted'}`}
        >
          il y a {ageMin}&nbsp;min
        </span>
      </div>
      <ul className="text-ink mt-2 space-y-0.5 text-[13px]">
        {items.map((it, i) => (
          <li key={i}>
            <span className="font-medium">{it.quantity}×</span> {it.name}
          </li>
        ))}
      </ul>
      <p className="text-ink mt-2 text-[12px] font-semibold">
        {(order.totalCents / 100).toFixed(2)} €
      </p>
      {children}
    </div>
  );
}
