# FoxEats

Marketplace de livraison de repas Côte d'Azur. Monorepo Turborepo.

## Stack

Next.js 15 · Expo SDK 52 · tRPC v11 · Drizzle ORM · Neon Postgres · Better Auth · Stripe Connect · MapLibre · Pusher · Inngest · Resend · Cloudflare R2 · Tailwind v4 + NativeWind v4.

Voir [`docs/SPEC.md`](docs/SPEC.md) pour le cahier des charges complet.

## Structure

```
apps/
  web/              Next.js 15 — vitrine + app user PWA + dashboard resto + admin + API
  mobile/           Expo — app client
  driver/           Expo — app livreur
packages/
  api/              Routers tRPC
  db/               Schéma Drizzle + migrations
  auth/             Better Auth config
  ui-web/           Composants shadcn/Tailwind
  ui-mobile/        Composants NativeWind
  design-tokens/    Source unique DA-A Méditerranée moderne
  validators/       Schémas Zod
  i18n/             Catalogues FR/EN/IT
  maps/             Wrappers MapLibre
  notifications/    Push + email
  config/           eslint/tsconfig/tailwind partagés
```

## Démarrage

```bash
pnpm install
cp .env.example .env.local           # remplir les secrets
pnpm db:migrate
pnpm db:seed
pnpm dev                              # tout en parallèle
# ou cibler une app
pnpm dev:web
pnpm dev:mobile
pnpm dev:driver
```

## Workflow

Branches : `feature/<milestone>-<slug>`, PR vers `main`, review obligatoire.
Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
Issues regroupées par milestones M0–M13 (voir GitHub).

## Licence

Propriétaire — FoxGallery, tous droits réservés.
