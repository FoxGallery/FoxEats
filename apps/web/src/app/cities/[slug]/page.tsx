import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, MapPin, Clock, Star, Truck, Sparkles } from 'lucide-react';
import { photo } from '@/lib/photos';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

type Params = Promise<{ slug: string }>;

type CityMeta = {
  slug: string;
  name: string;
  postal: string;
  lat: number;
  lng: number;
  description: string;
  specialties: string[];
  photoSlot: string;
};

const CITIES: Record<string, CityMeta> = {
  nice: {
    slug: 'nice',
    name: 'Nice',
    postal: '06000',
    lat: 43.7102,
    lng: 7.262,
    description:
      "Capitale de la Côte d'Azur, Nice est le berceau de la cuisine niçoise : socca, pissaladière, salade niçoise, daube. FoxEats livre les meilleures adresses du Vieux-Nice, de la Promenade des Anglais et de Cimiez.",
    specialties: [
      'Socca',
      'Pissaladière',
      'Salade niçoise',
      'Pan-bagnat',
      'Daube niçoise',
      'Tourte de blettes',
    ],
    photoSlot: 'city-nice',
  },
  cannes: {
    slug: 'cannes',
    name: 'Cannes',
    postal: '06400',
    lat: 43.5528,
    lng: 7.0174,
    description:
      "La cité du cinéma vous propose ses tables iconiques sur la Croisette. De la pizza napolitaine aux sushis premium, en passant par les bistrots de la rue d'Antibes — tout est livrable.",
    specialties: ['Pizza napolitaine', 'Sushi omakase', 'Bistrot français', 'Patisserie asiatique'],
    photoSlot: 'city-cannes',
  },
  antibes: {
    slug: 'antibes',
    name: 'Antibes',
    postal: '06600',
    lat: 43.5808,
    lng: 7.1239,
    description:
      "Entre vieille ville et Port Vauban, Antibes mêle bouillabaisse, tapas méditerranéennes et cuisine 100 % végétale. FoxEats couvre Juan-les-Pins et la presqu'île du Cap.",
    specialties: ['Bouillabaisse', 'Plateaux de fruits de mer', 'Tapas ibériques', 'Cuisine vegan'],
    photoSlot: 'city-antibes',
  },
  monaco: {
    slug: 'monaco',
    name: 'Monaco',
    postal: '98000',
    lat: 43.7384,
    lng: 7.4246,
    description:
      'Gastronomie raffinée à deux pas du Casino. Pâtes fraîches, plats signature, bowls premium — Monaco se déguste depuis votre balcon de Monte-Carlo, Fontvieille ou la Condamine.',
    specialties: ['Cuisine gastronomique', 'Pâtes fraîches', 'Poke bowls', 'Barbajuans'],
    photoSlot: 'city-monaco',
  },
  menton: {
    slug: 'menton',
    name: 'Menton',
    postal: '06500',
    lat: 43.7765,
    lng: 7.5036,
    description:
      "La perle de la France met à l'honneur le citron AOC, la pichade et la tarte au citron. FoxEats livre dans le centre-ville historique et au Carei.",
    specialties: ['Tarte au citron de Menton', 'Pichade', 'Barbajuans', 'Anti-gaspi'],
    photoSlot: 'city-menton',
  },
  'saint-tropez': {
    slug: 'saint-tropez',
    name: 'Saint-Tropez',
    postal: '83990',
    lat: 43.2727,
    lng: 6.6407,
    description:
      'Tarte tropézienne, viennoiseries au levain, beach food méditerranéenne : Saint-Tropez se commande aussi depuis Pampelonne et le village.',
    specialties: ['Tarte tropézienne', 'Aïoli traditionnel', 'Beach food', 'Pâtisserie au levain'],
    photoSlot: 'city-saint-tropez',
  },
  'cagnes-sur-mer': {
    slug: 'cagnes-sur-mer',
    name: 'Cagnes-sur-Mer',
    postal: '06800',
    lat: 43.6634,
    lng: 7.1488,
    description:
      'Du Haut-de-Cagnes au Cros, FoxEats sert la cuisine provençale traditionnelle et les sushis de quartier à des prix accessibles.',
    specialties: ['Petits farcis', 'Daube niçoise', 'Sushi'],
    photoSlot: 'city-cagnes',
  },
  grasse: {
    slug: 'grasse',
    name: 'Grasse',
    postal: '06130',
    lat: 43.6584,
    lng: 6.9237,
    description:
      "La capitale mondiale du parfum vous propose sa cuisine d'herbes aromatiques, ses tartes salées au chèvre et ses bowls 100 % végétaux.",
    specialties: ['Cuisine aux herbes', 'Tarte aux blettes', 'Cuisine vegan'],
    photoSlot: 'city-grasse',
  },
};

const STEPS = [
  'Indiquez votre adresse pour voir les restaurants disponibles.',
  'Choisissez vos plats et payez en ligne (Apple Pay, Google Pay, CB).',
  "Suivez en temps réel votre livreur jusqu'à votre porte.",
];

export async function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) return {};
  return {
    title: `Livraison ${city.name} — Restaurants & spécialités locales`,
    description: city.description,
    openGraph: {
      title: `FoxEats ${city.name}`,
      description: city.description,
    },
    alternates: { canonical: `/cities/${city.slug}` },
  };
}

