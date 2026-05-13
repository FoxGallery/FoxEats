import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import type { ReactNode } from 'react';

type Props = {
  preview: string;
  children: ReactNode;
};

/** Layout partagé tous emails FoxEats — header logo + body container + footer */
export function EmailLayout({ preview, children }: Props) {
  return (
    <Html lang="fr">
      <Head>
        <title>FoxEats</title>
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: '#FF5A4A',
                brandHover: '#E84A3C',
                brandSoft: '#FFF0EE',
                accent: '#0F2A56',
                ink: '#0A0A0F',
                inkMuted: '#6B6E78',
                inkSubtle: '#A4A7B1',
                bg: '#FAFAFA',
                bgElevated: '#FFFFFF',
                bgSubtle: '#F2F3F5',
                border: '#E7E8EC',
              },
              fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                display: ['Cabinet Grotesk', 'Inter', 'sans-serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-bgSubtle font-sans">
          <Container className="bg-bgElevated mx-auto my-10 max-w-[560px] rounded-2xl p-0">
            {/* Header logo */}
            <Section className="from-brand to-accent rounded-t-2xl bg-gradient-to-br px-8 py-7 text-center">
              <Text className="font-display m-0 text-[28px] font-extrabold tracking-tight text-white">
                FoxEats
              </Text>
              <Text className="m-0 mt-1 text-[12px] uppercase tracking-widest text-white opacity-90">
                La table de la Riviera
              </Text>
            </Section>
            {/* Body */}
            <Section className="px-8 py-8">{children as any}</Section>

            <Hr className="border-border my-0" />

            {/* Footer */}
            <Section className="bg-bgSubtle rounded-b-2xl px-8 py-6 text-center">
              <Text className="text-inkMuted m-0 text-[11px]">
                FoxEats · La marketplace de livraison de la Côte d&apos;Azur
              </Text>
              <Text className="text-inkMuted m-0 mt-1 text-[11px]">
                <Link href="https://foxeats.fr" className="text-inkMuted underline">
                  foxeats.fr
                </Link>
                {' · '}
                <Link href="https://foxeats.fr/legal/privacy" className="text-inkMuted underline">
                  Confidentialité
                </Link>
                {' · '}
                <Link href="https://foxeats.fr/legal/cgu" className="text-inkMuted underline">
                  CGU
                </Link>
              </Text>
              <Text className="text-inkSubtle m-0 mt-3 text-[10px]">
                © {new Date().getFullYear()} FoxEats · Côte d&apos;Azur, France
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/** Bouton CTA — pattern brand */
export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section className="my-6 text-center">
      <Link
        href={href}
        className="bg-brand inline-block rounded-2xl px-7 py-3.5 text-center text-[14px] font-bold text-white no-underline"
        style={{
          background: '#FF5A4A',
          color: '#FFFFFF',
          padding: '14px 28px',
          borderRadius: 16,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        {children as any}
      </Link>
    </Section>
  );
}

/** KPI row pour orders */
export function EmailKpi({ label, value }: { label: string; value: string }) {
  return (
    <Section className="text-center">
      <Text className="text-inkSubtle m-0 text-[10px] font-bold uppercase tracking-widest">
        {label}
      </Text>
      <Text className="font-display text-ink m-0 mt-1 text-[20px] font-extrabold">{value}</Text>
    </Section>
  );
}
