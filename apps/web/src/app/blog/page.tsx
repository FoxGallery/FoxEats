import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog FoxEats — Cuisine et art de vivre Côte d'Azur",
  description:
    'Spécialités locales, portraits de restaurateurs, anecdotes culinaires de Nice, Cannes, Monaco et toute la Riviera.',
};

const POSTS = [
  {
    slug: 'socca-l-histoire-d-une-galette-niçoise',
    title: "La socca, l'histoire d'une galette niçoise",
    excerpt:
      "De la galette de pois chiches à la galette star du Vieux-Nice — l'histoire d'un mets simple devenu emblème.",
    date: '2026-05-12',
    category: 'Spécialités',
  },
  {
    slug: 'tarte-tropezienne-recette-originale',
    title: 'Tarte tropézienne : entre brioche et crème onctueuse',
    excerpt:
      "L'histoire de la création iconique de Saint-Tropez et nos adresses préférées pour la déguster.",
    date: '2026-05-10',
    category: 'Spécialités',
  },
  {
    slug: 'anti-gaspi-cote-azur',
    title: 'Comment FoxEats lutte contre le gaspillage alimentaire',
    excerpt: 'Notre programme anti-gaspi : récupérer les invendus de fin de service à prix doux.',
    date: '2026-05-05',
    category: 'Engagements',
  },
];

export default function BlogIndex() {
  return (
    <main className="bg-surface py-12">
      <div className="mx-auto max-w-4xl px-6">
        <Link href="/" className="text-ink-muted text-sm hover:underline">
          ← Accueil
        </Link>
        <h1 className="font-display text-ink mt-3 text-4xl font-bold tracking-tight">
          Le blog FoxEats
        </h1>
        <p className="text-ink-muted mt-2 text-[15px]">
          Spécialités locales, portraits de restaurateurs, art de vivre Côte d&apos;Azur.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {POSTS.map((p) => (
            <article
              key={p.slug}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100"
            >
              <p className="text-accent text-[11px] uppercase tracking-widest">{p.category}</p>
              <h2 className="font-display text-ink mt-2 text-xl font-bold leading-tight">
                {p.title}
              </h2>
              <p className="text-ink-muted mt-2 text-[13px] leading-relaxed">{p.excerpt}</p>
              <p className="text-ink-subtle mt-3 text-[11px]">
                {new Date(p.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </article>
          ))}
        </div>
        <p className="text-ink-muted mt-8 rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-[13px]">
          Articles complets en cours de rédaction.
          <br />
          La publication MDX dynamique sera activée prochainement.
        </p>
      </div>
    </main>
  );
}
