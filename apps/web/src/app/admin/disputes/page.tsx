'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function AdminDisputes() {
  const [search, setSearch] = useState('');
  const list = trpc.admin.disputes.list.useQuery({ search: search || undefined });
  const refund = trpc.admin.disputes.refund.useMutation({
    onSuccess: () => list.refetch(),
  });

  function doRefund(id: string, shortCode: string, totalCents: number) {
    const amountStr = window.prompt(
      `Rembourser la commande #${shortCode} (${(totalCents / 100).toFixed(2)} €).\nLaisser vide pour remboursement total. Sinon montant en €.`,
    );
    if (amountStr === null) return;
    const reason = window.prompt('Raison du remboursement (admin) ?') ?? undefined;
    const amountCents = amountStr ? Math.round(parseFloat(amountStr) * 100) : undefined;
    refund.mutate({ orderId: id, amountCents, reason });
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="font-display text-ink text-3xl font-bold tracking-tight">Litiges</h1>
      <p className="text-ink-muted mt-1 text-[14px]">
        Recherche par numéro de commande. Remboursement direct Stripe.
      </p>

      <div className="mt-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
          placeholder="Numéro de commande (ex. AB2C3D)"
          className="border-border bg-bg-elevated h-12 w-full rounded-xl border px-4 text-[15px] uppercase"
        />
      </div>

      <section className="border-border bg-bg-elevated mt-6 overflow-hidden rounded-2xl border">
        <table className="w-full text-[14px]">
          <thead className="text-ink-muted bg-bg-subtle text-left text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {list.data?.map((o) => (
              <tr key={o.id}>
                <td className="text-ink px-4 py-3 font-mono">#{o.shortCode}</td>
                <td className="text-ink-muted px-4 py-3">{o.status}</td>
                <td className="text-ink px-4 py-3 font-semibold">
                  {(o.totalCents / 100).toFixed(2)} €
                </td>
                <td className="text-ink-muted px-4 py-3">
                  {new Date(o.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => doRefund(o.id, o.shortCode, o.totalCents)}
                    disabled={refund.isPending || o.status === 'refunded'}
                    className="bg-danger rounded-md px-3 py-1 text-[12px] font-medium text-white disabled:opacity-50"
                  >
                    {o.status === 'refunded' ? 'Remboursée' : 'Rembourser'}
                  </button>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-ink-muted px-4 py-10 text-center text-[13px]">
                  Aucune commande trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {refund.isError && <p className="text-danger mt-3 text-[13px]">{refund.error.message}</p>}
    </div>
  );
}
