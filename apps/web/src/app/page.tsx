import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Check,
  Star,
  Clock,
  Truck,
  Sparkles,
  MapPin,
  Quote,
  Salad,
  Bike,
  Globe2,
  Leaf,
  Pizza,
  Fish,
  UtensilsCrossed,
  Beef,
  Apple,
  Cake,
  Soup,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { photo } from '@/lib/photos';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { HeroBlock } from '@/components/marketing/hero-block';

export const metadata: Metadata = {
  title: "FoxEats — Livraison de repas Côte d'Azur",
  description:
    'Commandez chez les meilleurs restaurants de Nice, Cannes, Antibes, Monaco, Menton et Saint-Tropez. Spécialités locales, livraison en moins de 35 minutes.',
  openGraph: {
    title: 'FoxEats — La table de la Riviera, à votre porte',
    description:
      "La livraison de repas premium de la Côte d'Azur. Spécialités locales, restaurateurs sélectionnés, livreurs équitablement rémunérés.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'FoxEats',
  },
};

const CITIES = [
  { slug: 'nice', name: 'Nice', count: 8, photo: photo('city-nice') },
  { slug: 'cannes', name: 'Cannes', count: 5, photo: photo('city-cannes') },
  { slug: 'antibes', name: 'Antibes', count: 4, photo: photo('city-antibes') },
  { slug: 'monaco', name: 'Monaco', count: 3, photo: photo('city-monaco') },
  { slug: 'menton', name: 'Menton', count: 3, photo: photo('city-menton') },
  { slug: 'saint-tropez', name: 'Saint-Tropez', count: 3, photo: photo('city-saint-tropez') },
  { slug: 'cagnes-sur-mer', name: 'Cagnes-sur-Mer', count: 2, photo: photo('city-cagnes') },
  { slug: 'grasse', name: 'Grasse', count: 2, photo: photo('city-grasse') },
];

const STEPS = [
  {
    n: '01',
    icon: MapPin,
    title: 'Choisissez',
    text: 'Trouvez votre restaurant favori parmi 30+ adresses curatées sur la Riviera.',
  },
  {
    n: '02',
    icon: Sparkles,
    title: 'Composez',
    text: 'Personnalisez chaque plat, ajoutez le pourboire livreur, validez en 2 tapes.',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Profitez',
    text: 'Suivi en temps réel. Moyenne 28 min, livraison soignée, paiement sécurisé.',
  },
];

const CUISINES: { id: string; label: string; photo: string; icon: LucideIcon }[] = [
  { id: 'pizza', label: 'Pizza', photo: photo('dish-pizza-2'), icon: Pizza },
  { id: 'sushi', label: 'Sushi', photo: photo('dish-sushi-2'), icon: Fish },
  { id: 'pasta', label: 'Pâtes', photo: photo('dish-pasta-1'), icon: UtensilsCrossed },
  { id: 'burger', label: 'Burger', photo: photo('dish-burger-1'), icon: Beef },
  { id: 'nicoise', label: 'Niçois', photo: photo('dish-niçoise'), icon: Salad },
  { id: 'healthy', label: 'Healthy', photo: photo('dish-bowl-1'), icon: Apple },
  { id: 'ramen', label: 'Ramen', photo: photo('dish-ramen'), icon: Soup },
  { id: 'dessert', label: 'Dessert', photo: photo('dish-dessert-2'), icon: Cake },
];

const TESTIMONIALS = [
  {
    quote:
      "Le suivi en temps réel, la qualité des plats, l'app fluide… On a tellement adopté FoxEats qu'on a désinstallé les autres.",
    name: 'Camille L.',
    role: 'Cliente depuis 8 mois',
    city: 'Nice',
    rating: 5,
  },
  {
    quote:
      "FoxPass + anti-gaspi, c'est devenu notre combo soirée préférée. Et zéro commission cachée au check-out.",
    name: 'Romain T.',
    role: 'Étudiant',
    city: 'Antibes',
    rating: 5,
  },
  {
    quote:
      "Je commande pour mes équipes 3× par semaine. Pas une commande ratée en 4 mois. Le support FR sous 2 min, c'est précieux.",
    name: 'Émilie C.',
    role: 'Office manager',
    city: 'Monaco',
    rating: 5,
  },
];

