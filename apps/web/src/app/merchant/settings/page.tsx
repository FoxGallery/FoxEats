'use client';

import { useEffect, useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const DAYS = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' },
  { id: 'saturday', label: 'Samedi' },
  { id: 'sunday', label: 'Dimanche' },
] as const;

type HoursMap = Record<string, Array<{ open: string; close: string }>>;

export default function MerchantSettingsPage() {
  const restaurants = trpc.merchant.myRestaurants.useQuery();
  const active = restaurants.data?.[0];
  const utils = trpc.useUtils();
  const update = trpc.merchant.updateRestaurant.useMutation({
    onSuccess: () => utils.merchant.myRestaurants.invalidate(),
  });

  const connectStatus = trpc.payments.connectStatus.useQuery(
    { restaurantId: active?.id ?? '' },
    { enabled: !!active?.id },
  );
  const startOnboarding = trpc.payments.startConnectOnboarding.useMutation();
  const dashboardLink = trpc.payments.connectDashboardLink.useMutation();

  const [hours, setHours] = useState<HoursMap>({});
  const [delivery, setDelivery] = useState({
    deliveryFeeCents: 299,
    deliveryMinCents: 1200,
    prepTimeMinMinutes: 20,
    prepTimeMaxMinutes: 35,
  });
  const [info, setInfo] = useState({ description: '', phone: '' });

  useEffect(() => {
    if (!active) return;
    setHours((active.openingHours as HoursMap | null) ?? {});
    setDelivery({
      deliveryFeeCents: active.deliveryFeeCents,
      deliveryMinCents: active.deliveryMinCents,
      prepTimeMinMinutes: active.prepTimeMinMinutes,
      prepTimeMaxMinutes: active.prepTimeMaxMinutes,
    });
    setInfo({ description: active.description ?? '', phone: active.phone ?? '' });
  }, [active]);

  if (!active) return <p className="text-ink-muted p-8">Chargement…</p>;

  async function openOnboarding() {
    if (!active?.id) return;
    const url = `${window.location.origin}/merchant/settings`;
    const r = await startOnboarding.mutateAsync({ restaurantId: active.id, returnUrl: url });
    if (r.url) window.location.href = r.url;
  }

  async function openDashboard() {
    if (!active?.id) return;
    const r = await dashboardLink.mutateAsync({ restaurantId: active.id });
    if (r.url) window.open(r.url, '_blank');
  }

  function saveAll() {
    if (!active?.id) return;
    update.mutate({
      id: active.id,
      patch: {
        description: info.description || null,
        phone: info.phone || null,
        ...delivery,
        openingHours: hours,
      },
    });
  }

  function setDayHours(day: string, range: { open: string; close: string }[]) {
    setHours((h) => ({ ...h, [day]: range }));
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="font-display text-ink text-3xl font-bold tracking-tight">Paramètres</h1>
      <p className="text-ink-muted mt-1 text-[14px]">{active.name}</p>

      <section className="border-border bg-bg-elevated shadow-xs mt-6 rounded-2xl border p-5">
        <h2 className="font-display text-ink text-lg font-semibold">Reversements Stripe Connect</h2>
        {!connectStatus.data?.hasAccount ? (
          <div className="mt-3">
            <p className="text-ink-muted text-[14px]">
              Activez Stripe Connect Express pour recevoir vos paiements.
            </p>
            <button
              type="button"
              onClick={openOnboarding}
              disabled={startOnboarding.isPending}
              className="bg-accent mt-3 inline-flex h-11 items-center rounded-xl px-5 text-[14px] font-semibold text-white shadow-md"
            >
              {startOnboarding.isPending ? 'Préparation…' : 'Activer Stripe Connect'}
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="flex gap-3 text-[13px]">
              <Badge ok={!!connectStatus.data.detailsSubmitted}>Profil complété</Badge>
              <Badge ok={!!connectStatus.data.chargesEnabled}>Encaissement</Badge>
              <Badge ok={!!connectStatus.data.payoutsEnabled}>Virements</Badge>
            </div>
            <button
              type="button"
              onClick={openDashboard}
              className="text-ink border-border hover:bg-bg-subtle mt-3 inline-flex h-10 items-center rounded-lg border px-4 text-[13px] font-medium"
            >
              Ouvrir mon tableau de bord Stripe →
            </button>
          </div>
        )}
      </section>

      <section className="border-border bg-bg-elevated shadow-xs mt-6 rounded-2xl border p-5">
        <h2 className="font-display text-ink text-lg font-semibold">Infos restaurant</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Description</span>
            <textarea
              value={info.description}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
              rows={3}
              className="focus:border-brand focus:ring-brand/15 border-border rounded-lg border px-3 py-2 text-[14px] outline-none focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-ink-muted text-[12px] font-medium">Téléphone</span>
            <input
              type="tel"
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
              className="border-border h-11 rounded-lg border px-3 text-[14px]"
            />
          </label>
        </div>
      </section>

      <section className="border-border bg-bg-elevated shadow-xs mt-6 rounded-2xl border p-5">
        <h2 className="font-display text-ink text-lg font-semibold">Livraison & préparation</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumField
            label="Frais livraison (€)"
            value={delivery.deliveryFeeCents / 100}
            onChange={(v) => setDelivery({ ...delivery, deliveryFeeCents: Math.round(v * 100) })}
            step={0.1}
          />
          <NumField
            label="Minimum (€)"
            value={delivery.deliveryMinCents / 100}
            onChange={(v) => setDelivery({ ...delivery, deliveryMinCents: Math.round(v * 100) })}
            step={0.5}
          />
          <NumField
            label="Prep min (min)"
            value={delivery.prepTimeMinMinutes}
            onChange={(v) => setDelivery({ ...delivery, prepTimeMinMinutes: Math.round(v) })}
          />
          <NumField
            label="Prep max (min)"
            value={delivery.prepTimeMaxMinutes}
            onChange={(v) => setDelivery({ ...delivery, prepTimeMaxMinutes: Math.round(v) })}
          />
        </div>
      </section>

      <section className="border-border bg-bg-elevated shadow-xs mt-6 rounded-2xl border p-5">
        <h2 className="font-display text-ink text-lg font-semibold">Horaires d&apos;ouverture</h2>
        <p className="text-ink-muted mt-1 text-[12px]">
          Format 24h. Laissez vide pour fermer la journée. Plusieurs créneaux possibles.
        </p>
        <div className="mt-4 space-y-2">
          {DAYS.map((d) => {
            const ranges = hours[d.id] ?? [];
            return (
              <div key={d.id} className="flex items-center gap-3 text-[14px]">
                <span className="text-ink w-24">{d.label}</span>
                <div className="flex flex-wrap gap-2">
                  {ranges.map((r, i) => (
                    <span
                      key={i}
                      className="bg-bg-subtle flex items-center gap-1 rounded-lg px-2 py-1"
                    >
                      <input
                        type="time"
                        value={r.open}
                        onChange={(e) => {
                          const next = [...ranges];
                          next[i] = { ...r, open: e.target.value };
                          setDayHours(d.id, next);
                        }}
                        className="bg-transparent text-[13px]"
                      />
                      <span>–</span>
                      <input
                        type="time"
                        value={r.close}
                        onChange={(e) => {
                          const next = [...ranges];
                          next[i] = { ...r, close: e.target.value };
                          setDayHours(d.id, next);
                        }}
                        className="bg-transparent text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDayHours(
                            d.id,
                            ranges.filter((_, j) => j !== i),
                          )
                        }
                        className="text-danger"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setDayHours(d.id, [...ranges, { open: '12:00', close: '14:30' }])
                    }
                    className="text-ink-muted border-border-strong hover:bg-bg-subtle rounded-lg border border-dashed px-3 py-1 text-[12px]"
                  >
                    + Créneau
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={saveAll}
          disabled={update.isPending}
          className="bg-brand flex h-11 items-center rounded-xl px-6 text-[14px] font-semibold text-white shadow-md disabled:opacity-50"
        >
          {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {update.isSuccess && (
        <p className="text-success mt-3 text-right text-[13px] font-semibold">
          Modifications enregistrées
        </p>
      )}
    </div>
  );
}

function Badge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  const Icon = ok ? Check : AlertTriangle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${
        ok ? 'bg-success/15 text-success' : 'bg-warn/15 text-warn'
      }`}
    >
      <Icon size={12} strokeWidth={2.6} />
      {children as any}
    </span>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-ink-muted text-[12px] font-medium">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        min="0"
        className="border-border h-11 rounded-lg border px-3 text-[14px]"
      />
    </label>
  );
}
