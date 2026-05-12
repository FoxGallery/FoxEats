import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Clock, Sparkles, Mail, BookOpen, User } from 'lucide-react';
import { photo, dishPhoto } from '@/lib/photos';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { HeroBlock } from '@/components/marketing/hero-block';

export const metadata: Metadata = {
  title: "Blog FoxEats — Cuisine et art de vivre Côte d'Azur",
  description:
    'Spécialités locales, portraits de restaurateurs, anecdotes culinaires de Nice, Cannes, Monaco et toute la Riviera.',
};

type Category = 'Spécialités' | 'Portraits' | 'Engagements' | 'Coulisses' | 'Saison';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: Category;
  readingMinutes: number;
  author: string;
  cover: string;
};

const POSTS: Post[] = [
  {
    slug: 'socca-histoire-galette-nicoise',
    title: "La socca, l'histoire d'une galette devenue emblème",
    excerpt:
      'De la galette de pois chiches du XVIIIᵉ aux fours à bois du Vieux-Nice, retour sur le plus humble — et le plus identitaire — des mets niçois.',
    date: '2026-05-12',
    category: 'Spécialités',
    readingMinutes: 6,
    author: 'Élise Marchetti',
    cover: photo('dish-socca'),
  },
  {
    slug: 'tarte-tropezienne-secret-brioche',
    title: 'Tarte tropézienne : entre brioche et crème, le secret',
    excerpt:
      "La création iconique d'Alexandre Micka en 1955, nos trois adresses préférées et la version maison qui rend hommage à l'originale.",
    date: '2026-05-10',
    category: 'Spécialités',
    readingMinutes: 8,
    author: 'Sophie Renault',
    cover: dishPhoto('tarte tropezienne'),
  },
  {
    slug: 'anti-gaspi-comment-ca-marche',
    title: 'Anti-gaspi : comment on évite la poubelle, ensemble',
    excerpt:
      'Notre programme transforme les invendus de fin de service en repas à -50 %. Bilan sur 6 mois et perspectives ambitieuses.',
    date: '2026-05-05',
    category: 'Engagements',
    readingMinutes: 5,
    author: "L'équipe FoxEats",
    cover: photo('dish-salad-2'),
  },
  {
    slug: 'portrait-karim-petit-pave-cannes',
    title: 'Portrait : Karim, chef du Petit Pavé à Cannes',
    excerpt:
      "Du marché Forville à la fermeture du service, 18 h dans la cuisine d'un bistrot qui réinvente la cuisine provençale.",
    date: '2026-04-28',
    category: 'Portraits',
    readingMinutes: 10,
    author: "L'équipe FoxEats",
    cover: photo('resto-bistro-2'),
  },
  {
    slug: 'comment-livrer-sans-tuer-la-pizza',
    title: 'Comment livrer une pizza sans la tuer ?',
    excerpt:
      "Sac iso, ventilation, trajet optimisé. Le savoir-faire qu'on transmet à nos livreurs pour préserver la croûte, le fromage et l'expérience.",
    date: '2026-04-22',
    category: 'Coulisses',
    readingMinutes: 7,
    author: 'Tom Berthier',
    cover: photo('dish-pizza-2'),
  },
  {
    slug: 'menton-citron-aoc-tout-savoir',
    title: 'Le citron de Menton AOC : tout savoir',
    excerpt:
      'Mode de culture, période de récolte, pâtissiers qui le subliment. Pourquoi ce fruit jaune a obtenu son AOC en 2015.',
    date: '2026-04-18',
    category: 'Saison',
    readingMinutes: 9,
    author: 'Léa Vincens',
    cover: photo('dish-dessert-2'),
  },
];

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'Spécialités', label: 'Spécialités' },
  { id: 'Portraits', label: 'Portraits' },
  { id: 'Engagements', label: 'Engagements' },
  { id: 'Coulisses', label: 'Coulisses' },
  { id: 'Saison', label: 'Saison' },
];

