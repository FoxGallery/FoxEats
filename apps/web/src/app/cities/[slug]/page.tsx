import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { photo } from '@/lib/photos';

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

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-white">
          <Link href="/" className="font-display text-2xl font-extrabold tracking-tight">
            FoxEats
          </Link>
          <Link
            href="/app"
            className="text-ink rounded-full bg-white px-4 py-2 text-[13px] font-semibold shadow-md"
          >
            Commander
          </Link>
        </header>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-10 text-white md:pb-32">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium ring-1 ring-white/20 backdrop-blur-md">
            <MapPin size={12} strokeWidth={2.4} />
            Côte d&apos;Azur · {city.postal}
          </span>
          <h1 className="font-display mt-4 text-[44px] font-extrabold leading-[1.04] tracking-tight sm:text-[64px] md:text-[80px]">
            Livraison à {city.name}
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/90 md:text-[18px]">
            {city.description}
          </p>
          <Link
            href="/app"
            className="text-ink mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-[14px] font-semibold shadow-xl hover:bg-white/95"
          >
            Voir les restos à {city.name}
            <ArrowRight size={14} strokeWidth={2.6} />
          </Link>
        </div>
      </section>

      <section className="bg-bg py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Le goût local
          </p>
          <h2 className="font-display text-ink mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
            Spécialités à {city.name}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {city.specialties.map((s) => (
              <span
                key={s}
                className="border-border bg-bg-elevated text-ink inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium"
              >
                <Check size={12} strokeWidth={2.6} className="text-brand" />
                {s}
              </span>
            ))}
          </div>

          <h2 className="font-display text-ink mt-16 text-[28px] font-bold tracking-tight sm:text-[40px]">
            Comment ça marche à {city.name}
          </h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((t, i) => (
              <li key={i} className="border-border bg-bg-elevated shadow-xs rounded-3xl border p-6">
                <span className="bg-brand grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-ink mt-4 text-[14px] leading-relaxed">{t}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
