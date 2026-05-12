import Link from 'next/link';
import { Globe } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-border bg-bg-subtle border-t py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-4">
        <div>
          <p className="font-display text-ink text-[22px] font-extrabold tracking-tight">FoxEats</p>
          <p className="text-ink-muted mt-2 text-[12px]">
            La marketplace de livraison de la Côte d&apos;Azur.
          </p>
          <div className="text-ink-muted mt-4 flex items-center gap-2 text-[12px]">
            <Globe size={14} strokeWidth={2.2} />
            FR · EN · IT
          </div>
        </div>
        <FooterCol title="Explorer">
          <FooterLink href="/cities/nice">Nice</FooterLink>
          <FooterLink href="/cities/cannes">Cannes</FooterLink>
          <FooterLink href="/cities/monaco">Monaco</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
        </FooterCol>
        <FooterCol title="Partenaires">
          <FooterLink href="/partners">Devenir restaurant</FooterLink>
          <FooterLink href="/couriers">Devenir livreur</FooterLink>
          <FooterLink href="mailto:partenaires@foxeats.fr">Nous contacter</FooterLink>
        </FooterCol>
        <FooterCol title="Légal">
          <FooterLink href="/legal/cgu">CGU</FooterLink>
          <FooterLink href="/legal/cgv">CGV</FooterLink>
          <FooterLink href="/legal/privacy">Confidentialité</FooterLink>
          <FooterLink href="/legal/mentions">Mentions légales</FooterLink>
          <FooterLink href="/legal/cookies">Cookies</FooterLink>
        </FooterCol>
      </div>
      <p className="text-ink-subtle mx-auto mt-10 max-w-7xl px-6 text-[11px]">
        © {new Date().getFullYear()} FoxEats · Côte d&apos;Azur
      </p>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-ink-muted text-[11px] font-semibold uppercase tracking-widest">{title}</p>
      <ul className="mt-3 space-y-1.5">{children as any}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink-muted hover:text-ink text-[13px] hover:underline">
        {children as any}
      </Link>
    </li>
  );
}
