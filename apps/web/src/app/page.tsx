import Link from 'next/link';
import type { Metadata } from 'next';

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
  { slug: 'nice', name: 'Nice', count: 8 },
  { slug: 'cannes', name: 'Cannes', count: 5 },
  { slug: 'antibes', name: 'Antibes', count: 4 },
  { slug: 'monaco', name: 'Monaco', count: 3 },
  { slug: 'menton', name: 'Menton', count: 3 },
  { slug: 'saint-tropez', name: 'Saint-Tropez', count: 3 },
  { slug: 'cagnes-sur-mer', name: 'Cagnes-sur-Mer', count: 2 },
  { slug: 'grasse', name: 'Grasse', count: 2 },
];

const STEPS = [
  {
    n: '01',
    title: 'Choisissez votre restaurant',
    text: "Plus de 30 adresses sélectionnées sur toute la Côte d'Azur, des spécialités niçoises aux trattorias italiennes.",
  },
  {
    n: '02',
    title: 'Composez votre commande',
    text: "Personnalisez chaque plat avec ses options. Suivez votre commande en temps réel jusqu'à votre porte.",
  },
  {
    n: '03',
    title: 'Profitez',
    text: 'Livraison en moins de 35 minutes, paiement sécurisé Apple Pay / Google Pay / CB, pourboire livreur intégralement reversé.',
  },
];

const FEATURES = [
  {
    icon: '🥗',
    title: 'Spécialités locales',
    text: 'Socca, pissaladière, salade niçoise, tarte tropézienne, tarte au citron de Menton — la Riviera dans votre assiette.',
  },
  {
    icon: '🛵',
    title: 'Livraison rapide',
    text: 'Livreurs équipés vélos, scooters et voitures pour couvrir tout le littoral azuréen en moins de 35 min.',
  },
  {
    icon: '🌍',
    title: 'Multilingue',
    text: 'Interface en français, anglais et italien — pour les locaux comme pour les visiteurs de la Riviera.',
  },
  {
    icon: '♻️',
    title: 'Anti-gaspi',
    text: 'Récupérez les invendus de fin de service à prix réduit. Bon pour votre porte-monnaie et la planète.',
  },
];

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0B3D91] via-[#1a4ba8] to-[#FF6B5C]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_55%)]" />

        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-white">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            FoxEats
          </Link>
          <nav className="hidden gap-7 text-sm md:flex">
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
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0B3D91] shadow-md transition hover:bg-white/95"
          >
            Se connecter
          </Link>
        </header>

        <div className="mx-auto flex max-w-6xl flex-col items-start px-6 pb-24 pt-12 text-white md:pt-20">
          <span className="mb-6 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/20 backdrop-blur-md">
            Côte d&apos;Azur · 30+ restaurants sélectionnés
          </span>
          <h1 className="font-display max-w-4xl text-5xl leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            La table de la <span className="text-[#FF6B5C]">Riviera</span>,
            <br />à votre porte.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85 md:text-xl">
            Spécialités locales, restaurateurs sélectionnés, livreurs équitablement rémunérés.
            Commandez en quelques tapes, suivez en temps réel.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-[#0B3D91] shadow-xl transition hover:bg-white/95"
            >
              Commander maintenant
            </Link>
            <Link
              href="/partners"
              className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-medium backdrop-blur-md transition hover:bg-white/20"
            >
              Devenir restaurant partenaire
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/80">
            <Badge>0 € à l&apos;inscription resto</Badge>
            <Badge>Livraison illimitée FoxPass</Badge>
            <Badge>Anti-gaspi inclus</Badge>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-ink text-3xl font-bold tracking-tight md:text-4xl">
            Tout le littoral azuréen
          </h2>
          <p className="text-ink-muted mt-3 max-w-2xl text-[15px]">
            De Saint-Tropez à Menton, 8 villes desservies avec des restaurateurs partenaires choisis
            pour leur qualité.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/cities/${c.slug}`}
                className="hover:ring-primary/30 group flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 transition hover:shadow-md"
              >
                <div>
                  <p className="font-display text-ink text-base font-semibold">{c.name}</p>
                  <p className="text-ink-muted text-[11px]">{c.count} restos</p>
                </div>
                <span
                  aria-hidden
                  className="text-ink-muted group-hover:text-primary transition group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">
            Comment ça marche
          </p>
          <h2 className="font-display text-ink mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Commander n&apos;a jamais été aussi simple
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-surface rounded-3xl p-7 ring-1 ring-neutral-100">
                <span className="font-display text-accent text-3xl font-bold">{s.n}</span>
                <h3 className="font-display text-ink mt-2 text-xl font-bold">{s.title}</h3>
                <p className="text-ink-muted mt-2 text-[14px] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-accent text-[12px] font-semibold uppercase tracking-widest">
            Pourquoi FoxEats
          </p>
          <h2 className="font-display text-ink mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Pensé pour la Côte d&apos;Azur
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="font-display text-ink mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="text-ink-muted mt-1 text-[13px] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS / DRIVERS CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <CtaCard
            tone="primary"
            title="Vous êtes restaurateur ?"
            text="Rejoignez la marketplace premium de la Côte d'Azur. 0 € à l'inscription, commission de 15 % seulement sur les commandes livrées."
            cta="Devenir partenaire"
            href="/partners"
          />
          <CtaCard
            tone="accent"
            title="Vous êtes livreur ?"
            text="Soyez votre propre patron. Liberté de choisir vos zones et horaires. Pourboires 100 % reversés, virements hebdomadaires."
            cta="Postuler livreur"
            href="/couriers"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface border-t border-neutral-200 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-4">
          <div>
            <p className="font-display text-primary text-xl font-bold">FoxEats</p>
            <p className="text-ink-muted mt-2 text-[12px]">
              La marketplace de livraison de la Côte d&apos;Azur.
            </p>
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
        <p className="text-ink-subtle mx-auto mt-8 max-w-6xl px-6 text-[11px]">
          © {new Date().getFullYear()} FoxEats · Côte d&apos;Azur
        </p>
      </footer>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[12px] ring-1 ring-white/20 backdrop-blur-md">
      <span className="text-success">✓</span> {children}
    </span>
  );
}

function CtaCard({
  tone,
  title,
  text,
  cta,
  href,
}: {
  tone: 'primary' | 'accent';
  title: string;
  text: string;
  cta: string;
  href: string;
}) {
  const cls =
    tone === 'primary'
      ? 'from-primary to-primary-600 text-white'
      : 'from-accent to-[#FF8B7E] text-white';
  return (
    <div className={`rounded-3xl bg-gradient-to-br p-8 ${cls}`}>
      <h3 className="font-display text-2xl font-bold leading-tight">{title}</h3>
      <p className="mt-3 text-[14px] leading-relaxed opacity-90">{text}</p>
      <Link
        href={href}
        className="text-ink mt-6 inline-flex h-11 items-center rounded-xl bg-white px-5 text-[14px] font-semibold shadow-md transition hover:bg-white/95"
      >
        {cta} →
      </Link>
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-ink-muted text-[11px] font-semibold uppercase tracking-widest">{title}</p>
      <ul className="mt-3 space-y-1.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink-muted hover:text-ink text-[13px] hover:underline">
        {children}
      </Link>
    </li>
  );
}
