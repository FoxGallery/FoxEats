import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Connexion',
  description: "Connectez-vous à FoxEats pour commander vos repas préférés sur la Côte d'Azur.",
};

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next, error } = await searchParams;
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0B3D91] via-[#1a4ba8] to-[#FF6B5C]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />

      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-16">
        <Link href="/" className="font-display mb-10 text-3xl font-bold tracking-tight text-white">
          FoxEats
        </Link>

        <div className="w-full rounded-3xl bg-white/95 p-7 shadow-2xl ring-1 ring-white/40 backdrop-blur-xl sm:p-9">
          <h1 className="font-display text-ink text-3xl font-bold tracking-tight">
            Bon retour parmi nous
          </h1>
          <p className="text-ink-muted mt-2 text-[15px] leading-relaxed">
            Connectez-vous pour commander chez vos restaurants préférés de la Côte d&apos;Azur.
          </p>

          {error && (
            <div
              role="alert"
              className="border-danger/30 bg-danger/10 text-danger mt-5 rounded-lg border px-4 py-3 text-sm"
            >
              {decodeURIComponent(error)}
            </div>
          )}

          <LoginForm callbackUrl={next ?? '/app'} />

          <p className="text-ink-muted mt-7 text-center text-[13px]">
            En continuant, vous acceptez nos{' '}
            <Link href="/legal/cgu" className="text-primary underline-offset-4 hover:underline">
              CGU
            </Link>{' '}
            et notre{' '}
            <Link href="/legal/privacy" className="text-primary underline-offset-4 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          Vous êtes restaurateur ou livreur ?{' '}
          <Link href="/partners" className="text-white underline-offset-4 hover:underline">
            Découvrez l&apos;espace partenaires
          </Link>
        </p>
      </div>
    </main>
  );
}
