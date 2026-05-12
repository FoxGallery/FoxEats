'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

const LOCALES = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
  { id: 'it', label: 'Italiano' },
] as const;

const DIETARY_FLAGS = [
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Casher' },
  { id: 'vegetarian', label: 'Végétarien' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Sans gluten' },
  { id: 'lactose-free', label: 'Sans lactose' },
  { id: 'nut-free', label: 'Sans fruits à coque' },
  { id: 'pork-free', label: 'Sans porc' },
] as const;

export default function ProfilePage() {
  const utils = trpc.useUtils();
  const me = trpc.me.get.useQuery();
  const updateProfile = trpc.me.updateProfile.useMutation({
    onSuccess: () => utils.me.get.invalidate(),
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locale, setLocale] = useState<'fr' | 'en' | 'it'>('fr');
  const [dietary, setDietary] = useState<string[]>([]);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!me.data) return;
    setName(me.data.name ?? '');
    setPhone(me.data.phone ?? '');
    setLocale((me.data.locale as 'fr' | 'en' | 'it') ?? 'fr');
    setDietary((me.data.dietaryFlags as string[]) ?? []);
    setMarketing(me.data.marketingConsent);
  }, [me.data]);

  async function save() {
    await updateProfile.mutateAsync({
      name: name || undefined,
      phone: phone || null,
      locale,
      dietaryFlags: dietary as Parameters<typeof updateProfile.mutateAsync>[0]['dietaryFlags'],
      marketingConsent: marketing,
    });
  }

  function toggleFlag(id: string) {
    setDietary((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }

  if (me.isLoading) {
    return <p className="text-ink-muted px-5 py-10">Chargement…</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/app" className="text-ink-muted text-sm hover:underline">
        ← Compte
      </Link>
      <h1 className="font-display text-ink mt-4 text-3xl font-bold tracking-tight">Mon profil</h1>

      <section className="bg-bg-elevated ring-border mt-8 space-y-5 rounded-2xl p-6 shadow-md ring-1">
        <Field label="Nom">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus:border-primary focus:ring-primary/15 border-border bg-bg-elevated h-11 w-full rounded-lg border px-3 text-[15px] outline-none focus:ring-4"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={me.data?.email ?? ''}
            disabled
            className="text-ink-muted border-border bg-bg-subtle h-11 w-full rounded-lg border px-3 text-[15px]"
          />
        </Field>
        <Field label="Téléphone (optionnel)">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 …"
            className="focus:border-primary focus:ring-primary/15 border-border bg-bg-elevated h-11 w-full rounded-lg border px-3 text-[15px] outline-none focus:ring-4"
          />
        </Field>
        <Field label="Langue">
          <div className="flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLocale(l.id)}
                className={`rounded-full border px-4 py-1.5 text-[14px] transition ${
                  locale === l.id
                    ? 'border-primary bg-primary text-white'
                    : 'text-ink border-border bg-bg-elevated hover:bg-bg-subtle'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Field>
      </section>

      <section className="bg-bg-elevated ring-border mt-6 rounded-2xl p-6 shadow-md ring-1">
        <h2 className="text-ink font-semibold">Régimes & allergènes</h2>
        <p className="text-ink-muted mt-1 text-[13px]">
          Les plats contenant ces ingrédients seront signalés au catalog.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DIETARY_FLAGS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => toggleFlag(f.id)}
              className={`rounded-full border px-4 py-1.5 text-[13px] transition ${
                dietary.includes(f.id)
                  ? 'border-accent bg-accent text-white'
                  : 'text-ink border-border bg-bg-elevated hover:bg-bg-subtle'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-bg-elevated ring-border mt-6 rounded-2xl p-6 shadow-md ring-1">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="text-primary focus:ring-primary border-border-strong mt-1 h-4 w-4 rounded"
          />
          <span className="text-ink text-[14px]">
            J&apos;accepte de recevoir des offres et nouveautés FoxEats par email.
            <br />
            <span className="text-ink-muted text-[12px]">
              Désinscription possible à tout moment, depuis vos paramètres ou un email reçu.
            </span>
          </span>
        </label>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <Link href="/app/privacy" className="text-ink-muted text-sm hover:underline">
          Vie privée et RGPD →
        </Link>
        <button
          type="button"
          onClick={save}
          disabled={updateProfile.isPending}
          className="bg-primary hover:bg-primary-600 flex h-12 items-center justify-center rounded-xl px-6 text-[15px] font-medium text-white shadow-md transition disabled:opacity-50"
        >
          {updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {updateProfile.isSuccess && (
        <p className="text-success mt-3 text-right text-[13px]">Profil mis à jour ✓</p>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-ink-muted mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
    </label>
  );
}
