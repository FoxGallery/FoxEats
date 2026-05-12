import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Params = Promise<{ slug: string }>;

type CityMeta = {
  slug: string;
  name: string;
  postal: string;
  lat: number;
  lng: number;
  description: string;
  specialties: string[];
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
  },
};

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
    <main>
      <section className="from-primary to-accent relative overflow-hidden bg-gradient-to-br via-[#1a4ba8] text-white">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            FoxEats
          </Link>
          <Link
            href="/app"
            className="text-primary rounded-full bg-white px-4 py-2 text-sm font-medium"
          >
            Commander
          </Link>
        </header>
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
          <p className="text-[12px] uppercase tracking-widest text-white/80">
            Livraison Côte d&apos;Azur
          </p>
          <h1 className="font-display mt-2 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Livraison à {city.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{city.description}</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-ink text-3xl font-bold tracking-tight">
            Spécialités à {city.name}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {city.specialties.map((s) => (
              <span
                key={s}
                className="bg-accent/10 text-accent rounded-full px-4 py-2 text-[14px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>

          <h2 className="font-display text-ink mt-12 text-3xl font-bold tracking-tight">
            Comment ça marche à {city.name}
          </h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <li className="bg-surface rounded-2xl p-5 ring-1 ring-neutral-100">
              <span className="font-display text-accent text-3xl font-bold">1</span>
              <p className="text-ink mt-2 text-[14px]">
                Indiquez votre adresse à {city.name} pour voir les restaurants disponibles.
              </p>
            </li>
            <li className="bg-surface rounded-2xl p-5 ring-1 ring-neutral-100">
              <span className="font-display text-accent text-3xl font-bold">2</span>
              <p className="text-ink mt-2 text-[14px]">
                Choisissez vos plats et payez en ligne (Apple Pay, Google Pay, CB).
              </p>
            </li>
            <li className="bg-surface rounded-2xl p-5 ring-1 ring-neutral-100">
              <span className="font-display text-accent text-3xl font-bold">3</span>
              <p className="text-ink mt-2 text-[14px]">
                Suivez en temps réel votre livreur jusqu&apos;à votre porte.
              </p>
            </li>
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="bg-primary rounded-xl px-6 py-3 font-semibold text-white shadow-md"
            >
              Commander à {city.name}
            </Link>
            <Link
              href="/cities/nice"
              className="text-ink rounded-xl border border-neutral-200 px-6 py-3 font-medium hover:bg-neutral-50"
            >
              Voir les autres villes
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
