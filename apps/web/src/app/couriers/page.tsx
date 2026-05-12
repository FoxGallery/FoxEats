'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Wallet,
  Bike,
  Quote,
  Calendar,
  TrendingUp,
  Star,
  Sparkles,
  Shield,
} from 'lucide-react';
import { photo } from '@/lib/photos';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

const STATS = [
  { kpi: '100 %', label: 'pourboires\nreversés' },
  { kpi: '7 j.', label: 'paiement\nhebdo' },
  { kpi: '< 5 min', label: 'temps moyen\nentre courses' },
  { kpi: '4,8 ★', label: 'note moyenne\nlivreurs' },
];

const BENEFITS = [
  {
    icon: Clock,
    title: 'Liberté totale',
    text: "Choisissez vos zones, vos horaires, vos jours. Activez votre disponibilité d'un seul tap. Pas de planning imposé.",
  },
  {
    icon: Wallet,
    title: 'Pourboires 100 %',
    text: 'Tous les pourboires clients vous reviennent. Aucune marge ni commission FoxEats dessus, jamais.',
  },
  {
    icon: Calendar,
    title: 'Paiements hebdo',
    text: "Vos gains versés chaque lundi sur votre IBAN via Stripe Connect. Pas d'avance, pas de seuil minimum.",
  },
  {
    icon: Bike,
    title: 'Tous véhicules',
    text: 'Vélo, vélo électrique, scooter, moto, voiture ou à pied. Vos missions sont matchées à votre moyen.',
  },
  {
    icon: TrendingUp,
    title: 'Bonus zones tendues',
    text: 'Boost de gain automatique sur les zones avec peu de livreurs. La nuit, les pics, les jours fériés.',
  },
  {
    icon: Shield,
    title: 'Auto-entrepreneur accompagné',
    text: 'On vous guide pour ouvrir le statut. Récap URSSAF et CFE prêt en 1 clic, exports CSV pour votre compta.',
  },
];

const STEPS = [
  { n: '01', title: 'Postulez', text: '5 minutes, 100 % en ligne.' },
  { n: '02', title: 'Vérif. doc', text: 'Pièce identité, RIB, photo. Validation < 24 h.' },
  { n: '03', title: 'KYC Stripe', text: 'Compte de paiement opéré par Stripe Connect.' },
  {
    n: '04',
    title: 'Vous roulez',
    text: 'Activez votre disponibilité, recevez vos premières courses.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      "J'ai bossé chez le concurrent 2 ans. Chez FoxEats, je touche 30 % de plus pour le même temps. Et le pourboire qui reste à moi, ça change la vie.",
    name: 'Mehdi A.',
    role: 'Livreur scooter — Nice',
    rating: 5,
  },
  {
    quote:
      "Je peux choisir mes créneaux autour de mes cours. L'app est claire, les paiements arrivent toujours le lundi matin. Zéro stress.",
    name: 'Léa V.',
    role: 'Livreuse vélo — Antibes',
    rating: 5,
  },
  {
    quote:
      "Les bonus zones tendues, c'est ce qui fait la différence. J'ai monté à 1 200 € net certaines semaines en saison.",
    name: 'Tom B.',
    role: 'Livreur moto — Cannes',
    rating: 5,
  },
];

const FAQ = [
  {
    q: 'Quel statut juridique ?',
    a: "Auto-entrepreneur (micro-entreprise). On vous guide étape par étape pour l'ouverture sur autoentrepreneur.urssaf.fr, c'est gratuit et ça prend 15 min.",
  },
  {
    q: 'Quels documents fournir ?',
    a: "Pièce d'identité, justificatif de domicile récent, RIB, numéro SIRET, photo profil. Le tout uploadé directement dans l'app livreur.",
  },
  {
    q: "Quel est le minimum d'âge ?",
    a: '18 ans révolus, comme pour toute auto-entreprise en France.',
  },
  {
    q: 'Combien je gagne par course ?',
    a: "Entre 3,50 € et 7 € par course en moyenne selon la distance, la zone et l'heure. Plus les pourboires 100 % reversés.",
  },
  {
    q: 'Faut-il une assurance ?',
    a: 'Oui : une RC pro auto-entrepreneur (env. 100 €/an) couvrant la livraison. On vous oriente vers des partenaires à tarif négocié.',
  },
];