export default function BlogIndex() {
  const [featured, ...rest] = POSTS;

  return (
    <main className="bg-bg text-ink">
      {/* HERO photo + gradient — iso /partners /couriers /cities */}
      <section className="noise relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo('hero-marketing')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="from-brand/95 to-accent/95 absolute inset-0 bg-gradient-to-br via-[#E84838]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />

        <div className="relative">
          <SiteHeader variant="transparent" />
        </div>

        <HeroBlock
          badge="Le magazine FoxEats"
          badgeIcon={BookOpen}
          titleLine1="La Riviera,"
          titleLine2="racontée par ceux qui la cuisinent."
          description="Spécialités, portraits de chefs, engagements, coulisses. Toutes les semaines, on vous emmène en cuisine — de Saint-Tropez à Menton."
          ctas={[
            { label: 'Lire les articles', href: '#articles' },
            { label: 'Newsletter', href: '#newsletter', variant: 'secondary' },
          ]}
          stats={[
            { value: '6+', label: 'articles cette semaine' },
            { value: '5', label: 'rubriques curatées' },
            { value: '1 / sem.', label: 'newsletter du vendredi' },
          ]}
          visual={<BlogPreviewMockup />}
        />
      </section>

      {/* Categories chips + filter */}
      <section className="bg-bg relative overflow-hidden py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c, i) => (
              <span
                key={c.id}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  i === 0
                    ? 'border-ink bg-ink text-ink-inverse'
                    : 'border-border bg-bg-elevated text-ink hover:border-brand/30 hover:text-brand'
                }`}
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured article — pattern iso home cards */}
      {featured && (
        <section id="articles" className="bg-bg pb-12">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
              À la une
            </p>
            <h2 className="font-display text-ink mt-2 max-w-2xl text-[28px] font-extrabold tracking-tight sm:text-[40px]">
              L&apos;article du jour.
            </h2>

            <Link
              href={`/blog/${featured.slug}`}
              className="border-border bg-bg-elevated hover:border-brand/40 hover:shadow-food group mt-8 grid overflow-hidden rounded-3xl border shadow-md transition hover:-translate-y-1 lg:grid-cols-[1.3fr_1fr]"
            >
              <div className="bg-bg-subtle relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="bg-brand absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg ring-2 ring-white/20">
                  <Sparkles size={10} strokeWidth={2.6} />À la une
                </span>
              </div>
              <div className="flex flex-col justify-between gap-6 p-8 sm:p-10">
                <div>
                  <p className="text-brand text-[11px] font-bold uppercase tracking-widest">
                    {featured.category}
                  </p>
                  <h3 className="font-display text-ink group-hover:text-brand mt-3 text-[28px] font-extrabold leading-tight tracking-tight transition sm:text-[36px]">
                    {featured.title}
                  </h3>
                  <p className="text-ink-muted mt-4 text-[15px] leading-relaxed">
                    {featured.excerpt}
                  </p>
                </div>
                <footer className="border-border flex items-center justify-between border-t pt-5">
                  <div className="flex items-center gap-3">
                    <span className="bg-brand-soft font-display text-brand grid h-10 w-10 place-items-center rounded-full text-[14px] font-extrabold">
                      {featured.author.charAt(0)}
                    </span>
                    <div>
                      <p className="font-display text-ink text-[13px] font-bold">
                        {featured.author}
                      </p>
                      <p className="text-ink-subtle text-[11px]">{formatDate(featured.date)}</p>
                    </div>
                  </div>
                  <span className="bg-bg-subtle text-ink-muted flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    <Clock size={11} strokeWidth={2.4} />
                    {featured.readingMinutes} min
                  </span>
                </footer>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid articles — cards iso home pattern */}
      <section className="bg-bg relative overflow-hidden py-20">
        <span className="blob-brand left-[-100px] top-[20%] h-[260px] w-[260px]" />
        <span className="blob-accent bottom-[10%] right-[-120px] h-[280px] w-[280px] opacity-15" />
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Tous les articles
          </p>
          <h2 className="font-display text-ink mt-2 max-w-2xl text-[28px] font-extrabold tracking-tight sm:text-[40px]">
            La table de la Riviera décortiquée.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, idx) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="border-border bg-bg-elevated hover:border-brand/40 hover:shadow-food group relative overflow-hidden rounded-3xl border shadow-md transition hover:-translate-y-1"
              >
                <span
                  className={`pointer-events-none absolute -right-12 -top-12 z-0 h-32 w-32 rounded-full opacity-0 blur-3xl transition group-hover:opacity-30 ${
                    idx % 3 === 0 ? 'bg-brand' : idx % 3 === 1 ? 'bg-accent' : 'bg-success'
                  }`}
                />
                <div className="bg-bg-subtle relative aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.cover}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="bg-bg-elevated/95 text-ink absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-md backdrop-blur">
                    {p.category}
                  </span>
                  <span className="bg-ink/85 text-ink-inverse absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur">
                    <Clock size={9} strokeWidth={2.6} />
                    {p.readingMinutes} min
                  </span>
                </div>
                <div className="relative p-5">
                  <h3 className="font-display text-ink group-hover:text-brand text-[19px] font-bold leading-tight tracking-tight transition">
                    {p.title}
                  </h3>
                  <p className="text-ink-muted mt-2 line-clamp-2 text-[13px] leading-relaxed">
                    {p.excerpt}
                  </p>
                  <footer className="border-border mt-4 flex items-center gap-2 border-t pt-3">
                    <span className="bg-brand-soft text-brand grid h-7 w-7 place-items-center rounded-full text-[11px] font-extrabold">
                      {p.author.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-ink truncate text-[12px] font-semibold">{p.author}</p>
                      <p className="text-ink-subtle text-[10px]">{formatDate(p.date)}</p>
                    </div>
                  </footer>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA — pattern iso home features */}
      <section id="newsletter" className="bg-bg relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="from-brand to-accent shadow-food relative grid items-center gap-10 overflow-hidden rounded-3xl bg-gradient-to-br via-[#E84838] p-10 text-white md:grid-cols-[1.2fr_1fr] md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur">
                <Mail size={11} strokeWidth={2.6} />
                Newsletter
              </span>
              <h2 className="font-display mt-4 text-[32px] font-extrabold leading-[1.04] tracking-tight sm:text-[44px]">
                Recevez la Riviera
                <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  dans votre boîte.
                </span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/90">
                Tous les vendredis : un article, trois adresses à tester, une promo discrète. Pas de
                spam, désabonnement en un clic.
              </p>
            </div>
            <form
              method="POST"
              action="mailto:hello@foxeats.fr"
              encType="text/plain"
              className="relative space-y-3"
            >
              {/* Inline pill : icon + input + bouton dans un seul container fluide */}
              <div className="bg-bg-elevated flex items-center gap-1 rounded-2xl p-1.5 shadow-2xl ring-1 ring-white/30">
                <span className="bg-brand-soft text-brand grid h-12 w-12 shrink-0 place-items-center rounded-xl">
                  <Mail size={18} strokeWidth={2.4} />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="votre@email.com"
                  className="text-ink placeholder:text-ink-subtle min-w-0 flex-1 bg-transparent px-2 text-[15px] outline-none"
                />
                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-hover group inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold text-white shadow-md transition sm:px-5"
                  aria-label="S'inscrire"
                >
                  <span className="hidden sm:inline">S&apos;inscrire</span>
                  <ArrowRight
                    size={16}
                    strokeWidth={2.6}
                    className="transition group-hover:translate-x-0.5"
                  />
                </button>
              </div>
              <p className="flex items-center justify-center gap-2 text-[11px] font-medium text-white/85">
                <span className="inline-flex h-1 w-1 rounded-full bg-white/70" />
                Conforme RGPD
                <span className="inline-flex h-1 w-1 rounded-full bg-white/70" />
                Désabonnement en 1 clic
              </p>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Mockup éditorial pour le hero — pile d'articles vue magazine */
function BlogPreviewMockup() {
  const items = POSTS.slice(0, 3);
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="space-y-3">
        {items.map((p, i) => (
          <div
            key={p.slug}
            className="bg-bg-elevated flex gap-3 rounded-2xl border border-white/15 p-3 shadow-2xl"
            style={{
              transform: `translateX(${i * 12}px) rotate(${i === 0 ? -1.5 : i === 1 ? 0 : 1.5}deg)`,
            }}
          >
            <div className="bg-bg-subtle relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.cover} alt="" className="h-full w-full object-cover" />
              <span className="bg-brand absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">
                {p.category}
              </span>
            </div>
            <div className="min-w-0 flex-1 py-1">
              <p className="font-display text-ink line-clamp-2 text-[13px] font-bold leading-tight tracking-tight">
                {p.title}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="bg-brand-soft text-brand grid h-5 w-5 place-items-center rounded-full text-[9px] font-extrabold">
                  {p.author.charAt(0)}
                </span>
                <p className="text-ink-muted truncate text-[10px] font-semibold">{p.author}</p>
                <span className="text-ink-subtle text-[9px]">· {p.readingMinutes} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
