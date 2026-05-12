import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  Wallet,
  LayoutDashboard,
  LineChart,
  Bell,
  Truck,
  Star,
  Quote,
} from 'lucide-react';
import { photo } from '@/lib/photos';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export const metadata: Metadata = {
  title: 'Devenir restaurant partenaire — FoxEats',
  description:
    "Rejoignez FoxEats, la marketplace de livraison de la Côte d'Azur. 0 € à l'inscription, commission de 15 %, reversements hebdomadaires.",
};

const STATS = [
  { kpi: '+38%', label: 'de CA additionnel\nla 1ʳᵉ année' },
  { kpi: '15%', label: 'de commission\nsur livraison' },
  { kpi: '7 j.', label: 'reversements\nhebdo' },
  { kpi: '8 villes', label: "Côte d'Azur\ncouvertes" },
];

const BENEFITS = [
  {
    icon: Wallet,
    title: "0 € à l'inscription",
    text: 'Aucun frais fixe ni abonnement. Vous payez uniquement quand vous vendez. Aucun risque, aucun engagement.',
  },
  {
    icon: LayoutDashboard,
    title: 'KDS pro inclus',
    text: 'Dashboard temps réel avec écran cuisine, gestion menu, options, stock. Accessible sur tablette, mobile ou desktop.',
  },
  {
    icon: LineChart,
    title: 'Stats granulaires',
    text: 'CA, ticket moyen, plats stars, créneaux pic, conversion. Exports CSV, comparaison périodes, alertes.',
  },
  {
    icon: Bell,
    title: 'Notifications instantanées',
    text: 'Nouvelle commande, livreur en route, dispute client. Push web + email. Aucune commande oubliée.',
  },
  {
    icon: Truck,
    title: 'Livraison gérée pour vous',
    text: "Notre flotte de livreurs s'occupe de tout. Vous préparez, on livre. Tracking partagé avec votre cuisine.",
  },
  {
    icon: Sparkles,
    title: 'Photos IA & traductions',
    text: 'Photo manquante ? FoxEats la génère. Traductions FR / EN / IT automatiques pour la clientèle touristique.',
  },
];

const STEPS = [
  { n: '01', title: 'Postulez', text: 'Remplissez le formulaire. Notre équipe valide sous 48 h.' },
  { n: '02', title: 'KYC Stripe', text: "Vérification d'identité en 10 min via Stripe Connect." },
  {
    n: '03',
    title: 'Menu en ligne',
    text: 'Importez votre carte. Photos auto-générées si besoin.',
  },
  { n: '04', title: 'Vendez', text: 'Vos premières commandes arrivent le jour même.' },
];

const COMPARE = [
  { feature: 'Commission sur livraison', us: '15 %', them: '30 %' },
  { feature: "Frais d'inscription", us: '0 €', them: 'Variable' },
  { feature: 'Reversement', us: 'Hebdo (lundi)', them: 'Bi-mensuel' },
  { feature: 'KDS pro inclus', us: true, them: false },
  { feature: 'Photos IA', us: true, them: false },
  { feature: 'Traductions FR/EN/IT', us: true, them: false },
  { feature: 'Anti-gaspi natif', us: true, them: false },
  { feature: 'Support FR humain', us: '< 2 h', them: 'Chatbot' },
];

const TESTIMONIALS = [
  {
    quote:
      "En 3 mois, +42 % de CA. Le KDS est tellement clair que mes commis l'utilisent sans formation. Et le support FR, ça change tout.",
    name: 'Élodie Marchetti',
    role: 'Trattoria del Sole — Nice',
    rating: 5,
  },
  {
    quote:
      "J'avais peur des plateformes après mauvaise expérience ailleurs. FoxEats joue le jeu : commission claire, paiements à l'heure, vraie écoute.",
    name: 'Karim Boudjellal',
    role: 'Le Petit Pavé — Cannes',
    rating: 5,
  },
  {
    quote:
      "Les traductions auto vers l'anglais et l'italien nous ont ouvert la clientèle touristique. +25 % de tickets internationaux.",
    name: 'Sophie Renault',
    role: 'Maison Bleu — Antibes',
    rating: 5,
  },
];