export default function CouriersPage() {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [deliveriesPerHour, setDeliveriesPerHour] = useState(2.5);
  const [avgFee, setAvgFee] = useState(4.2);
  const [tipRate, setTipRate] = useState(0.8);

  const deliveries = Math.round(hoursPerWeek * deliveriesPerHour);
  const weekly = deliveries * (avgFee + tipRate);
  const monthly = weekly * 4.33;

  return (
    <main className="bg-bg text-ink">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="from-accent to-brand absolute inset-0 -z-10 bg-gradient-to-br via-[#1E4FA8]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 -z-10 opacity-30 mix-blend-overlay">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo('hero-driver')} alt="" className="h-full w-full object-cover" />
        </div>

        <SiteHeader variant="transparent" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 text-white md:grid-cols-[1.15fr_1fr] md:pb-32 md:pt-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-widest ring-1 ring-white/20 backdrop-blur-md">
              <Sparkles size={12} strokeWidth={2.4} />
              Livreurs FoxEats
            </span>
            <h1 className="font-display mt-5 text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-[64px] md:text-[80px]">
              Roulez à votre rythme.
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Gagnez vraiment.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/90">
              Liberté sur vos zones et horaires. Pourboires 100 % reversés. Paiements hebdo
              automatiques. La meilleure rétribution livreur de la Côte d&apos;Azur.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#postuler"
                className="bg-bg-elevated text-ink inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-semibold shadow-xl hover:bg-white/95"
              >
                Postuler en 5 min
                <ArrowRight size={14} strokeWidth={2.6} />
              </a>
              <a
                href="#calcul"
                className="inline-flex h-12 items-center rounded-2xl border border-white/30 bg-white/10 px-6 text-[14px] font-semibold text-white backdrop-blur-md hover:bg-white/20"
              >
                Simulateur de gains
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.kpi}>
                  <p className="font-display text-[28px] font-extrabold leading-none tracking-tight sm:text-[32px]">
                    {s.kpi}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[11px] leading-tight text-white/80">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <DriverAppMockup />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">
            Ce que vous y gagnez
          </p>
          <h2 className="font-display text-ink mt-2 max-w-3xl text-[32px] font-extrabold tracking-tight sm:text-[48px]">
            Les conditions
            <span className="text-accent"> les plus justes</span> du marché.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="border-border bg-bg-elevated shadow-xs hover:shadow-food group rounded-3xl border p-7 transition hover:-translate-y-1"
                >
                  <span className="bg-accent-soft text-accent group-hover:bg-accent grid h-12 w-12 place-items-center rounded-2xl transition group-hover:text-white">
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <h3 className="font-display text-ink mt-5 text-[19px] font-bold tracking-tight">
                    {b.title}
                  </h3>
                  <p className="text-ink-muted mt-2 text-[14px] leading-relaxed">{b.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SIMULATOR */}
      <section id="calcul" className="bg-bg-subtle py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">
                Simulateur de gains
              </p>
              <h2 className="font-display text-ink mt-2 text-[32px] font-extrabold tracking-tight sm:text-[44px]">
                Combien vous
                <br />
                <span className="text-accent">allez gagner ?</span>
              </h2>
              <p className="text-ink-muted mt-4 max-w-md text-[15px] leading-relaxed">
                Indicatif. Les gains réels dépendent de votre zone, vos créneaux, la saison (énorme
                pic en été sur la Riviera) et votre cadence.
              </p>
              <div className="mt-8 space-y-5">
                <Slider
                  label="Heures par semaine"
                  value={hoursPerWeek}
                  display={`${hoursPerWeek} h`}
                  min={5}
                  max={50}
                  step={1}
                  onChange={setHoursPerWeek}
                />
                <Slider
                  label="Courses par heure"
                  value={deliveriesPerHour}
                  display={deliveriesPerHour.toFixed(1)}
                  min={1}
                  max={4}
                  step={0.1}
                  onChange={setDeliveriesPerHour}
                />
                <Slider
                  label="Gain moyen par course"
                  value={avgFee}
                  display={`${avgFee.toFixed(2)} €`}
                  min={2.5}
                  max={7}
                  step={0.1}
                  onChange={setAvgFee}
                />
                <Slider
                  label="Pourboire moyen"
                  value={tipRate}
                  display={`${tipRate.toFixed(2)} €`}
                  min={0}
                  max={3}
                  step={0.1}
                  onChange={setTipRate}
                />
              </div>
            </div>

            <div className="border-border bg-bg-elevated shadow-food rounded-3xl border p-7">
              <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-widest">
                Estimation
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-ink text-[64px] font-extrabold leading-none tracking-tight sm:text-[88px]">
                  {Math.round(monthly)}
                </span>
                <span className="font-display text-ink-muted text-[28px] font-bold">€ / mois</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="from-accent to-brand shadow-food rounded-2xl bg-gradient-to-br p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                    Par semaine
                  </p>
                  <p className="font-display mt-1 text-[28px] font-extrabold leading-none tracking-tight">
                    {Math.round(weekly)} €
                  </p>
                </div>
                <div className="border-border bg-bg rounded-2xl border p-5">
                  <p className="text-ink-subtle text-[10px] font-semibold uppercase tracking-widest">
                    Courses / sem.
                  </p>
                  <p className="font-display text-ink mt-1 text-[28px] font-extrabold leading-none tracking-tight">
                    {deliveries}
                  </p>
                </div>
              </div>

              <div className="bg-bg-subtle text-ink-muted mt-6 space-y-2 rounded-2xl p-4 text-[12px]">
                <p>
                  Détail : {deliveries} courses × ({avgFee.toFixed(2)} € + {tipRate.toFixed(2)} €
                  tip) = <span className="text-ink font-bold">{weekly.toFixed(0)} € / sem</span>
                </p>
                <p className="text-ink-subtle text-[11px]">
                  Avant cotisations URSSAF (~22 % pour micro-entreprise services).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">
            Onboarding
          </p>
          <h2 className="font-display text-ink mt-2 max-w-3xl text-[32px] font-extrabold tracking-tight sm:text-[48px]">
            De la candidature
            <span className="text-accent"> à la 1ʳᵉ course</span> en 24 h.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="border-border bg-bg-elevated shadow-xs rounded-3xl border p-6"
              >
                <span
                  className={`font-display inline-flex h-10 w-10 items-center justify-center rounded-2xl text-[15px] font-extrabold ${
                    i === 0 ? 'bg-accent text-white' : 'bg-bg-subtle text-ink'
                  }`}
                >
                  {s.n}
                </span>
                <h3 className="font-display text-ink mt-5 text-[18px] font-bold tracking-tight">
                  {s.title}
                </h3>
                <p className="text-ink-muted mt-2 text-[13px] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-bg-subtle py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">
            La parole aux livreurs
          </p>
          <h2 className="font-display text-ink mt-2 max-w-3xl text-[32px] font-extrabold tracking-tight sm:text-[48px]">
            Ils roulent
            <span className="text-accent"> pour FoxEats</span>.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name}
                className="border-border bg-bg-elevated shadow-xs relative rounded-3xl border p-7"
              >
                <Quote
                  size={32}
                  strokeWidth={2}
                  className="text-accent/15 absolute right-5 top-5"
                />
                <div className="text-brand flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-ink mt-4 text-[15px] leading-relaxed">“{t.quote}”</p>
                <footer className="border-border mt-6 border-t pt-4">
                  <p className="font-display text-ink text-[14px] font-bold tracking-tight">
                    {t.name}
                  </p>
                  <p className="text-ink-muted text-[12px]">{t.role}</p>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="postuler" className="bg-bg py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">
              Candidature
            </p>
            <h2 className="font-display text-ink mt-2 text-[32px] font-extrabold tracking-tight sm:text-[44px]">
              Prêt à rejoindre
              <br />
              la <span className="text-accent">meute</span> ?
            </h2>
            <p className="text-ink-muted mt-4 max-w-md text-[15px] leading-relaxed">
              5 minutes pour postuler, 24 h pour la validation, et vous roulez. On vous accompagne
              sur l&apos;ouverture du statut auto-entrepreneur si besoin.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Pourboires 100 % à vous, garanti par contrat.',
                'Paiement chaque lundi, jamais en retard.',
                'Support FR humain quand vous êtes en course.',
              ].map((it) => (
                <p key={it} className="text-ink flex items-center gap-3 text-[14px]">
                  <span className="bg-accent grid h-7 w-7 place-items-center rounded-full text-white">
                    <Check size={14} strokeWidth={2.8} />
                  </span>
                  {it}
                </p>
              ))}
            </div>
          </div>
          <CourierForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bg-subtle py-24">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">FAQ</p>
          <h2 className="font-display text-ink mt-2 text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            Les questions qu&apos;on nous pose.
          </h2>
          <div className="mt-10 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="border-border bg-bg-elevated shadow-xs open:shadow-food group rounded-2xl border p-5"
              >
                <summary className="font-display text-ink flex cursor-pointer items-center justify-between gap-3 text-[16px] font-bold tracking-tight marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="bg-bg-subtle text-ink group-open:bg-accent grid h-8 w-8 place-items-center rounded-full transition group-open:rotate-45 group-open:text-white">
                    +
                  </span>
                </summary>
                <p className="text-ink-muted mt-3 text-[14px] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-ink text-[13px] font-semibold">{label}</span>
        <span className="font-display text-accent text-[15px] font-extrabold tracking-tight">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-accent w-full"
      />
    </label>
  );
}

