import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vérifiez votre boîte mail',
  robots: 'noindex',
};

type SearchParams = Promise<{ email?: string }>;

export default async function CheckEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams;
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0B3D91] via-[#1a4ba8] to-[#FF6B5C]" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-16">
        <Link href="/" className="font-display mb-10 text-3xl font-bold tracking-tight text-white">
          FoxEats
        </Link>

        <div className="w-full rounded-3xl bg-white/95 p-9 text-center shadow-2xl ring-1 ring-white/40 backdrop-blur-xl">
          <div className="bg-accent/15 text-accent mx-auto flex h-16 w-16 items-center justify-center rounded-full">
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
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>
          <h1 className="font-display text-ink mt-6 text-2xl font-bold tracking-tight">
            Vérifiez votre boîte mail
          </h1>
          <p className="text-ink-muted mt-3 text-[15px] leading-relaxed">
            {email ? (
              <>
                Nous venons d&apos;envoyer un lien de connexion à{' '}
                <span className="text-ink font-medium">{decodeURIComponent(email)}</span>.
              </>
            ) : (
              <>Nous venons d&apos;envoyer un lien de connexion à votre adresse email.</>
            )}{' '}
            Il est valide 15 minutes et utilisable une seule fois.
          </p>
          <p className="text-ink-subtle mt-4 text-[13px]">
            Pensez à vérifier vos spams si vous ne le recevez pas dans la minute.
          </p>
          <div className="mt-7">
            <Link
              href="/login"
              className="text-primary text-[14px] font-medium underline-offset-4 hover:underline"
            >
              ← Utiliser une autre adresse
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
