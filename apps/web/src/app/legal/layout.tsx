import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg text-ink">
      <SiteHeader variant="solid" />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <article className="prose prose-neutral dark:prose-invert border-border bg-bg-elevated max-w-none rounded-3xl border p-8 shadow-md sm:p-10">
          {children as any}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