export default async function CityPage({ params }: { params: Params }) {
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) notFound();
  const cover = photo(city.photoSlot);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `FoxEats ${city.name}`,
    description: city.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      postalCode: city.postal,
      addressCountry: 'FR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
    areaServed: { '@type': 'City', name: city.name },
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app'}/cities/${city.slug}`,
  };

  return (
    <main className="bg-bg text-ink">
      <section className="relative overflow-hidden">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={city.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="from-brand/85 via-brand/65 to-accent/85 absolute inset-0 bg-gradient-to-br" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />

        <SiteHeader variant="transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-24 pt-12 text-white md:grid-cols-[1.2fr_1fr] md:pb-32">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-widest ring-1 ring-white/20 backdrop-blur-md">
              <MapPin size={12} strokeWidth={2.4} />
              Côte d&apos;Azur · {city.postal}
            </span>
            <h1 className="font-display mt-4 text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-[64px] md:text-[80px]">
              Livraison à
              <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {city.name}.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/90 md:text-[18px]">
              {city.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="bg-bg-elevated text-ink inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-[14px] font-semibold shadow-xl hover:bg-white/95"
              >
                Voir les restos à {city.name}
                <ArrowRight size={14} strokeWidth={2.6} />
              </Link>
              <Link
                href="#specialites"
                className="inline-flex h-12 items-center rounded-2xl border border-white/30 bg-white/10 px-5 text-[14px] font-semibold text-white backdrop-blur-md hover:bg-white/20"
              >
                Les spécialités
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 text-white/90">
              <CityKpi icon={<Clock size={14} strokeWidth={2.4} />} top="28 min" bottom="moyenne" />
              <CityKpi
                icon={<Star size={14} fill="currentColor" strokeWidth={0} />}
                top="4,8"
                bottom={`${Math.max(3, Math.floor(city.specialties.length))} restos curatés`}
              />
              <CityKpi
                icon={<Truck size={14} strokeWidth={2.4} />}
                top="2,50 €"
                bottom="livraison moyenne"
              />
            </div>
          </div>
          <CityCard city={city} />
        </div>
      </section>

      {/* Specialties */}
      <section id="specialites" className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Le goût local
          </p>
          <h2 className="font-display text-ink mt-2 max-w-2xl text-[32px] font-extrabold tracking-tight sm:text-[48px]">
            Les <span className="text-brand">spécialités</span> de {city.name}
          </h2>
          <p className="text-ink-muted mt-3 max-w-2xl text-[15px] leading-relaxed">
            Une sélection pointue, validée avec les chefs locaux. Chaque plat raconte un bout de la
            Riviera.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {city.specialties.map((s) => (
              <div
                key={s}
                className="bg-bg-subtle shadow-xs hover:shadow-food group relative aspect-[5/6] overflow-hidden rounded-2xl transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo('dish-niçoise')}
                  alt={s}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.06] group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-display text-[14px] font-bold tracking-tight text-white">
                    {s}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-bg-subtle py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Procédure
          </p>
          <h2 className="font-display text-ink mt-2 text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            Comment ça marche à {city.name}.
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {STEPS.map((t, i) => (
              <li key={i} className="border-border bg-bg-elevated shadow-xs rounded-3xl border p-7">
                <span
                  className={`font-display grid h-12 w-12 place-items-center rounded-2xl text-[15px] font-extrabold ${
                    i === 0 ? 'bg-brand text-white' : 'bg-bg-subtle text-ink'
                  }`}
                >
                  0{i + 1}
                </span>
                <p className="text-ink mt-5 text-[14px] leading-relaxed">{t}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="bg-brand shadow-food hover:bg-brand-hover inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-semibold text-white"
            >
              Commander à {city.name}
              <ArrowRight size={14} strokeWidth={2.6} />
            </Link>
            <Link
              href="/"
              className="border-border bg-bg-elevated text-ink hover:bg-bg-subtle inline-flex h-12 items-center rounded-2xl border px-6 text-[14px] font-medium"
            >
              Toutes les villes
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}

function CityKpi({ icon, top, bottom }: { icon: React.ReactNode; top: string; bottom: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-white">
        {icon as any}
        <p className="font-display text-[22px] font-extrabold leading-none tracking-tight sm:text-[26px]">
          {top}
        </p>
      </div>
      <p className="mt-1 text-[11px] text-white/75">{bottom}</p>
    </div>
  );
}

function CityCard({ city }: { city: CityMeta }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 -z-10 rounded-[36px] bg-white/10 blur-2xl" />
      <div className="bg-bg-elevated relative overflow-hidden rounded-[28px] border border-white/15 shadow-2xl">
        <div className="bg-bg-subtle relative aspect-[5/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo(city.photoSlot)} alt={city.name} className="h-full w-full object-cover" />
          <span className="text-ink absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
            <Sparkles size={10} strokeWidth={2.6} className="text-brand" />
            {city.name}
          </span>
        </div>
        <div className="text-ink p-5">
          <p className="text-ink-subtle text-[11px] font-semibold uppercase tracking-widest">
            Spécialités à goûter
          </p>
          <ul className="mt-3 space-y-2">
            {city.specialties.slice(0, 4).map((s) => (
              <li key={s} className="flex items-center gap-2 text-[13px]">
                <span className="bg-brand-soft text-brand grid h-6 w-6 place-items-center rounded-full">
                  <Check size={11} strokeWidth={2.8} />
                </span>
                <span className="text-ink">{s}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/app"
            className="bg-ink text-ink-inverse mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold hover:opacity-90"
          >
            Voir les restos
            <ArrowRight size={13} strokeWidth={2.6} />
          </Link>
        </div>
      </div>
    </div>
  );
}
