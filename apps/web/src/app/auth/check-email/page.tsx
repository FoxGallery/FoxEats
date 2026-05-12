import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { photo } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Vérifiez votre boîte mail',
  robots: 'noindex',
};

type SearchParams = Promise<{ email?: string }>;

export default async function CheckEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams;
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
          <div className="bg-brand-soft text-brand ring-brand/20 mx-auto grid h-16 w-16 place-items-center rounded-2xl ring-1">
            <Mail size={28} strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-ink mt-6 text-[24px] font-extrabold tracking-tight">
            Vérifiez votre boîte mail
          </h1>
          <p className="text-ink-muted mt-3 text-[15px] leading-relaxed">
            {email ? (
              <>
                Nous venons d&apos;envoyer un lien de connexion à{' '}
                <span className="text-ink font-semibold">{decodeURIComponent(email)}</span>.
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
              className="text-brand inline-flex items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline"
            >
              <ArrowLeft size={14} strokeWidth={2.6} />
              Utiliser une autre adresse
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
