import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Erreur de connexion', robots: 'noindex' };

const MESSAGES: Record<string, string> = {
  invalid_token: 'Ce lien de connexion est invalide ou a déjà été utilisé.',
  expired_token: 'Ce lien de connexion a expiré. Demandez-en un nouveau.',
  unauthorized: "Vous n'avez pas les droits pour accéder à cette page.",
  oauth_failed: 'La connexion via le fournisseur a échoué. Réessayez.',
  default: 'Une erreur est survenue lors de la connexion. Réessayez.',
};

type SearchParams = Promise<{ code?: string }>;

export default async function AuthErrorPage({ searchParams }: { searchParams: SearchParams }) {
  const { code } = await searchParams;
  const message = MESSAGES[code ?? 'default'] ?? MESSAGES.default;
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0B3D91] via-[#1a4ba8] to-[#FF6B5C]" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-16">
        <Link href="/" className="font-display mb-10 text-3xl font-bold tracking-tight text-white">
          FoxEats
        </Link>
        <div className="w-full rounded-3xl bg-white/95 p-9 text-center shadow-2xl ring-1 ring-white/40 backdrop-blur-xl">
          <div className="bg-danger/15 text-danger mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-display text-ink mt-6 text-2xl font-bold tracking-tight">
            Impossible de vous connecter
          </h1>
          <p className="text-ink-muted mt-3 text-[15px] leading-relaxed">{message}</p>
          <Link
            href="/login"
            className="bg-primary hover:bg-primary-600 mt-7 inline-flex h-12 items-center justify-center rounded-xl px-6 text-[15px] font-medium text-white shadow-md transition"
          >
            Réessayer
          </Link>
        </div>
      </div>
    </main>
  );
}