const FAQ = [
  {
    q: "Combien coûte l'inscription ?",
    a: "L'inscription est 100 % gratuite. Vous payez uniquement une commission de 15 % sur les commandes livrées — rien sur le retrait en boutique, rien à vide.",
  },
  {
    q: 'Combien de temps pour démarrer ?',
    a: "Environ 10 minutes pour l'inscription Stripe Connect (KYC) + le temps de préparer votre menu. Vos premières commandes peuvent arriver le jour même.",
  },
  {
    q: 'Quand suis-je payé ?',
    a: 'Reversements automatiques chaque lundi via Stripe Connect, directement sur votre compte bancaire. Détail des commandes téléchargeable en PDF.',
  },
  {
    q: 'Qui gère la livraison ?',
    a: "FoxEats gère le réseau de livreurs indépendants. Vous préparez la commande, on s'occupe de tout : ramassage, livraison, suivi client, support.",
  },
  {
    q: 'Que se passe-t-il en cas de litige client ?',
    a: "Notre équipe litiges intervient sous 2 h en heures ouvrées. Si le tort revient à FoxEats ou au livreur, vous n'êtes jamais facturé.",
  },
  {
    q: 'Puis-je quitter à tout moment ?',
    a: 'Aucun engagement. Vous suspendez ou supprimez votre compte depuis le dashboard, en 2 clics. Les commandes en cours sont honorées.',
  },
];

