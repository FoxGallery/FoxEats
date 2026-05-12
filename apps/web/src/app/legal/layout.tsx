import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-primary text-xl font-bold tracking-tight">
            FoxEats
          </Link>
          <nav className="text-ink-muted flex gap-4 text-[12px]">
            <Link href="/legal/cgu">CGU</Link>
            <Link href="/legal/cgv">CGV</Link>
            <Link href="/legal/privacy">Confidentialité</Link>
            <Link href="/legal/mentions">Mentions</Link>
            <Link href="/legal/cookies">Cookies</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-neutral max-w-none rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-100 sm:p-10">
          {children}
        </article>
      </main>
    </div>
  );
}
