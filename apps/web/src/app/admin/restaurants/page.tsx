'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

const STATUSES = ['pending', 'active', 'paused', 'rejected', 'all'] as const;

export default function AdminRestaurants() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('pending');
  const [search, setSearch] = useState('');
  const list = trpc.admin.restaurants.list.useQuery({ status, search: search || undefined });
  const utils = trpc.useUtils();
  const approve = trpc.admin.restaurants.approve.useMutation({
    onSuccess: () => utils.admin.restaurants.list.invalidate(),
  });
  const reject = trpc.admin.restaurants.reject.useMutation({
    onSuccess: () => utils.admin.restaurants.list.invalidate(),
  });
  const pause = trpc.admin.restaurants.pause.useMutation({
    onSuccess: () => utils.admin.restaurants.list.invalidate(),
  });

  function doReject(id: string, name: string) {
    const reason = window.prompt(`Raison du refus pour "${name}" ?`);
    if (reason) reject.mutate({ id, reason });
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="font-display text-ink text-3xl font-bold tracking-tight">Restaurants</h1>
      <p className="text-ink-muted mt-1 text-[14px]">Modération et gestion du catalog.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-neutral-100 p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-4 py-1.5 text-[13px] capitalize transition ${
                status === s ? 'text-ink bg-white font-semibold shadow-sm' : 'text-ink-muted'
              }`}
            >
              {s === 'all' ? 'Tous' : s}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou slug…"
          className="h-10 min-w-[220px] flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-[14px]"
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-100">
        <table className="w-full text-[14px]">
          <thead className="text-ink-muted bg-neutral-50 text-left text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {list.data?.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <div className="text-ink font-medium">{r.name}</div>
                  <div className="text-ink-muted text-[11px]">{r.slug}</div>
                </td>
                <td className="text-ink-muted px-4 py-3">{r.city}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="text-ink px-4 py-3">
                  {r.rating ? `★ ${Number(r.rating).toFixed(1)}` : '—'}{' '}
                  <span className="text-ink-muted">({r.ratingCount})</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    {r.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => approve.mutate({ id: r.id })}
                          className="bg-success rounded-md px-3 py-1 text-[12px] font-medium text-white"
                        >
                          Approuver
                        </button>
                        <button
                          type="button"
                          onClick={() => doReject(r.id, r.name)}
                          className="border-danger text-danger rounded-md border px-3 py-1 text-[12px] font-medium"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {r.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => pause.mutate({ id: r.id, paused: true })}
                        className="bg-warn rounded-md px-3 py-1 text-[12px] font-medium text-white"
                      >
                        Mettre en pause
                      </button>
                    )}
                    {r.status === 'paused' && (
                      <button
                        type="button"
                        onClick={() => pause.mutate({ id: r.id, paused: false })}
                        className="bg-success rounded-md px-3 py-1 text-[12px] font-medium text-white"
                      >
                        Reprendre
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-ink-muted px-4 py-10 text-center text-[13px]">
                  Aucun restaurant trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-warn/15', text: 'text-warn', label: 'En attente' },
    active: { bg: 'bg-success/15', text: 'text-success', label: 'Actif' },
    paused: { bg: 'bg-neutral-200', text: 'text-ink-muted', label: 'Pause' },
    rejected: { bg: 'bg-danger/15', text: 'text-danger', label: 'Refusé' },
    draft: { bg: 'bg-neutral-100', text: 'text-ink-muted', label: 'Brouillon' },
  };
  const s = map[status] ?? { bg: 'bg-neutral-100', text: 'text-ink-muted', label: status };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
