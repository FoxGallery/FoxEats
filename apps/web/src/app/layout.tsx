import type { Metadata, Viewport } from 'next';
import { TrpcProvider } from '@/components/trpc-provider';
import { CookieConsent } from '@/components/cookie-consent';
import './globals.css';

export const metadata: Metadata = {
  title: { default: "FoxEats — Côte d'Azur Food Delivery", template: '%s · FoxEats' },
  description:
    "FoxEats — Les meilleurs restaurants de la Côte d'Azur, livrés chez vous. Nice, Cannes, Antibes, Monaco.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'FoxEats',
    description: "La livraison de repas premium de la Côte d'Azur.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'FoxEats',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAFAFA',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

const JSONLD_ORG = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FoxEats',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app',
  logo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app'}/icon.png`,
  areaServed: { '@type': 'Place', name: "Côte d'Azur" },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'partner',
      email: 'partenaires@foxeats.fr',
      availableLanguage: ['fr', 'en', 'it'],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-bg text-ink antialiased">
        <TrpcProvider>{children as any}</TrpcProvider>
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_ORG) }}
        />
      </body>
    </html>
  );
}
