'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { AddressAutocomplete } from '@/components/address-autocomplete';

type AddressForm = {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
  instructions: string;
};

const EMPTY_FORM: AddressForm = {
  label: '',
  street: '',
  city: '',
  postalCode: '',
  country: 'FR',
  lat: 0,
  lng: 0,
  instructions: '',
};

export default function AddressesPage() {
  const utils = trpc.useUtils();
  const list = trpc.me.addresses.useQuery();
  const create = trpc.me.createAddress.useMutation({
    onSuccess: () => utils.me.addresses.invalidate(),
  });
  const remove = trpc.me.deleteAddress.useMutation({
    onSuccess: () => utils.me.addresses.invalidate(),
  });
  const setDefault = trpc.me.setDefaultAddress.useMutation({
    onSuccess: () => utils.me.addresses.invalidate(),
  });

  const [query, setQuery] = useState('');
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [showInstructions, setShowInstructions] = useState(false);

  async function save() {
    if (!form.street || !form.city || !form.postalCode || !form.lat) return;
    await create.mutateAsync({
      label: form.label || undefined,
      street: form.street,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      coords: { lat: form.lat, lng: form.lng },
      instructions: form.instructions || undefined,
    });
    setForm(EMPTY_FORM);
    setQuery('');
    setShowInstructions(false);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/app" className="text-ink-muted text-sm hover:underline">
        ← Compte
      </Link>
      <h1 className="font-display text-ink mt-4 text-3xl font-bold tracking-tight">Mes adresses</h1>
      <p className="text-ink-muted mt-1 text-[15px]">
        Ajoutez vos adresses de livraison favorites. La première sera utilisée par défaut.
      </p>

      <section className="bg-bg-elevated ring-border mt-8 rounded-2xl p-6 shadow-md ring-1">
        <h2 className="text-ink font-semibold">Nouvelle adresse</h2>
        <div className="mt-4 space-y-3">
          <AddressAutocomplete
            value={query}
            onChange={setQuery}
            onSelect={(r) => {
              setForm({
                ...form,
                street: r.street,
                city: r.city,
                postalCode: r.postalCode,
                country: r.country,
                lat: r.lat,
                lng: r.lng,
              });
            }}
            placeholder="ex. 39 Promenade des Anglais, Nice"
          />
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Libellé (optionnel) — Maison, Bureau…"
            className="text-ink placeholder:text-ink-subtle focus:border-primary focus:ring-primary/15 border-border bg-bg-elevated h-12 w-full rounded-xl border px-4 text-[15px] outline-none focus:ring-4"
          />
          {showInstructions ? (
            <textarea
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="Instructions livreur (étage, digicode, etc.)"
              rows={3}
              className="text-ink placeholder:text-ink-subtle focus:border-primary focus:ring-primary/15 border-border bg-bg-elevated w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-4"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowInstructions(true)}
              className="text-primary text-sm hover:underline"
            >
              + Ajouter des instructions livreur
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!form.street || create.isPending}
            className="bg-primary hover:bg-primary-600 flex h-12 w-full items-center justify-center rounded-xl px-6 text-[15px] font-medium text-white shadow-md transition disabled:opacity-50"
          >
            {create.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {create.error && (
            <p className="text-danger text-sm" role="alert">
              {create.error.message}
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-ink font-semibold">Mes adresses enregistrées</h2>
        <div className="mt-3 space-y-3">
          {list.isLoading && <p className="text-ink-muted text-sm">Chargement…</p>}
          {list.data?.length === 0 && (
            <p className="text-ink-muted border-border rounded-xl border border-dashed px-4 py-6 text-center text-sm">
              Aucune adresse pour l&apos;instant.
            </p>
          )}
          {list.data?.map((a) => (
            <div
              key={a.id}
              className="bg-bg-elevated ring-border flex items-start justify-between gap-3 rounded-xl p-4 shadow-sm ring-1"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {a.label && <span className="text-ink font-medium">{a.label}</span>}
                  {a.isDefault && (
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-medium">
                      Par défaut
                    </span>
                  )}
                </div>
                <p className="text-ink-muted mt-1 text-[14px]">
                  {a.street}, {a.postalCode} {a.city}
                </p>
                {a.instructions && (
                  <p className="text-ink-subtle mt-1 text-[12px] italic">{a.instructions}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                {!a.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefault.mutate({ id: a.id })}
                    className="text-primary text-[12px] hover:underline"
                  >
                    Par défaut
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove.mutate({ id: a.id })}
                  className="text-danger text-[12px] hover:underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
