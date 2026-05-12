import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'FoxEats — Côte d\'Azur Food Delivery', template: '%s · FoxEats' },
  description:
    'FoxEats — Les meilleurs restaurants de la Côte d\'Azur, livrés chez vous. Nice, Cannes, Antibes, Monaco.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'FoxEats',
    description: 'La livraison de repas premium de la Côte d\'Azur.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'FoxEats',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B3D91',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-surface text-ink antialiased">{children}</body>
    </html>
  );
}
