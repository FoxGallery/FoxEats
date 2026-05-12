'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function AdminPromos() {
  const list = trpc.admin.promos.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.admin.promos.create.useMutation({
    onSuccess: () => utils.admin.promos.list.invalidate(),
  });
  const toggle = trpc.admin.promos.toggleActive.useMutation({
    onSuccess: () => utils.admin.promos.list.invalidate(),
  });

  const [form, setForm] = useState({
    code: '',
    type: 'percent_off' as
      | 'percent_off'
      | 'amount_off'
      | 'free_delivery'
      | 'first_order'
      | 'referral'
      | 'foxpass_perk',
    valuePercent: 15,
    valueCents: 500,
    minOrderCents: 1500,
    maxUsages: 1000,
    cityScope: '',
  });

  function submit() {
    if (!form.code.trim()) return;
    create.mutate({
      code: form.code.toUpperCase().trim(),
      type: form.type,
      valuePercent: form.type === 'percent_off' ? form.valuePercent : undefined,
      valueCents:
        form.type === 'amount_off' || form.type === 'first_order' || form.type === 'referral'
          ? form.valueCents
          : undefined,
      minOrderCents: form.minOrderCents,
      maxUsages: form.maxUsages,
      perUserLimit: 1,
      cityScope: form.cityScope || undefined,
    });
    setForm({ ...form, code: '' });
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="font-display text-ink text-3xl font-bold tracking-tight">
        Codes promo plateforme
      </h1>
      <p className="text-ink-muted mt-1 text-[14px]">
        Codes globaux applicables sur tous les restos partenaires (ou ciblés par ville).
      </p>

      <section className="border-border bg-bg-elevated shadow-xs mt-6 rounded-2xl border p-5">
        <h2 className="font-display text-ink text-lg font-semibold">Nouveau code</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Code">
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME10"
              className="border-border h-11 w-full rounded-lg border px-3 text-[14px] uppercase"
            />
          </Field>
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
              className="border-border bg-bg-elevated h-11 w-full rounded-lg border px-3 text-[14px]"
            >
              <option value="percent_off">% de remise</option>
              <option value="amount_off">Montant fixe</option>
              <option value="free_delivery">Livraison offerte</option>
              <option value="first_order">Première commande</option>
              <option value="referral">Parrainage</option>
              <option value="foxpass_perk">FoxPass</option>
            </select>
          </Field>
          {form.type === 'percent_off' && (
            <Field label="Pourcentage">
              <input
                type="number"
                value={form.valuePercent}
                onChange={(e) => setForm({ ...form, valuePercent: Number(e.target.value) })}
                min="1"
                max="100"
                className="border-border h-11 w-full rounded-lg border px-3 text-[14px]"
              />
            </Field>
          )}
          {(form.type === 'amount_off' ||
            form.type === 'first_order' ||
            form.type === 'referral') && (
            <Field label="Montant (€)">
              <input
                type="number"
                value={form.valueCents / 100}
                onChange={(e) =>
                  setForm({ ...form, valueCents: Math.round(parseFloat(e.target.value) * 100) })
                }
                min="0"
                step="0.5"
                className="border-border h-11 w-full rounded-lg border px-3 text-[14px]"
              />
            </Field>
          )}
          <Field label="Min commande (€)">
            <input
              type="number"
              value={form.minOrderCents / 100}
              onChange={(e) =>
                setForm({ ...form, minOrderCents: Math.round(parseFloat(e.target.value) * 100) })
              }
              min="0"
              className="border-border h-11 w-full rounded-lg border px-3 text-[14px]"
            />
          </Field>
          <Field label="Usages max">
            <input
              type="number"
              value={form.maxUsages}
              onChange={(e) => setForm({ ...form, maxUsages: Number(e.target.value) })}
              min="1"
              className="border-border h-11 w-full rounded-lg border px-3 text-[14px]"
            />
          </Field>
          <Field label="Ville (optionnel)">
            <input
              type="text"
              value={form.cityScope}
              onChange={(e) => setForm({ ...form, cityScope: e.target.value })}
              placeholder="Nice"
              className="border-border h-11 w-full rounded-lg border px-3 text-[14px]"
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!form.code.trim() || create.isPending}
          className="bg-brand mt-4 h-11 rounded-xl px-5 text-[14px] font-semibold text-white shadow-md disabled:opacity-50"
        >
          {create.isPending ? 'Création…' : 'Créer le code'}
        </button>
      </section>

      <section className="border-border bg-bg-elevated mt-6 overflow-hidden rounded-2xl border">
        <table className="w-full text-[14px]">
          <thead className="text-ink-muted bg-bg-subtle text-left text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Valeur</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {list.data?.map((p) => (
              <tr key={p.id}>
                <td className="font-display text-ink px-4 py-3 text-base font-bold tracking-wider">
                  {p.code}
                </td>
                <td className="text-ink-muted px-4 py-3">{p.type}</td>
                <td className="text-ink px-4 py-3">
                  {p.valuePercent
                    ? `${p.valuePercent}%`
                    : p.valueCents
                      ? `${(p.valueCents / 100).toFixed(2)} €`
                      : 'Livraison'}
                </td>
                <td className="text-ink-muted px-4 py-3">
                  {p.usagesCount}/{p.maxUsages ?? '∞'}
                </td>
                <td className="text-ink-muted px-4 py-3">{p.cityScope ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggle.mutate({ id: p.id, isActive: !p.isActive })}
                    className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                      p.isActive
                        ? 'bg-success/15 text-success hover:bg-success/25'
                        : 'text-ink-muted bg-bg-subtle'
                    }`}
                  >
                    {p.isActive ? 'Actif' : 'Désactivé'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-ink-muted text-[12px] font-medium">{label}</span>
      {children}
    </label>
  );
}
