import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app';

const CITIES = [
  'nice',
  'cannes',
  'antibes',
  'monaco',
  'menton',
  'saint-tropez',
  'cagnes-sur-mer',
  'grasse',
];

const LEGAL = ['cgu', 'cgv', 'privacy', 'mentions', 'cookies'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/partners`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/couriers`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    ...CITIES.map((slug) => ({
      url: `${BASE}/cities/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...LEGAL.map((slug) => ({
      url: `${BASE}/legal/${slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}