const TRUST = [
  { label: '30+', sub: 'restaurants curatés' },
  { label: '8', sub: "villes Côte d'Azur" },
  { label: '28 min', sub: 'livraison moyenne' },
  { label: '4,8 ★', sub: 'note moyenne' },
  { label: '100 %', sub: 'pourboires reversés' },
];

const FEATURES: { icon: LucideIcon; title: string; text: string; photo: string }[] = [
  {
    icon: Salad,
    title: 'Spécialités locales',
    text: 'Socca, pissaladière, salade niçoise, tropézienne — la Riviera dans votre assiette.',
    photo: photo('dish-niçoise'),
  },
  {
    icon: Bike,
    title: 'Livraison rapide',
    text: "Vélos, scooters, voitures : 35 min max, toute la Côte d'Azur couverte.",
    photo: photo('hero-driver'),
  },
  {
    icon: Globe2,
    title: 'Multilingue',
    text: 'Interface FR / EN / IT — pensée pour les locaux comme les touristes.',
    photo: photo('hero-marketing'),
  },
  {
    icon: Leaf,
    title: 'Anti-gaspi',
    text: "Récupérez les invendus de fin de service jusqu'à -50 %. Gagnant pour tous.",
    photo: photo('dish-salad-2'),
  },
];

export default function HomePage() {
  return (
    <main className="bg-bg text-ink">
      {/* HERO */}
      <section className="noise relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo('hero-marketing')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="from-brand/95 to-accent/95 absolute inset-0 bg-gradient-to-br via-[#E84838]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(15,42,86,0.5),transparent_60%)]" />

        <div className="relative">
          <SiteHeader variant="transparent" />
        </div>

        <HeroBlock
          badge="Côte d'Azur · 30+ restaurants curatés"
          badgeIcon={Sparkles}
          titleLine1="La table de la"
          titleLine2="Riviera, livrée."
          description="Spécialités locales, restaurateurs sélectionnés, livreurs justement rémunérés. Commandez en deux tapes. Suivez en temps réel."
          ctas={[
            { label: 'Commander maintenant', href: '/app' },
            { label: 'Voir les villes', href: '/cities/nice', variant: 'secondary' },
          ]}
          stats={[
            { value: '28 min', label: 'livraison moyenne' },
            { value: '4,8 ★', label: 'note moyenne' },
            { value: '8 villes', label: 'de St-Tropez à Menton' },
          ]}
          visual={<PhoneMockup />}
        />
      </section>

      {/* CITIES */}
      <section className="bg-bg relative overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
                Tout le littoral
              </p>
              <h2 className="font-display text-ink mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
                8 villes desservies
              </h2>
              <p className="text-ink-muted mt-2 max-w-xl text-[14px]">
                De Saint-Tropez à Menton, des restaurateurs partenaires choisis pour leur qualité.
              </p>
            </div>
            <Link
              href="/cities/nice"
              className="text-brand hidden shrink-0 items-center gap-1 text-[14px] font-semibold hover:underline md:inline-flex"
            >
              Voir Nice <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/cities/${c.slug}`}
                className="bg-bg-elevated hover:shadow-food group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-md transition hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.photo}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span className="bg-bg-elevated/90 text-ink group-hover:bg-brand absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full shadow-md backdrop-blur transition group-hover:text-white">
                  <ArrowRight size={13} strokeWidth={2.6} />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-[18px] font-extrabold leading-none tracking-tight sm:text-[20px]">
                    {c.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                    <span className="bg-success inline-flex h-1.5 w-1.5 rounded-full" />
                    {c.count} restos ouverts
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CUISINES */}
      <section className="bg-bg py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
                Toutes les envies
              </p>
              <h2 className="font-display text-ink mt-2 max-w-2xl text-[28px] font-bold tracking-tight sm:text-[40px]">
                Choisissez votre cuisine.
              </h2>
            </div>
            <Link
              href="/app"
              className="text-brand hidden items-center gap-1 text-[14px] font-semibold hover:underline md:inline-flex"
            >
              Explorer le menu
              <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {CUISINES.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.id}
                  href={`/app?cuisine=${c.id}`}
                  className="bg-bg-subtle shadow-xs hover:shadow-food group relative aspect-square overflow-hidden rounded-2xl transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.photo}
                    alt={c.label}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className="bg-brand absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-white shadow-lg ring-2 ring-white/20 transition group-hover:scale-110">
                    <Icon size={15} strokeWidth={2.4} />
                  </span>
                  <span className="font-display absolute inset-x-0 bottom-0 p-3 text-[14px] font-bold tracking-tight text-white">
                    {c.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-bg relative overflow-hidden py-16">
        <span className="blob-brand left-1/2 top-1/2 h-[280px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.18]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="divide-border border-border bg-bg-elevated shadow-food grid grid-cols-2 divide-x divide-y overflow-hidden rounded-3xl border sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
            {TRUST.map((t, i) => (
              <div
                key={t.label}
                className={`hover:bg-bg-subtle group flex flex-col items-center justify-center gap-1 px-4 py-7 text-center transition ${
                  i < 2 ? 'lg:border-y-0' : ''
                }`}
              >
                <p className="font-display text-ink group-hover:text-brand text-[32px] font-extrabold leading-none tracking-tight transition sm:text-[40px]">
                  {t.label}
                </p>
                <p className="text-ink-muted text-[11px] font-semibold uppercase tracking-widest">
                  {t.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-bg relative overflow-hidden py-20">
        <span className="blob-brand right-[-100px] top-[-50px] h-[260px] w-[260px]" />
        <span className="blob-accent bottom-[-80px] left-[-120px] h-[240px] w-[240px] opacity-15" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Comment ça marche
          </p>
          <h2 className="font-display text-ink mt-2 max-w-2xl text-[28px] font-bold tracking-tight sm:text-[40px]">
            Du choix au délice, en 3 tapes.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="border-border bg-bg-elevated hover:border-brand/40 hover:shadow-food group relative overflow-hidden rounded-3xl border p-7 shadow-md transition hover:-translate-y-1"
                >
                  <span
                    className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition group-hover:opacity-30 ${
                      idx === 0 ? 'bg-brand' : idx === 1 ? 'bg-accent' : 'bg-success'
                    }`}
                  />
                  <div className="relative flex items-start justify-between">
                    <span className="bg-brand-soft text-brand ring-brand/20 group-hover:bg-brand group-hover:ring-brand grid h-12 w-12 place-items-center rounded-2xl ring-1 transition group-hover:text-white">
                      <Icon size={22} strokeWidth={2} />
                    </span>
                    <span className="font-display text-ink/10 text-[44px] font-extrabold leading-none">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="font-display text-ink relative mt-4 text-[20px] font-bold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-ink-muted mt-2 text-[14px] leading-relaxed">{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-bg relative overflow-hidden py-20">
        <span className="blob-accent bottom-[-100px] left-[-150px] h-[300px] w-[300px]" />
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Pourquoi FoxEats
          </p>
          <h2 className="font-display text-ink mt-2 max-w-2xl text-[28px] font-bold tracking-tight sm:text-[40px]">
            Pensé pour la Côte d&apos;Azur.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="border-border bg-bg-elevated hover:border-brand/40 hover:shadow-food group overflow-hidden rounded-3xl border shadow-md transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/1] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.photo}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
                    <span className="bg-brand absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg ring-2 ring-white/20">
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-ink text-[20px] font-bold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-ink-muted mt-2 text-[14px] leading-relaxed">{f.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-bg relative overflow-hidden py-20">
        <span className="blob-brand right-[10%] top-[20%] h-[260px] w-[260px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Ils ont essayé
          </p>
          <h2 className="font-display text-ink mt-2 max-w-3xl text-[28px] font-bold tracking-tight sm:text-[44px]">
            Et ils ne reviennent pas en arrière.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name}
                className="border-border bg-bg-elevated hover:border-brand/40 hover:shadow-food group relative overflow-hidden rounded-3xl border p-7 shadow-md transition hover:-translate-y-1"
              >
                <Quote
                  size={48}
                  strokeWidth={2}
                  className="text-brand/10 group-hover:text-brand/20 absolute -right-2 -top-2 transition"
                />
                <div className="text-brand relative flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-ink relative mt-4 text-[15px] leading-relaxed">“{t.quote}”</p>
                <footer className="border-border relative mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-brand-soft font-display text-brand grid h-10 w-10 place-items-center rounded-full text-[15px] font-extrabold">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-display text-ink text-[14px] font-bold tracking-tight">
                        {t.name}
                      </p>
                      <p className="text-ink-muted text-[12px]">{t.role}</p>
                    </div>
                  </div>
                  <span className="bg-bg-subtle text-ink-muted rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    {t.city}
                  </span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS / DRIVERS CTA */}
      <section className="bg-bg py-24">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-2">
          <CtaCard
            tone="brand"
            badge="Restaurateurs"
            title="Vendez plus, sans souci."
            text="0 € à l'inscription. Commission de 15 % uniquement sur commandes livrées. Tableau de bord temps réel, paiements sous 7 jours."
            cta="Devenir partenaire"
            href="/partners"
            photo={photo('hero-merchant')}
          />
          <CtaCard
            tone="accent"
            badge="Livreurs"
            title="Roulez à votre rythme."
            text="Liberté totale sur vos zones et horaires. Pourboires 100 % reversés. Paiements hebdomadaires. Statut auto-entrepreneur accompagné."
            cta="Postuler livreur"
            href="/couriers"
            photo={photo('hero-driver')}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function CtaCard({
  tone,
  badge,
  title,
  text,
  cta,
  href,
  photo,
}: {
  tone: 'brand' | 'accent';
  badge: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  photo: string;
}) {
  const cls = tone === 'brand' ? 'from-brand to-[#E04736]' : 'from-accent to-[#1E4FA8]';
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cls} shadow-food text-white`}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-overlay"
        />
      )}
      <div className="relative p-8">
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur-md">
          {badge}
        </span>
        <h3 className="font-display mt-4 text-[26px] font-bold leading-tight tracking-tight sm:text-[32px]">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/90">{text}</p>
        <Link
          href={href}
          className="text-ink bg-bg-elevated mt-7 inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-[14px] font-semibold shadow-md transition hover:bg-white/95"
        >
          {cta}
          <ArrowRight size={14} strokeWidth={2.6} />
        </Link>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[640px] w-[300px]">
      {/* Frame */}
      <div className="absolute inset-0 rounded-[48px] bg-[#0a0a0f] p-2 shadow-2xl ring-1 ring-white/10">
        <div className="bg-bg relative h-full w-full overflow-hidden rounded-[40px]">
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-[#0a0a0f]" />
          {/* App preview */}
          <div className="text-ink relative flex h-full flex-col overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pb-2 pt-10 text-[10px] font-bold">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <span>•••</span>
                <span className="ml-1 inline-block h-2.5 w-4 rounded-sm border border-current">
                  <span className="block h-full w-3/4 rounded-sm bg-current" />
                </span>
              </span>
            </div>

            {/* App header — mirror /app real */}
            <div className="flex items-center justify-between gap-2 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="bg-brand-soft text-brand grid h-8 w-8 place-items-center rounded-full">
                  <MapPin size={12} strokeWidth={2.6} />
                </span>
                <div>
                  <p className="text-ink-subtle text-[7px] font-bold uppercase tracking-widest">
                    Livrer à
                  </p>
                  <p className="font-display text-ink text-[13px] font-extrabold leading-none tracking-tight">
                    Nice
                  </p>
                </div>
              </div>
              <div className="border-border bg-bg-elevated h-7 w-7 rounded-full border" />
            </div>

            {/* Search bar */}
            <div className="border-border bg-bg-elevated text-ink-muted mx-4 mt-1 flex h-10 items-center gap-2 rounded-2xl border px-3 text-[10px]">
              <Sparkles size={11} strokeWidth={2.2} />
              Rechercher un plat, un resto…
            </div>

            {/* Chips */}
            <div className="mt-3 flex gap-1.5 overflow-hidden px-4 text-[9px]">
              <span className="bg-brand inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold text-white">
                <Sparkles size={9} strokeWidth={2.6} />
                Tout
              </span>
              <span className="border-border bg-bg-elevated text-ink inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold">
                Niçois
              </span>
              <span className="border-border bg-bg-elevated text-ink inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold">
                Italien
              </span>
              <span className="border-border bg-bg-elevated text-ink inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold">
                Pizza
              </span>
            </div>

            {/* Anti-gaspi banner */}
            <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
              <div className="from-success flex items-center gap-1.5 rounded-xl bg-gradient-to-br to-[#0E7A60] p-2 text-white">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-white/20">
                  <Leaf size={11} strokeWidth={2.6} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[9px] font-bold leading-none">Anti-gaspi</p>
                  <p className="truncate text-[7px] opacity-90">−50 %</p>
                </div>
              </div>
              <div className="from-brand to-brand-hover flex items-center gap-1.5 rounded-xl bg-gradient-to-br p-2 text-white">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-white/20">
                  <Sparkles size={11} strokeWidth={2.6} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[9px] font-bold leading-none">FoxPass</p>
                  <p className="truncate text-[7px] opacity-90">Illimité</p>
                </div>
              </div>
            </div>

            {/* Popular section heading */}
            <p className="font-display text-ink mt-3 px-4 text-[12px] font-extrabold tracking-tight">
              Les meilleurs
            </p>

            {/* Restaurant card */}
            <div className="mx-4 mt-2">
              <div className="bg-bg-subtle relative aspect-[16/10] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo('resto-italian-1')} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="bg-ink/90 text-ink-inverse absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold backdrop-blur">
                  <Star size={8} fill="currentColor" strokeWidth={0} />
                  4.8
                </span>
                <span className="bg-brand absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest text-white">
                  Spé. Riviera
                </span>
              </div>
              <p className="font-display text-ink mt-1.5 truncate text-[11px] font-bold tracking-tight">
                Trattoria del Sole
              </p>
              <p className="text-ink-muted flex items-center gap-1 text-[8px]">
                <Clock size={8} strokeWidth={2.4} />
                25–35 min · 2,50 € livraison
              </p>
            </div>

            {/* Bottom tabs — mirror /app real */}
            <div className="border-border bg-bg-elevated/95 absolute inset-x-0 bottom-0 flex h-14 items-stretch justify-around border-t px-2 pb-2 pt-1 backdrop-blur">
              {[
                { icon: ArrowRight, label: 'Accueil', active: true },
                { icon: Sparkles, label: 'Explorer', active: false },
                { icon: Clock, label: 'Cmd.', active: false },
                { icon: Star, label: 'Compte', active: false },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <Icon
                      size={14}
                      strokeWidth={t.active ? 2.6 : 2}
                      className={t.active ? 'text-ink' : 'text-ink-muted'}
                    />
                    <span
                      className={`text-[7px] font-semibold ${t.active ? 'text-ink' : 'text-ink-muted'}`}
                    >
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
