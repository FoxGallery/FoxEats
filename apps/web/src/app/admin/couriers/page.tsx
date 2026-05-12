'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function AdminCouriers() {
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const list = trpc.admin.couriers.list.useQuery({ kycStatus });
  const utils = trpc.useUtils();
  const approve = trpc.admin.couriers.approveKyc.useMutation({
    onSuccess: () => utils.admin.couriers.list.invalidate(),
  });
  const reject = trpc.admin.couriers.rejectKyc.useMutation({
    onSuccess: () => utils.admin.couriers.list.invalidate(),
  });

  function doReject(id: string, name: string | null) {
    const reason = window.prompt(`Raison du refus pour "${name ?? 'livreur'}" ?`);
    reject.mutate({ id, reason: reason ?? undefined });
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="font-display text-ink text-3xl font-bold tracking-tight">Livreurs</h1>
      <p className="text-ink-muted mt-1 text-[14px]">Modération KYC et documents.</p>

      <div className="bg-bg-subtle mt-6 flex gap-1 rounded-full p-1">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setKycStatus(s)}
            className={`rounded-full px-4 py-1.5 text-[13px] capitalize transition ${
              kycStatus === s ? 'text-ink bg-bg-elevated font-semibold shadow-sm' : 'text-ink-muted'
            }`}
          >
            {s === 'all'
              ? 'Tous'
              : s === 'pending'
                ? 'À valider'
                : s === 'approved'
                  ? 'Validés'
                  : 'Refusés'}
          </button>
        ))}
      </div>

      <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {list.data?.map((c) => (
          <article
            key={c.id}
            className="border-border bg-bg-elevated shadow-xs rounded-2xl border p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-ink text-[16px] font-semibold">
                  {c.userName ?? 'Livreur'}
                </p>
                <p className="text-ink-muted text-[12px]">{c.userEmail}</p>
              </div>
              <KycBadge status={c.kycStatus} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <dt className="text-ink-muted">Véhicule</dt>
                <dd className="text-ink">{c.vehicle}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">SIRET</dt>
                <dd className="text-ink">{c.siret ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">IBAN</dt>
                <dd className="text-ink font-mono text-[11px]">{c.ibanMasked ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Livraisons</dt>
                <dd className="text-ink">{c.completedDeliveries}</dd>
              </div>
            </dl>
            {c.kycStatus === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => approve.mutate({ id: c.id })}
                  className="bg-success flex-1 rounded-lg px-3 py-2 text-[12px] font-medium text-white"
                >
                  Approuver KYC
                </button>
                <button
                  type="button"
                  onClick={() => doReject(c.id, c.userName)}
                  className="border-danger text-danger flex-1 rounded-lg border px-3 py-2 text-[12px] font-medium"
                >
                  Refuser
                </button>
              </div>
            )}
          </article>
        ))}
        {list.data?.length === 0 && (
          <p className="text-ink-muted border-border col-span-full rounded-xl border border-dashed px-4 py-10 text-center text-[14px]">
            Aucun livreur dans cette catégorie.
          </p>
        )}
      </section>
    </div>
  );
}

function KycBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-warn/15 text-warn',
    approved: 'bg-success/15 text-success',
    rejected: 'bg-danger/15 text-danger',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[status] ?? 'text-ink-muted bg-bg-subtle'}`}
    >
      KYC {status === 'pending' ? 'en attente' : status === 'approved' ? 'validé' : 'refusé'}
    </span>
  );
}
