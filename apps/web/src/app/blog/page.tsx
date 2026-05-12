import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Clock, Sparkles, Mail } from 'lucide-react';
import { photo, dishPhoto } from '@/lib/photos';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

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
      <SiteHeader variant="solid" />

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
              Le magazine FoxEats
            </p>
            <h1 className="font-display text-ink mt-3 max-w-3xl text-[44px] font-extrabold leading-[1.04] tracking-tight sm:text-[64px]">
              La <span className="text-gradient-brand">Riviera</span>, racontée par ceux qui la
              cuisinent.
            </h1>
            <p className="text-ink-muted mt-4 max-w-2xl text-[16px] leading-relaxed">
              Spécialités, portraits de chefs, engagements, coulisses. Toutes les semaines, on vous
              emmène en cuisine — de Saint-Tropez à Menton.
            </p>
          </div>
          <NewsletterPill />
        </div>

        <div className="-mx-6 mt-10 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => (
            <span
              key={c.id}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-semibold ${
                c.id === 'all'
                  ? 'border-ink bg-ink text-ink-inverse'
                  : 'border-border bg-bg-elevated text-ink hover:border-ink/30'
              }`}
            >
              {c.label}
            </span>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="mx-auto max-w-7xl px-6">
          <Link
            href={`/blog/${featured.slug}`}
            className="border-border bg-bg-elevated shadow-food group grid overflow-hidden rounded-3xl border transition hover:-translate-y-1 lg:grid-cols-[1.2fr_1fr]"
          >
            <div className="bg-bg-subtle relative aspect-[16/10] overflow-hidden lg:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.cover}
                alt={featured.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <span className="bg-brand absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                <Sparkles size={10} strokeWidth={2.6} />À la une
              </span>
            </div>
            <div className="flex flex-col justify-between gap-6 p-8 sm:p-10">
              <div>
                <p className="text-brand text-[11px] font-bold uppercase tracking-widest">
                  {featured.category}
                </p>
                <h2 className="font-display text-ink mt-3 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[36px]">
                  {featured.title}
                </h2>
                <p className="text-ink-muted mt-4 text-[15px] leading-relaxed">
                  {featured.excerpt}
                </p>
              </div>
              <footer className="text-ink-subtle flex items-center justify-between text-[12px]">
                <span>
                  <span className="text-ink font-semibold">{featured.author}</span> ·{' '}
                  {formatDate(featured.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} strokeWidth={2.4} />
                  {featured.readingMinutes} min
                </span>
              </footer>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
              <div className="bg-bg-subtle relative aspect-[16/11] overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <span className="text-ink absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                  {p.category}
                </span>
              </div>
              <h3 className="font-display text-ink group-hover:text-brand mt-4 text-[20px] font-bold leading-tight tracking-tight transition">
                {p.title}
              </h3>
              <p className="text-ink-muted mt-2 line-clamp-2 text-[13px] leading-relaxed">
                {p.excerpt}
              </p>
              <footer className="text-ink-subtle mt-3 flex items-center justify-between text-[11px]">
                <span>
                  <span className="text-ink font-medium">{p.author}</span> · {formatDate(p.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} strokeWidth={2.4} />
                  {p.readingMinutes} min
                </span>
              </footer>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-bg-subtle py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-brand text-[12px] font-semibold uppercase tracking-widest">
            Une newsletter par semaine
          </p>
          <h2 className="font-display text-ink mt-2 text-[32px] font-extrabold tracking-tight sm:text-[44px]">
            Recevez la Riviera
            <br />
            <span className="text-gradient-brand">dans votre boîte.</span>
          </h2>
          <p className="text-ink-muted mx-auto mt-3 max-w-md text-[15px] leading-relaxed">
            Tous les vendredis, un article, trois adresses à tester, une promo discrète. Pas de
            spam, désabonnement en un clic.
          </p>
          <form
            method="POST"
            action="mailto:hello@foxeats.fr"
            encType="text/plain"
            className="bg-bg-elevated ring-border mx-auto mt-8 flex w-full max-w-md items-center gap-2 rounded-2xl p-2 shadow-md ring-1"
          >
            <span className="bg-brand-soft text-brand grid h-10 w-10 shrink-0 place-items-center rounded-xl">
              <Mail size={16} strokeWidth={2.4} />
            </span>
            <input
              type="email"
              name="email"
              required
              placeholder="votre@email.com"
              className="text-ink placeholder:text-ink-subtle min-w-0 flex-1 bg-transparent text-[14px] outline-none"
            />
            <button
              type="submit"
              className="bg-brand hover:bg-brand-hover grid h-10 shrink-0 place-items-center rounded-xl px-4 text-[13px] font-semibold text-white"
            >
              S&apos;inscrire
            </button>
          </form>
          <p className="text-ink-subtle mt-3 text-[11px]">Aucune donnée revendue. Conforme RGPD.</p>
        </div>
      </section>

      {/* Pinned note (MDX coming soon) */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="border-border bg-bg-elevated text-ink-muted rounded-2xl border border-dashed p-6 text-center text-[13px]">
          Les articles complets arrivent — publication MDX dynamique activée prochainement. En
          attendant, suivez-nous sur la newsletter pour ne rien rater.
          <Link
            href="/"
            className="text-brand ml-1 inline-flex items-center gap-1 font-semibold hover:underline"
          >
            Retour accueil <ArrowRight size={12} strokeWidth={2.6} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function NewsletterPill() {
  return (
    <Link
      href="#newsletter"
      className="bg-ink text-ink-inverse inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold hover:opacity-90"
    >
      <Mail size={14} strokeWidth={2.4} />
      Newsletter
      <ArrowRight size={12} strokeWidth={2.6} />
    </Link>
  );
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
