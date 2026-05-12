import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check, Star, Clock, Truck, Sparkles, MapPin, Globe } from 'lucide-react';
import { photo } from '@/lib/photos';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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

const FEATURES = [
  {
    icon: '🥗',
    title: 'Spécialités locales',
    text: 'Socca, pissaladière, salade niçoise, tropézienne — la Riviera dans votre assiette.',
    photo: photo('dish-niçoise'),
  },
  {
    icon: '🛵',
    title: 'Livraison rapide',
    text: "Vélos, scooters, voitures : 35 min max, toute la Côte d'Azur couverte.",
    photo: photo('hero-driver'),
  },
  {
    icon: '🌍',
    title: 'Multilingue',
    text: 'Interface FR / EN / IT — pensée pour les locaux comme les touristes.',
    photo: photo('hero-marketing'),
  },
  {
    icon: '♻️',
    title: 'Anti-gaspi',
    text: "Récupérez les invendus de fin de service jusqu'à -50 %. Gagnant pour tous.",
    photo: photo('dish-salad-2'),
  },
];

export default function HomePage() {
  return (
    <main className="bg-bg text-ink">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="from-brand to-accent absolute inset-0 -z-10 bg-gradient-to-br via-[#FF7A6B]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="absolute inset-0 -z-10 opacity-25 mix-blend-overlay">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo('hero-marketing')} alt="" className="h-full w-full object-cover" />
        </div>

        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-white">
          <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">
            FoxEats
          </Link>
          <nav className="hidden gap-7 text-[14px] md:flex">
            <Link href="/cities/nice" className="text-white/85 hover:text-white">
              Villes
            </Link>
            <Link href="/partners" className="text-white/85 hover:text-white">
              Partenaires
            </Link>
            <Link href="/couriers" className="text-white/85 hover:text-white">
              Livreurs
            </Link>
            <Link href="/blog" className="text-white/85 hover:text-white">
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle compact />
            </div>
            <Link
              href="/login"
              className="text-ink rounded-full bg-white px-4 py-2 text-[13px] font-semibold shadow-md transition hover:bg-white/95"
            >
              Se connecter
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-12 text-white md:grid-cols-[1.1fr_1fr] md:pt-20 lg:pb-32 lg:pt-24">
          <div className="flex flex-col items-start">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium ring-1 ring-white/20 backdrop-blur-md">
              <Sparkles size={12} strokeWidth={2.4} />
              Côte d&apos;Azur · 30+ restaurants curatés
            </span>
            <h1 className="font-display max-w-3xl text-[44px] leading-[1.02] tracking-tight sm:text-[56px] md:text-[72px] lg:text-[88px]">
              La table de la
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Riviera, livrée.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/85 md:text-[18px]">
              Spécialités locales, restaurateurs sélectionnés, livreurs justement rémunérés.
              Commandez en deux tapes. Suivez en temps réel.
            </p>

            <form
              action="/app"
              className="mt-8 flex w-full max-w-md items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl"
            >
              <span className="bg-brand-soft text-brand grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                <MapPin size={16} strokeWidth={2.4} />
              </span>
              <input
                type="text"
                name="addr"
                placeholder="Votre adresse de livraison…"
                className="text-ink placeholder:text-ink-muted min-w-0 flex-1 bg-transparent text-[14px] outline-none"
              />
              <button
                type="submit"
                className="bg-ink text-ink-inverse grid h-10 shrink-0 place-items-center rounded-xl px-4 text-[13px] font-semibold hover:opacity-90"
              >
                Commander
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-[12px] text-white/90">
              <Badge>0 € à l&apos;inscription resto</Badge>
              <Badge>FoxPass illimité</Badge>
              <Badge>Anti-gaspi inclus</Badge>
            </div>

            <div className="mt-10 flex items-center gap-5 text-white/85">
              <div>
                <p className="font-display text-2xl font-bold">28 min</p>
                <p className="text-[11px]">livraison moyenne</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="font-display text-2xl font-bold">4,8 ★</p>
                <p className="text-[11px]">note moyenne</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="font-display text-2xl font-bold">8 villes</p>
                <p className="text-[11px]">de St-Tropez à Menton</p>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 -z-10 rounded-[44px] bg-white/10 blur-2xl" />
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="bg-bg-subtle py-20">
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
                className="bg-bg-elevated shadow-xs hover:shadow-food group relative aspect-[4/5] overflow-hidden rounded-2xl transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.photo}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-[18px] font-bold tracking-tight">{c.name}</p>
                  <p className="text-[12px] text-white/80">{c.count} restos</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-bg py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Comment ça marche
          </p>
          <h2 className="font-display text-ink mt-2 max-w-2xl text-[28px] font-bold tracking-tight sm:text-[40px]">
            Du choix au délice, en 3 tapes.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="border-border bg-bg-elevated shadow-xs hover:shadow-food rounded-3xl border p-7 transition"
                >
                  <div className="flex items-start justify-between">
                    <span className="bg-brand-soft text-brand grid h-12 w-12 place-items-center rounded-2xl">
                      <Icon size={22} strokeWidth={2} />
                    </span>
                    <span className="font-display text-ink-subtle/40 text-[40px] font-extrabold leading-none">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="font-display text-ink mt-4 text-[20px] font-bold tracking-tight">
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
      <section className="bg-bg-subtle py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Pourquoi FoxEats
          </p>
          <h2 className="font-display text-ink mt-2 max-w-2xl text-[28px] font-bold tracking-tight sm:text-[40px]">
            Pensé pour la Côte d&apos;Azur.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="border-border bg-bg-elevated shadow-xs hover:shadow-food overflow-hidden rounded-3xl border transition"
              >
                <div className="relative aspect-[2/1] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.photo} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="font-display text-ink mt-3 text-[20px] font-bold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-ink-muted mt-2 text-[14px] leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS / DRIVERS CTA */}
      <section className="bg-bg py-20">
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

      {/* FOOTER */}
      <footer className="border-border bg-bg-subtle border-t py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-4">
          <div>
            <p className="font-display text-ink text-[22px] font-extrabold tracking-tight">
              FoxEats
            </p>
            <p className="text-ink-muted mt-2 text-[12px]">
              La marketplace de livraison de la Côte d&apos;Azur.
            </p>
            <div className="text-ink-muted mt-4 flex items-center gap-2 text-[12px]">
              <Globe size={14} strokeWidth={2.2} />
              FR · EN · IT
            </div>
          </div>
          <FooterCol title="Explorer">
            <FooterLink href="/cities/nice">Nice</FooterLink>
            <FooterLink href="/cities/cannes">Cannes</FooterLink>
            <FooterLink href="/cities/monaco">Monaco</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
          </FooterCol>
          <FooterCol title="Partenaires">
            <FooterLink href="/partners">Devenir restaurant</FooterLink>
            <FooterLink href="/couriers">Devenir livreur</FooterLink>
            <FooterLink href="mailto:partenaires@foxeats.fr">Nous contacter</FooterLink>
          </FooterCol>
          <FooterCol title="Légal">
            <FooterLink href="/legal/cgu">CGU</FooterLink>
            <FooterLink href="/legal/cgv">CGV</FooterLink>
            <FooterLink href="/legal/privacy">Confidentialité</FooterLink>
            <FooterLink href="/legal/mentions">Mentions légales</FooterLink>
            <FooterLink href="/legal/cookies">Cookies</FooterLink>
          </FooterCol>
        </div>
        <p className="text-ink-subtle mx-auto mt-10 max-w-7xl px-6 text-[11px]">
          © {new Date().getFullYear()} FoxEats · Côte d&apos;Azur
        </p>
      </footer>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium ring-1 ring-white/20 backdrop-blur-md">
      <Check size={12} strokeWidth={2.6} className="text-white" /> {children as any}
    </span>
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
          className="text-ink mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-[14px] font-semibold shadow-md transition hover:bg-white/95"
        >
          {cta}
          <ArrowRight size={14} strokeWidth={2.6} />
        </Link>
      </div>
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-ink-muted text-[11px] font-semibold uppercase tracking-widest">{title}</p>
      <ul className="mt-3 space-y-1.5">{children as any}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink-muted hover:text-ink text-[13px] hover:underline">
        {children as any}
      </Link>
    </li>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[600px] w-[290px]">
      {/* Frame */}
      <div className="absolute inset-0 rounded-[44px] bg-[#0a0a0f] p-2.5 shadow-2xl">
        <div className="bg-bg-elevated relative h-full w-full overflow-hidden rounded-[36px]">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0a0a0f]" />
          {/* App preview */}
          <div className="text-ink flex h-full flex-col">
            <div className="flex items-center justify-between px-5 pb-2 pt-10 text-[10px] font-semibold">
              <span>9:41</span>
              <span>●●● ●</span>
            </div>
            <div className="flex items-center gap-2 px-5 pt-2">
              <span className="bg-brand-soft text-brand grid h-7 w-7 place-items-center rounded-full">
                <MapPin size={12} strokeWidth={2.4} />
              </span>
              <div>
                <p className="text-ink-subtle text-[8px] font-semibold uppercase tracking-wider">
                  Livrer à
                </p>
                <p className="font-display text-ink text-[13px] font-bold leading-none">Nice</p>
              </div>
            </div>
            <div className="border-border bg-bg-subtle text-ink-muted mx-5 mt-3 flex h-9 items-center gap-2 rounded-xl border px-3 text-[10px]">
              <Sparkles size={11} strokeWidth={2.2} />
              Rechercher un plat…
            </div>
            <div className="mx-5 mt-3 flex gap-2 overflow-hidden text-[10px]">
              <span className="bg-ink text-ink-inverse rounded-full px-2.5 py-1 font-semibold">
                Tout
              </span>
              <span className="border-border bg-bg-elevated rounded-full border px-2.5 py-1">
                Niçois
              </span>
              <span className="border-border bg-bg-elevated rounded-full border px-2.5 py-1">
                Italien
              </span>
              <span className="border-border bg-bg-elevated rounded-full border px-2.5 py-1">
                Pizza
              </span>
            </div>
            <div className="mx-5 mt-4">
              <div className="bg-bg-subtle relative aspect-[16/10] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo('resto-italian-1')} alt="" className="h-full w-full object-cover" />
                <span className="bg-ink/90 text-ink-inverse absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold">
                  <Star size={8} fill="currentColor" strokeWidth={0} />
                  4.8
                </span>
                <span className="bg-brand absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                  Spé. Riviera
                </span>
              </div>
              <p className="font-display text-ink mt-1.5 truncate text-[12px] font-bold">
                Trattoria del Sole
              </p>
              <p className="text-ink-muted flex items-center gap-1 text-[9px]">
                <Clock size={9} strokeWidth={2.4} />
                25–35 min · 2,50 € livraison
              </p>
            </div>
            <div className="mx-5 mt-3">
              <div className="bg-bg-subtle relative aspect-[16/10] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo('resto-japanese')} alt="" className="h-full w-full object-cover" />
                <span className="bg-ink/90 text-ink-inverse absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold">
                  <Star size={8} fill="currentColor" strokeWidth={0} />
                  4.7
                </span>
              </div>
              <p className="font-display text-ink mt-1.5 truncate text-[12px] font-bold">
                Sushi Bay Cannes
              </p>
              <p className="text-ink-muted flex items-center gap-1 text-[9px]">
                <Clock size={9} strokeWidth={2.4} />
                30 min · livraison offerte
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
