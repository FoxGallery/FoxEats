/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lint + typecheck déjà couverts par les jobs CI dédiés. Pas besoin de
  // les rejouer côté next build (et ça évite le conflit avec notre flat
  // config racine qui ne charge pas eslint-config-next).
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: [
    '@foxeats/api',
    '@foxeats/auth',
    '@foxeats/db',
    '@foxeats/design-tokens',
    '@foxeats/i18n',
    '@foxeats/maps',
    '@foxeats/notifications',
    '@foxeats/ui-web',
    '@foxeats/validators',
  ],
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'cdn.foxeats.fr' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
};

export default nextConfig;
