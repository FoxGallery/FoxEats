import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';
import { photo } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Connexion',
  description: "Connectez-vous à FoxEats pour commander vos repas préférés sur la Côte d'Azur.",
};

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next, error } = await searchParams;
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

        <div className="bg-bg-elevated w-full rounded-3xl border border-white/15 p-7 shadow-2xl sm:p-9">
          <h1 className="font-display text-ink text-[28px] font-extrabold tracking-tight">
            Bon retour parmi nous
          </h1>
          <p className="text-ink-muted mt-2 text-[15px] leading-relaxed">
            Connectez-vous pour commander chez vos restaurants préférés de la Côte d&apos;Azur.
          </p>

          {error && (
            <div
              role="alert"
              className="border-danger/30 bg-danger/10 text-danger mt-5 rounded-xl border px-4 py-3 text-[13px]"
            >
              {decodeURIComponent(error)}
            </div>
          )}

          <LoginForm callbackUrl={next ?? '/app'} />

          <p className="text-ink-muted mt-7 text-center text-[13px]">
            En continuant, vous acceptez nos{' '}
            <Link
              href="/legal/cgu"
              className="text-brand font-semibold underline-offset-4 hover:underline"
            >
              CGU
            </Link>{' '}
            et notre{' '}
            <Link
              href="/legal/privacy"
              className="text-brand font-semibold underline-offset-4 hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </p>
        </div>

        <p className="mt-8 text-center text-[13px] text-white/80">
          Vous êtes restaurateur ou livreur ?{' '}
          <Link
            href="/partners"
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            Découvrez l&apos;espace partenaires
          </Link>
        </p>
      </div>
    </main>
  );
}
