'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function MerchantPromosPage() {
  const restaurants = trpc.merchant.myRestaurants.useQuery();
  const active = restaurants.data?.[0];
  const utils = trpc.useUtils();

  const list = trpc.merchant.promos.list.useQuery(
    { restaurantId: active?.id ?? '' },
    { enabled: !!active?.id },
  );
  const create = trpc.merchant.promos.create.useMutation({
    onSuccess: () => utils.merchant.promos.list.invalidate(),
  });
  const toggle = trpc.merchant.promos.toggleActive.useMutation({
    onSuccess: () => utils.merchant.promos.list.invalidate(),
  });

  const [form, setForm] = useState({
    code: '',
    type: 'percent_off' as 'percent_off' | 'amount_off' | 'free_delivery',
    valuePercent: 10,
    valueCents: 200,
    minOrderCents: 1500,
    maxUsages: 100,
  });

  if (!active) return <p className="text-ink-muted p-8">Chargement…</p>;

  function submit() {
    if (!active?.id || !form.code.trim()) return;
    create.mutate({
      restaurantId: active.id,
      code: form.code.toUpperCase().trim(),
      type: form.type,
      valuePercent: form.type === 'percent_off' ? form.valuePercent : undefined,
      valueCents: form.type === 'amount_off' ? form.valueCents : undefined,
      minOrderCents: form.minOrderCents,
      maxUsages: form.maxUsages,
      perUserLimit: 1,
    });
    setForm({ ...form, code: '' });
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="font-display text-ink text-3xl font-bold tracking-tight">Promotions</h1>
      <p className="text-ink-muted mt-1 text-[14px]">
        Créez des codes promo applicables uniquement à votre établissement.
      </p>

      <section className="bg-bg-elevated ring-border mt-6 rounded-2xl p-5 shadow-sm ring-1">
        <h2 className="font-display text-ink text-lg font-semibold">Nouveau code</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Code</span>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="ETE25"
              className="focus:border-primary focus:ring-primary/15 border-border h-11 rounded-lg border px-3 text-[14px] uppercase outline-none focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
              className="border-border bg-bg-elevated h-11 rounded-lg border px-3 text-[14px]"
            >
              <option value="percent_off">% de remise</option>
              <option value="amount_off">Montant fixe (€)</option>
              <option value="free_delivery">Livraison offerte</option>
            </select>
          </label>
          {form.type === 'percent_off' && (
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">Pourcentage</span>
              <input
                type="number"
                value={form.valuePercent}
                onChange={(e) => setForm({ ...form, valuePercent: Number(e.target.value) })}
                min="1"
                max="100"
                className="border-border h-11 rounded-lg border px-3 text-[14px]"
              />
            </label>
          )}
          {form.type === 'amount_off' && (
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted text-[12px] font-medium">Montant (€)</span>
              <input
                type="number"
                value={form.valueCents / 100}
                onChange={(e) =>
                  setForm({ ...form, valueCents: Math.round(parseFloat(e.target.value) * 100) })
                }
                min="0"
                step="0.5"
                className="border-border h-11 rounded-lg border px-3 text-[14px]"
              />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Montant min commande (€)</span>
            <input
              type="number"
              value={form.minOrderCents / 100}
              onChange={(e) =>
                setForm({ ...form, minOrderCents: Math.round(parseFloat(e.target.value) * 100) })
              }
              min="0"
              className="border-border h-11 rounded-lg border px-3 text-[14px]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Usages max</span>
            <input
              type="number"
              value={form.maxUsages}
              onChange={(e) => setForm({ ...form, maxUsages: Number(e.target.value) })}
              min="1"
              className="border-border h-11 rounded-lg border px-3 text-[14px]"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!form.code.trim() || create.isPending}
          className="bg-primary mt-4 flex h-11 items-center justify-center rounded-xl px-5 text-[14px] font-semibold text-white shadow-md disabled:opacity-50"
        >
          {create.isPending ? 'Création…' : 'Créer le code'}
        </button>
      </section>

      <section className="bg-bg-elevated ring-border mt-6 rounded-2xl p-5 shadow-sm ring-1">
        <h2 className="font-display text-ink text-lg font-semibold">Codes actifs</h2>
        <div className="divide-border mt-3 divide-y">
          {list.data?.length === 0 && (
            <p className="text-ink-muted py-6 text-center text-[13px]">
              Aucun code pour le moment.
            </p>
          )}
          {list.data?.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
              <div className="min-w-0 flex-1">
                <p className="font-display text-ink text-base font-bold tracking-wider">{p.code}</p>
                <p className="text-ink-muted text-[12px]">
                  {p.type === 'percent_off'
                    ? `${p.valuePercent}% de remise`
                    : p.type === 'amount_off'
                      ? `${((p.valueCents ?? 0) / 100).toFixed(2)} € de remise`
                      : 'Livraison offerte'}{' '}
                  · {p.usagesCount}/{p.maxUsages ?? '∞'} utilisations
                </p>
              </div>
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