function CourierForm() {
  return (
    <form
      method="POST"
      action="mailto:livreurs@foxeats.fr"
      encType="text/plain"
      className="border-border bg-bg-elevated shadow-food rounded-3xl border p-7"
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" name="firstName" required />
          <Field label="Nom" name="lastName" required />
        </div>
        <Field label="Email" name="email" type="email" required />
        <Field label="Téléphone" name="phone" type="tel" required />
        <label className="block">
          <span className="text-ink mb-1.5 block text-[12px] font-semibold">Véhicule</span>
          <select
            name="vehicle"
            className="border-border bg-bg text-ink focus:border-accent focus:ring-accent/15 h-11 w-full rounded-xl border px-3 text-[14px] outline-none focus:ring-4"
          >
            <option value="bike">Vélo</option>
            <option value="ebike">Vélo électrique</option>
            <option value="scooter">Trottinette électrique</option>
            <option value="motorbike">Moto / Scooter</option>
            <option value="car">Voiture</option>
            <option value="walk">À pied</option>
          </select>
        </label>
        <Field label="Ville principale" name="city" required placeholder="Nice, Cannes…" />
        <Field
          label="Disponibilité (jours / heures)"
          name="availability"
          placeholder="Ex : Lun-Ven soir, week-end midi"
        />
      </div>
      <button
        type="submit"
        className="bg-accent shadow-food hover:bg-accent-hover mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-white transition"
      >
        Envoyer ma candidature
        <ArrowRight size={16} strokeWidth={2.6} />
      </button>
      <p className="text-ink-subtle mt-3 text-center text-[11px]">
        Validation en moins de 24 h. Pas de bullshit, pas de spam.
      </p>
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
      <span className="text-ink mb-1.5 block text-[12px] font-semibold">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="border-border bg-bg text-ink placeholder:text-ink-subtle focus:border-accent focus:ring-accent/15 h-11 w-full rounded-xl border px-3 text-[14px] outline-none focus:ring-4"
      />
    </label>
  );
}