export default function PartnersPage() {
  return (
    <main className="bg-bg text-ink">
      {/* HERO */}
      <section className="noise relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo('hero-merchant')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="from-brand/95 to-accent/95 absolute inset-0 bg-gradient-to-br via-[#E84838]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />

        <div className="relative">
          <SiteHeader variant="transparent" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 text-white md:grid-cols-[1.15fr_1fr] md:pb-32 md:pt-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-widest ring-1 ring-white/20 backdrop-blur-md">
              <Sparkles size={12} strokeWidth={2.4} />
              Restaurateurs
            </span>
            <h1 className="font-display mt-5 max-w-3xl text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-[64px] md:text-[80px]">
              Servez toute la Riviera
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                depuis votre cuisine.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/90">
              0 € à l&apos;inscription. 15 % de commission seulement. Paiements hebdo. Dashboard
              pro. Anti-gaspi inclus. Vous gardez la main, on amène les clients.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#postuler"
                className="bg-bg-elevated text-ink inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-semibold shadow-xl hover:bg-white/95"
              >
                Postuler en 2 minutes
                <ArrowRight size={14} strokeWidth={2.6} />
              </a>
              <a
                href="#avantages"
                className="inline-flex h-12 items-center rounded-2xl border border-white/30 bg-white/10 px-6 text-[14px] font-semibold text-white backdrop-blur-md hover:bg-white/20"
              >
                Voir les avantages
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

          {/* Dashboard mockup */}
          <DashboardMockup />
        </div>
      </section>

      {/* BENEFITS */}
      <section id="avantages" className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Pourquoi FoxEats
          </p>
          <h2 className="font-display text-ink mt-2 max-w-3xl text-[32px] font-extrabold tracking-tight sm:text-[48px]">
            Une plateforme bâtie pour
            <span className="text-brand"> les pros</span>, pas pour vous saigner.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="border-border bg-bg-elevated shadow-xs hover:shadow-food group rounded-3xl border p-7 transition hover:-translate-y-1"
                >
                  <span className="bg-brand-soft text-brand group-hover:bg-brand grid h-12 w-12 place-items-center rounded-2xl transition group-hover:text-white">
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

      {/* HOW IT WORKS */}
      <section className="bg-bg-subtle relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
                Démarrage
              </p>
              <h2 className="font-display text-ink mt-2 text-[32px] font-extrabold tracking-tight sm:text-[48px]">
                De la candidature
                <br />à la 1ʳᵉ commande,
                <br />
                <span className="text-brand">le jour même.</span>
              </h2>
              <p className="text-ink-muted mt-4 max-w-md text-[15px] leading-relaxed">
                Aucun commercial qui vous force la main, aucun appel inutile. Tout est en ligne,
                clair, instantané.
              </p>
            </div>
            <ol className="space-y-3">
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  className="border-border bg-bg-elevated shadow-xs flex items-start gap-5 rounded-2xl border p-5"
                >
                  <span
                    className={`font-display grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[18px] font-extrabold ${
                      i === 0 ? 'bg-brand text-white' : 'bg-bg-subtle text-ink'
                    }`}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-ink text-[17px] font-bold tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-ink-muted mt-1 text-[13px] leading-relaxed">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-brand text-center text-[12px] font-semibold uppercase tracking-widest">
            Comparons
          </p>
          <h2 className="font-display text-ink mx-auto mt-2 max-w-2xl text-center text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            FoxEats vs les <span className="text-brand">géants</span>.
          </h2>
          <div className="border-border bg-bg-elevated shadow-food mt-12 overflow-hidden rounded-3xl border">
            <div className="border-border bg-bg-subtle grid grid-cols-[1.5fr_1fr_1fr] border-b">
              <div className="text-ink-subtle px-6 py-5 text-[11px] font-semibold uppercase tracking-widest">
                Critère
              </div>
              <div className="border-border bg-brand font-display border-l px-6 py-5 text-center text-[15px] font-extrabold tracking-tight text-white">
                FoxEats
              </div>
              <div className="border-border font-display text-ink-muted border-l px-6 py-5 text-center text-[14px] font-bold tracking-tight">
                Plateformes US
              </div>
            </div>
            {COMPARE.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1.5fr_1fr_1fr] ${
                  i < COMPARE.length - 1 ? 'border-border border-b' : ''
                }`}
              >
                <div className="text-ink px-6 py-4 text-[14px] font-medium">{row.feature}</div>
                <div className="border-border bg-brand/5 text-brand flex items-center justify-center border-l px-6 py-4 text-[14px] font-bold">
                  {typeof row.us === 'boolean' ? (
                    row.us ? (
                      <Check size={20} strokeWidth={2.6} />
                    ) : (
                      <X size={20} strokeWidth={2.4} />
                    )
                  ) : (
                    row.us
                  )}
                </div>
                <div className="border-border text-ink-muted flex items-center justify-center border-l px-6 py-4 text-[14px]">
                  {typeof row.them === 'boolean' ? (
                    row.them ? (
                      <Check size={18} strokeWidth={2.4} className="text-ink-subtle" />
                    ) : (
                      <X size={18} strokeWidth={2.4} className="text-ink-subtle" />
                    )
                  ) : (
                    row.them
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-bg-subtle py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Ils ont franchi le pas
          </p>
          <h2 className="font-display text-ink mt-2 max-w-3xl text-[32px] font-extrabold tracking-tight sm:text-[48px]">
            Des restaurateurs qui
            <span className="text-brand"> gagnent vraiment</span>.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name}
                className="border-border bg-bg-elevated shadow-xs relative rounded-3xl border p-7"
              >
                <Quote size={32} strokeWidth={2} className="text-brand/15 absolute right-5 top-5" />
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
            <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
              Candidature
            </p>
            <h2 className="font-display text-ink mt-2 text-[32px] font-extrabold tracking-tight sm:text-[44px]">
              Prêt à servir
              <br />
              la <span className="text-brand">Riviera</span> ?
            </h2>
            <p className="text-ink-muted mt-4 max-w-md text-[15px] leading-relaxed">
              Remplissez ce formulaire. Notre équipe partenaires vous recontacte sous 48 h, en
              français, sans bullshit.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Pas de frais cachés. Jamais.',
                'Aucun engagement, suspension en 2 clics.',
                'Support FR humain en moins de 2 h.',
              ].map((it) => (
                <p key={it} className="text-ink flex items-center gap-3 text-[14px]">
                  <span className="bg-brand grid h-7 w-7 place-items-center rounded-full text-white">
                    <Check size={14} strokeWidth={2.8} />
                  </span>
                  {it}
                </p>
              ))}
            </div>
          </div>
          <PartnerForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bg-subtle py-24">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">FAQ</p>
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
                  <span className="bg-bg-subtle text-ink group-open:bg-brand grid h-8 w-8 place-items-center rounded-full transition group-open:rotate-45 group-open:text-white">
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

function PartnerForm() {
  return (
    <form
      method="POST"
      action="mailto:partenaires@foxeats.fr"
      encType="text/plain"
      className="border-border bg-bg-elevated shadow-food rounded-3xl border p-7"
    >
      <div className="grid grid-cols-1 gap-4">
        <Field label="Nom du restaurant" name="restaurant" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ville" name="city" required placeholder="Nice, Cannes…" />
          <Field label="Type de cuisine" name="cuisine" placeholder="Niçoise, italienne…" />
        </div>
        <Field label="Nom du contact" name="contact" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" name="email" type="email" required />
          <Field label="Téléphone" name="phone" type="tel" />
        </div>
        <Field label="Site web (optionnel)" name="website" type="url" />
        <label className="block">
          <span className="text-ink mb-1.5 block text-[12px] font-semibold">
            Quelques mots sur votre établissement
          </span>
          <textarea
            name="message"
            rows={4}
            className="border-border bg-bg text-ink focus:border-brand focus:ring-brand/15 w-full rounded-xl border px-3 py-2 text-[14px] outline-none focus:ring-4"
          />
        </label>
      </div>
      <button
        type="submit"
        className="bg-brand shadow-food hover:bg-brand-hover mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-white transition"
      >
        Envoyer ma candidature
        <ArrowRight size={16} strokeWidth={2.6} />
      </button>
      <p className="text-ink-subtle mt-3 text-center text-[11px]">
        Réponse sous 48 h ouvrées. Vos données ne sont jamais revendues.
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
        {required && <span className="text-brand ml-0.5">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="border-border bg-bg text-ink placeholder:text-ink-subtle focus:border-brand focus:ring-brand/15 h-11 w-full rounded-xl border px-3 text-[14px] outline-none focus:ring-4"
      />
    </label>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[36px] bg-white/10 blur-2xl" />
      <div className="bg-bg-elevated relative overflow-hidden rounded-[28px] border border-white/15 shadow-2xl">
        {/* Top chrome */}
        <div className="border-border bg-bg-subtle flex items-center gap-2 border-b px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <span className="text-ink-muted ml-3 truncate text-[11px] font-medium">
            merchant.foxeats.fr
          </span>
        </div>
        <div className="text-ink grid grid-cols-[120px_1fr]">
          {/* Sidebar */}
          <aside className="border-border bg-bg-subtle border-r p-3">
            <p className="font-display text-brand text-[12px] font-extrabold tracking-tight">
              Trattoria
            </p>
            <ul className="mt-4 space-y-1 text-[10px] font-medium">
              <li className="bg-ink text-ink-inverse rounded-md px-2 py-1.5">Commandes</li>
              <li className="text-ink-muted rounded-md px-2 py-1.5">Menu</li>
              <li className="text-ink-muted rounded-md px-2 py-1.5">Stats</li>
              <li className="text-ink-muted rounded-md px-2 py-1.5">Promos</li>
              <li className="text-ink-muted rounded-md px-2 py-1.5">Réglages</li>
            </ul>
          </aside>
          {/* Main */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-[13px] font-extrabold tracking-tight">
                Aujourd&apos;hui
              </p>
              <span className="bg-success-soft text-success rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                Live
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <KPI label="CA" value="824 €" tone="brand" />
              <KPI label="Cmd." value="37" tone="accent" />
              <KPI label="Ticket" value="22,3" tone="ink" />
            </div>
            <p className="text-ink-subtle mt-4 text-[10px] font-semibold uppercase tracking-wider">
              Commandes
            </p>
            <div className="mt-2 space-y-2">
              {[
                { id: '#1247', name: 'Pizza Margherita ×2', time: '12:42', state: 'En cuisine' },
                { id: '#1246', name: 'Spaghetti Carbo', time: '12:38', state: 'Prête' },
                { id: '#1245', name: 'Salade niçoise', time: '12:31', state: 'En route' },
              ].map((o) => (
                <div
                  key={o.id}
                  className="border-border bg-bg flex items-center justify-between rounded-lg border px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="text-ink truncate text-[10px] font-bold">{o.name}</p>
                    <p className="text-ink-subtle text-[8px]">
                      {o.id} · {o.time}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      o.state === 'En cuisine'
                        ? 'bg-warning-soft text-warning'
                        : o.state === 'Prête'
                          ? 'bg-success-soft text-success'
                          : 'bg-accent-soft text-accent'
                    }`}
                  >
                    {o.state}
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

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'accent' | 'ink';
}) {
  const cls =
    tone === 'brand'
      ? 'bg-brand-soft text-brand'
      : tone === 'accent'
        ? 'bg-accent-soft text-accent'
        : 'bg-bg-subtle text-ink';
  return (
    <div className={`rounded-lg p-2 ${cls}`}>
      <p className="font-display text-[14px] font-extrabold leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}
