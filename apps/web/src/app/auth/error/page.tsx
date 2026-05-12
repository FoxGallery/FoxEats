import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { photo } from '@/lib/photos';

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
    <main className="noise relative min-h-screen overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo('hero-marketing')}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="from-brand/95 to-accent/95 absolute inset-0 bg-gradient-to-br via-[#E84838]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-16">
        <Link
          href="/"
          className="font-display mb-10 text-[28px] font-extrabold tracking-tight text-white"
        >
          FoxEats
        </Link>
        <div className="bg-bg-elevated w-full rounded-3xl border border-white/15 p-9 text-center shadow-2xl">
          <div className="bg-danger/15 text-danger ring-danger/20 mx-auto grid h-16 w-16 place-items-center rounded-2xl ring-1">
            <AlertCircle size={28} strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-ink mt-6 text-[24px] font-extrabold tracking-tight">
            Impossible de vous connecter
          </h1>
          <p className="text-ink-muted mt-3 text-[15px] leading-relaxed">{message}</p>
          <Link
            href="/login"
            className="bg-brand shadow-food hover:bg-brand-hover mt-7 inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-semibold text-white transition"
          >
            Réessayer
            <ArrowRight size={14} strokeWidth={2.6} />
          </Link>
        </div>
      </div>
    </main>
  );
}