function DriverAppMockup() {
  return (
    <div className="relative mx-auto h-[600px] w-[290px]">
      <div className="absolute -inset-4 -z-10 rounded-[44px] bg-white/10 blur-2xl" />
      <div className="absolute inset-0 rounded-[44px] bg-[#0a0a0f] p-2.5 shadow-2xl">
        <div className="bg-bg-elevated relative h-full w-full overflow-hidden rounded-[36px]">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0a0a0f]" />
          <div className="text-ink flex h-full flex-col">
            <div className="flex items-center justify-between px-5 pb-2 pt-10 text-[10px] font-semibold">
              <span>9:41</span>
              <span>●●● ●</span>
            </div>
            <div className="flex items-center justify-between px-5 pt-2">
              <div>
                <p className="text-ink-subtle text-[8px] font-semibold uppercase tracking-wider">
                  Aujourd&apos;hui
                </p>
                <p className="font-display text-ink text-[13px] font-extrabold">Mehdi A.</p>
              </div>
              <span className="bg-success-soft text-success rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                ● En ligne
              </span>
            </div>

            <div className="from-accent to-brand mx-5 mt-3 rounded-2xl bg-gradient-to-br p-3 text-white">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-white/80">
                Gains aujourd&apos;hui
              </p>
              <p className="font-display mt-0.5 text-[26px] font-extrabold leading-none tracking-tight">
                87,40 €
              </p>
              <div className="mt-2 flex gap-3 text-[8px]">
                <span>12 courses</span>
                <span className="text-white/70">·</span>
                <span>3,2 h</span>
                <span className="text-white/70">·</span>
                <span>+9 € tips</span>
              </div>
            </div>

            <p className="text-ink-subtle mt-3 px-5 text-[9px] font-semibold uppercase tracking-wider">
              Nouvelle course
            </p>
            <div className="border-border bg-bg-subtle mx-5 mt-1 rounded-2xl border p-3">
              <div className="flex items-center justify-between">
                <p className="font-display text-ink text-[12px] font-extrabold">
                  Trattoria del Sole
                </p>
                <span className="bg-brand rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white">
                  +6,40 €
                </span>
              </div>
              <p className="text-ink-muted mt-1 text-[9px]">→ Promenade des Anglais, Nice</p>
              <div className="mt-2 flex items-center gap-1.5 text-[9px]">
                <span className="bg-bg-elevated text-ink-muted rounded-full px-1.5 py-0.5 font-semibold">
                  2,1 km
                </span>
                <span className="bg-bg-elevated text-ink-muted rounded-full px-1.5 py-0.5 font-semibold">
                  ~ 8 min
                </span>
                <span className="bg-warning-soft text-warning rounded-full px-1.5 py-0.5 font-bold">
                  + boost ×1,3
                </span>
              </div>
              <div className="mt-2 flex gap-1.5">
                <button className="border-border bg-bg-elevated text-ink flex-1 rounded-lg border py-1.5 text-[10px] font-bold">
                  Refuser
                </button>
                <button className="bg-ink text-ink-inverse flex-[2] rounded-lg py-1.5 text-[10px] font-bold">
                  Accepter
                </button>
              </div>
            </div>

            <p className="text-ink-subtle mt-4 px-5 text-[9px] font-semibold uppercase tracking-wider">
              Cette semaine
            </p>
            <div className="mx-5 mt-1 flex items-end gap-1.5">
              {[40, 55, 30, 75, 90, 65, 50].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                  <div
                    className="bg-accent w-full rounded-t"
                    style={{ height: `${(h / 100) * 50}px` }}
                  />
                  <span className="text-ink-subtle text-[7px]">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
