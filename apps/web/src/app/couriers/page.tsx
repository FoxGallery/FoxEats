'use client';

import Link from 'next/link';
import { useState } from 'react';

const BENEFITS = [
  {
    icon: '🕒',
    title: 'Liberté totale',
    text: "Choisissez vos zones et horaires. Activez votre disponibilité d'une simple bascule.",
  },
  {
    icon: '💸',
    title: 'Pourboires 100 %',
    text: 'Tous les pourboires clients vous sont reversés intégralement.',
  },
  {
    icon: '📅',
    title: 'Virements hebdo',
    text: 'Vos gains versés chaque lundi sur votre IBAN via Stripe Connect.',
  },
  {
    icon: '🚲',
    title: 'Tous véhicules',
    text: 'Vélo, vélo électrique, scooter, moto, voiture ou même à pied — vous choisissez.',
  },
];

export default function CouriersPage() {
  const [estimatedDeliveries, setEstimatedDeliveries] = useState(20);
  const [avgFee, setAvgFee] = useState(3.5);

  const weekly = estimatedDeliveries * avgFee;
  const monthly = weekly * 4.33;

  return (
    <main>
      <section className="from-accent relative overflow-hidden bg-gradient-to-br to-[#FF8B7E] text-white">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            FoxEats
          </Link>
          <nav className="hidden gap-7 text-sm md:flex">
            <Link href="/partners" className="text-white/85 hover:text-white">
              Partenaires
            </Link>
            <Link href="/blog" className="text-white/85 hover:text-white">
              Blog
            </Link>
          </nav>
        </header>
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-16">
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/20 backdrop-blur-md">
            Pour les livreurs
          </span>
          <h1 className="font-display mt-5 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Soyez votre propre <span className="text-white">patron</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/90">
            Rejoignez la communauté FoxEats Côte d&apos;Azur. Travaillez quand vous voulez, où vous
            voulez.
          </p>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100"
              >
                <div className="text-3xl">{b.icon}</div>
                <h3 className="font-display text-ink mt-3 text-lg font-semibold">{b.title}</h3>
                <p className="text-ink-muted mt-1 text-[13px] leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="font-display text-ink text-3xl font-bold tracking-tight">
            Estimez vos gains
          </h2>
          <p className="text-ink-muted mt-2 text-[14px]">
            Estimation indicative. Les gains réels varient selon votre zone, vos horaires et la
            saisonnalité de la Côte d&apos;Azur.
          </p>
          <div className="bg-surface mt-6 grid grid-cols-1 gap-6 rounded-3xl p-6 ring-1 ring-neutral-200 md:grid-cols-2 md:p-8">
            <div>
              <label className="block">
                <span className="text-ink-muted mb-2 block text-[12px] font-medium">
                  Courses par semaine :{' '}
                  <span className="text-ink font-bold">{estimatedDeliveries}</span>
                </span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={estimatedDeliveries}
                  onChange={(e) => setEstimatedDeliveries(Number(e.target.value))}
                  className="accent-accent w-full"
                />
              </label>
              <label className="mt-5 block">
                <span className="text-ink-muted mb-2 block text-[12px] font-medium">
                  Gain moyen par course (€) :{' '}
                  <span className="text-ink font-bold">{avgFee.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.1"
                  value={avgFee}
                  onChange={(e) => setAvgFee(Number(e.target.value))}
                  className="accent-accent w-full"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="from-primary to-accent rounded-2xl bg-gradient-to-br p-5 text-white">
                <p className="text-[11px] uppercase tracking-widest text-white/80">Semaine</p>
                <p className="font-display text-3xl font-bold">{weekly.toFixed(0)} €</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100">
                <p className="text-ink-muted text-[11px] uppercase tracking-widest">Mois</p>
                <p className="font-display text-ink text-3xl font-bold">{monthly.toFixed(0)} €</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-ink text-3xl font-bold tracking-tight">Postuler</h2>
          <form
            method="POST"
            action="mailto:livreurs@foxeats.fr"
            encType="text/plain"
            className="mt-6 grid grid-cols-1 gap-3 rounded-2xl bg-white p-6 ring-1 ring-neutral-200"
          >
            <Field label="Prénom" name="firstName" required />
            <Field label="Nom" name="lastName" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Téléphone" name="phone" type="tel" required />
            <label className="block">
              <span className="text-ink-muted mb-1.5 block text-[12px] font-medium">Véhicule</span>
              <select
                name="vehicle"
                className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px]"
              >
                <option value="bike">Vélo</option>
                <option value="ebike">Vélo électrique</option>
                <option value="scooter">Trottinette</option>
                <option value="motorbike">Moto / Scooter</option>
                <option value="car">Voiture</option>
                <option value="walk">À pied</option>
              </select>
            </label>
            <Field label="Ville principale" name="city" required placeholder="Nice, Cannes…" />
            <Field label="Disponibilité (jours / heures)" name="availability" />
            <button
              type="submit"
              className="bg-accent mt-2 h-12 rounded-xl px-6 text-[14px] font-semibold text-white shadow-md"
            >
              Envoyer ma candidature
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-ink-muted mb-1.5 block text-[12px] font-medium">
        {label}
        {required && ' *'}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="focus:border-accent focus:ring-accent/15 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] outline-none focus:ring-2"
      />
    </label>
  );
}
