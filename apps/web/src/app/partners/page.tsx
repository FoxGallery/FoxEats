import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Devenir restaurant partenaire',
  description:
    "Rejoignez FoxEats, la marketplace de livraison de la Côte d'Azur. 0 € à l'inscription, commission de 15 %, reversements hebdomadaires.",
};

const BENEFITS = [
  {
    icon: '💰',
    title: "0 € à l'inscription",
    text: 'Aucun frais fixe ni abonnement. Vous payez uniquement quand vous vendez.',
  },
  {
    icon: '📊',
    title: '15 % de commission',
    text: 'Sur les commandes livrées uniquement. Reversements automatiques hebdo.',
  },
  {
    icon: '🛠️',
    title: 'KDS inclus',
    text: 'Dashboard professionnel avec écran de gestion des commandes en temps réel.',
  },
  {
    icon: '📈',
    title: 'Statistiques',
    text: 'CA, ticket moyen, plats stars, heures pic — décisions data-driven.',
  },
];

const FAQ = [
  {
    q: "Combien coûte l'inscription ?",
    a: "L'inscription est gratuite. Vous payez uniquement une commission de 15 % sur les commandes livrées.",
  },
  {
    q: 'Combien de temps pour démarrer ?',
    a: "Environ 10 minutes pour l'inscription Stripe Connect (KYC) + le temps de préparer votre menu. Vous pouvez recevoir vos premières commandes le jour même.",
  },
  {
    q: 'Quand suis-je payé ?',
    a: 'Reversements automatiques chaque lundi via Stripe Connect, directement sur votre compte bancaire.',
  },
  {
    q: 'Qui gère la livraison ?',
    a: "FoxEats gère le réseau de livreurs indépendants. Vous préparez la commande, on s'occupe du reste.",
  },
];

export default function PartnersPage() {
  return (
    <main>
      <section className="from-primary to-primary-700 relative overflow-hidden bg-gradient-to-br text-white">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            FoxEats
          </Link>
          <nav className="hidden gap-7 text-sm md:flex">
            <Link href="/couriers" className="text-white/85 hover:text-white">
              Livreurs
            </Link>
            <Link href="/blog" className="text-white/85 hover:text-white">
              Blog
            </Link>
          </nav>
        </header>
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-16">
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/20 backdrop-blur-md">
            Pour les restaurateurs
          </span>
          <h1 className="font-display mt-5 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Servez toute la <span className="text-accent">Côte d&apos;Azur</span> depuis votre
            cuisine.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Ouvrez votre marketplace, sans frais d&apos;inscription, avec un vrai partenaire qui
            valorise votre cuisine.
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
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-ink text-3xl font-bold tracking-tight">
            Inscription partenaire
          </h2>
          <p className="text-ink-muted mt-2 text-[14px]">
            Remplissez ce formulaire. Notre équipe vous recontacte sous 48h.
          </p>
          <PartnerForm />
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-ink text-3xl font-bold tracking-tight">
            Questions fréquentes
          </h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-2xl bg-white p-5 ring-1 ring-neutral-100">
                <summary className="font-display text-ink cursor-pointer text-base font-semibold">
                  {f.q}
                </summary>
                <p className="text-ink-muted mt-2 text-[14px] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PartnerForm() {
  return (
    <form
      method="POST"
      action="mailto:partenaires@foxeats.fr"
      encType="text/plain"
      className="bg-surface mt-6 grid grid-cols-1 gap-3 rounded-2xl p-6 ring-1 ring-neutral-200"
    >
      <Field label="Nom du restaurant" name="restaurant" required />
      <Field label="Ville" name="city" required placeholder="Nice / Cannes / Antibes…" />
      <Field label="Type de cuisine" name="cuisine" placeholder="Niçoise, italienne, pizza…" />
      <Field label="Nom du contact" name="contact" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Téléphone" name="phone" type="tel" />
      <Field label="Site web (optionnel)" name="website" type="url" />
      <label className="block">
        <span className="text-ink-muted mb-1.5 block text-[12px] font-medium">
          Quelques mots sur votre établissement
        </span>
        <textarea
          name="message"
          rows={4}
          className="focus:border-primary focus:ring-primary/15 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[14px] outline-none focus:ring-2"
        />
      </label>
      <button
        type="submit"
        className="bg-primary mt-2 h-12 rounded-xl px-6 text-[14px] font-semibold text-white shadow-md"
      >
        Envoyer ma candidature
      </button>
    </form>
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
        className="focus:border-primary focus:ring-primary/15 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] outline-none focus:ring-2"
      />
    </label>
  );
}
