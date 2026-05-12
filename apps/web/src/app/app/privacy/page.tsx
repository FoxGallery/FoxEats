'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { authClient } from '@foxeats/auth/client';

export default function PrivacyPage() {
  const router = useRouter();
  const requestExport = trpc.me.requestExport.useMutation();
  const deleteAccount = trpc.me.deleteAccount.useMutation();

  const [confirmText, setConfirmText] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  function downloadExport(data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foxeats-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doDelete() {
    if (confirmText !== 'SUPPRIMER MON COMPTE') return;
    await deleteAccount.mutateAsync({ confirm: 'SUPPRIMER MON COMPTE' });
    await authClient.signOut();
    router.replace('/');
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/app/profile" className="text-ink-muted text-sm hover:underline">
        ← Profil
      </Link>
      <h1 className="font-display text-ink mt-4 text-3xl font-bold tracking-tight">
        Vie privée & RGPD
      </h1>
      <p className="text-ink-muted mt-2 text-[15px]">
        Vous avez le droit d&apos;accéder à vos données et de supprimer votre compte à tout moment.
      </p>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-md ring-1 ring-neutral-100">
        <h2 className="text-ink font-semibold">Exporter mes données</h2>
        <p className="text-ink-muted mt-2 text-[14px]">
          Téléchargez l&apos;ensemble de vos données personnelles (profil, adresses, FoxCoins) au
          format JSON.
        </p>
        <button
          type="button"
          onClick={async () => {
            const data = await requestExport.mutateAsync();
            downloadExport(data);
          }}
          disabled={requestExport.isPending}
          className="bg-primary hover:bg-primary-600 mt-4 flex h-11 items-center justify-center rounded-xl px-5 text-[14px] font-medium text-white shadow-md transition disabled:opacity-50"
        >
          {requestExport.isPending ? 'Préparation…' : 'Télécharger mes données'}
        </button>
      </section>

      <section className="border-danger/30 bg-danger/[0.03] mt-6 rounded-2xl border p-6">
        <h2 className="text-danger font-semibold">Supprimer mon compte</h2>
        <p className="text-ink-muted mt-2 text-[14px]">
          La suppression est définitive. Vos données personnelles seront anonymisées immédiatement
          puis purgées après 30 jours conformément à la RGPD.
        </p>
        {!showDelete ? (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="border-danger text-danger hover:bg-danger mt-4 flex h-11 items-center justify-center rounded-xl border px-5 text-[14px] font-medium transition hover:text-white"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-ink-muted text-[13px]">
              Tapez{' '}
              <code className="text-ink rounded bg-neutral-100 px-1 py-0.5">
                SUPPRIMER MON COMPTE
              </code>{' '}
              pour confirmer.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER MON COMPTE"
              className="focus:border-danger focus:ring-danger/15 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] outline-none focus:ring-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDelete(false);
                  setConfirmText('');
                }}
                className="text-ink flex h-10 items-center justify-center rounded-xl border border-neutral-200 px-4 text-[14px]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={doDelete}
                disabled={confirmText !== 'SUPPRIMER MON COMPTE' || deleteAccount.isPending}
                className="bg-danger flex h-10 items-center justify-center rounded-xl px-4 text-[14px] font-medium text-white disabled:opacity-50"
              >
                {deleteAccount.isPending ? 'Suppression…' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
