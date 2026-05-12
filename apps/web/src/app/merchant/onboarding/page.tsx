'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

const STEPS = [
  { id: 'welcome', label: 'Bienvenue' },
  { id: 'profile', label: 'Établissement' },
  { id: 'stripe', label: 'KYC Stripe' },
  { id: 'menu', label: 'Premier menu' },
  { id: 'go-live', label: 'Activation' },
] as const;

export default function MerchantOnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const restaurants = trpc.merchant.myRestaurants.useQuery();
  const existing = restaurants.data?.[0];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/merchant" className="text-ink-muted text-sm hover:underline">
        ← Tableau de bord
      </Link>
      <h1 className="font-display text-ink mt-3 text-3xl font-bold tracking-tight">
        Démarrage rapide
      </h1>
      <p className="text-ink-muted mt-1 text-[14px]">
        5 étapes pour mettre votre restaurant en ligne.
      </p>

      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-[12px] font-semibold ${
                i <= step ? 'bg-primary text-white' : 'text-ink-muted bg-neutral-100'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-[12px] sm:inline ${
                i === step ? 'text-ink font-semibold' : 'text-ink-muted'
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-1 hidden h-px flex-1 sm:block ${
                  i < step ? 'bg-primary' : 'bg-neutral-200'
                }`}
              />
            )}
          </li>
        ))}
      </ol>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-100 lg:p-8">
        {step === 0 && (
          <>
            <h2 className="font-display text-ink text-2xl font-bold">
              Bienvenue chez FoxEats partenaires 👋
            </h2>
            <p className="text-ink-muted mt-3 text-[15px] leading-relaxed">
              Vous allez configurer votre établissement en quelques minutes. Comptez 10 min pour la
              partie Stripe (KYC) qui peut nécessiter vos justificatifs.
            </p>
            <ul className="text-ink mt-5 space-y-2 text-[14px]">
              <li className="flex gap-2">
                <span>✅</span> 0 € à l&apos;inscription
              </li>
              <li className="flex gap-2">
                <span>✅</span> Commission de 15 % sur les commandes livrées
              </li>
              <li className="flex gap-2">
                <span>✅</span> Reversements hebdomadaires Stripe
              </li>
              <li className="flex gap-2">
                <span>✅</span> Annulation libre 2 minutes après chaque commande
              </li>
            </ul>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-display text-ink text-2xl font-bold">Votre établissement</h2>
            <p className="text-ink-muted mt-2 text-[14px]">
              Pour MVP, contactez-nous à{' '}
              <a href="mailto:partenaires@foxeats.fr" className="text-primary underline">
                partenaires@foxeats.fr
              </a>{' '}
              pour créer votre fiche restaurant (slug, ville, adresse, cuisines). Cette étape sera
              self-service en M9 sur le site vitrine.
            </p>
            {existing && (
              <div className="bg-success/10 text-success mt-4 rounded-xl p-4 text-[14px]">
                ✓ Votre établissement <strong>{existing.name}</strong> est déjà créé.
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display text-ink text-2xl font-bold">KYC Stripe Connect</h2>
            <p className="text-ink-muted mt-2 text-[14px]">
              Stripe vérifie votre identité et collecte vos coordonnées bancaires en toute sécurité.
              On vous redirige vers leur portail.
            </p>
            <Link
              href="/merchant/settings"
              className="bg-accent mt-4 inline-flex h-11 items-center rounded-xl px-5 text-[14px] font-semibold text-white"
            >
              Lancer le KYC
            </Link>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display text-ink text-2xl font-bold">Premier menu</h2>
            <p className="text-ink-muted mt-2 text-[14px]">
              Créez quelques catégories (Entrées, Plats, Desserts…) avec vos plats signature. Vous
              pourrez compléter et modifier à tout moment.
            </p>
            <Link
              href="/merchant/menu"
              className="bg-primary mt-4 inline-flex h-11 items-center rounded-xl px-5 text-[14px] font-semibold text-white"
            >
              Aller au menu
            </Link>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-display text-ink text-2xl font-bold">Prêt à passer en ligne ?</h2>
            <p className="text-ink-muted mt-2 text-[14px]">
              Vérifiez vos horaires d&apos;ouverture, votre KYC Stripe est valide, et votre menu a
              au moins 5 plats. Une fois activé, vous recevez les commandes.
            </p>
            <button
              type="button"
              onClick={() => router.push('/merchant')}
              className="bg-success mt-4 inline-flex h-11 items-center rounded-xl px-5 text-[14px] font-semibold text-white"
            >
              Terminer
            </button>
          </>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-ink-muted text-[14px] hover:underline disabled:opacity-30"
          >
            ← Retour
          </button>
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="bg-primary rounded-xl px-5 py-2 text-[14px] font-semibold text-white"
            >
              Étape suivante →
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
