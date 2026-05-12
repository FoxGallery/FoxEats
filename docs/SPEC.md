# FoxEats — Cahier des charges technique

> Version 1.0 — validée 2026-05-12
> Repo : `FoxGallery/FoxEats`

## 1. Vision & positionnement

FoxEats est une marketplace de livraison de repas type UberEats / Deliveroo, ciblée Côte d'Azur (Nice, Cannes, Antibes, Monaco, Menton, Saint-Tropez, Cagnes-sur-Mer, Grasse, Juan-les-Pins, Villefranche).

Trois faces produit + console interne + site vitrine :

- **Client** — apps mobile (iOS/Android) + PWA web.
- **Restaurant** — dashboard web + impression KDS, version mobile companion.
- **Livreur** — app mobile dédiée.
- **Admin** — console web interne.
- **Vitrine** — site marketing SEO multilingue FR/EN/IT.

Ambition produit : plus raffinée, plus française, plus locale qu'UberEats, avec une surcouche d'innovations différenciantes (anti-gaspi, FoxPass, AI sommelier, mode événement Riviera, FoxCoins, multilingue touristes).

## 2. Direction artistique — A « Méditerranée moderne »

| Token             | Valeur    | Usage                                  |
| ----------------- | --------- | -------------------------------------- |
| `--color-primary` | `#0B3D91` | Bleu profond, CTA, navigation active   |
| `--color-accent`  | `#FF6B5C` | Corail, prix promo, badges, highlights |
| `--color-surface` | `#FFF8EE` | Crème, fond app                        |
| `--color-ink`     | `#0A1733` | Texte principal                        |
| `--color-muted`   | `#5B6478` | Texte secondaire                       |
| `--color-success` | `#1A8F4E` | Statut livré, validations              |
| `--color-warn`    | `#E6A100` | Retard, attention                      |
| `--color-danger`  | `#C8261A` | Annulation, erreur                     |

- **Typo display** : Cabinet Grotesk (titres, hero, prix).
- **Typo UI** : Inter (paragraphes, boutons, labels).
- **Échelle radius** : 4 / 8 / 12 / 20 / 999 (pill).
- **Élévation** : ombres douces basse opacité (0.06 / 0.10 / 0.14), pas d'ombres dures.
- **Signature visuelle** : glassmorphism subtil sur les cards flottantes, micro-anims Motion (spring 240/22), gradients méditerranéens (bleu → corail diagonal) sur les écrans d'onboarding et les états vides.
- **Iconographie** : Lucide en stroke 1.5px.
- **Mascotte** : silhouette de renard stylisée, présence discrète (splash, état vide, easter eggs), jamais cartoonesque.

Références d'inspiration : Hermès, Riviera années 60, Aesop pour la sobriété.

## 3. Stack technique

| Couche                                                   | Techno                                                      | Notes                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| Monorepo                                                 | Turborepo + pnpm workspaces                                 | Cache distribué Vercel                       |
| Web (vitrine + user PWA + dashboard resto + admin + API) | Next.js 15 App Router, RSC, Server Actions                  | 1 seul projet Vercel                         |
| API                                                      | tRPC v11 + Next.js Route Handlers                           | Typage end-to-end web+mobile                 |
| Apps mobile                                              | Expo SDK 52, React Native, Expo Router                      | EAS Build + EAS Update                       |
| DB                                                       | Neon Postgres (serverless) + Drizzle ORM                    | Branching DB par PR                          |
| Auth                                                     | Better Auth (magic link + Google + Apple OAuth)             | Sessions partagées web+mobile                |
| Realtime                                                 | Pusher Channels (free 200k msg/jour)                        | Statut commande, position livreur, KDS resto |
| Jobs / Workflows                                         | Inngest (free 50k steps/mois)                               | Cron, fan-out commandes, relances            |
| Paiements                                                | Stripe Connect Express                                      | Multi-vendeur, KYC inclus                    |
| Cartes                                                   | MapLibre GL JS (web) + `@maplibre/maplibre-react-native`    | Tuiles MapTiler free tier                    |
| Géocodage                                                | Photon (Komoot) + Nominatim fallback, cache Postgres        | Adresses FR illimitées                       |
| Stockage                                                 | Cloudflare R2 (10 Go free, egress 0)                        | Photos plats/restos/avatars                  |
| Email transactionnel                                     | Resend + React Email                                        | 3 000 emails/mois free                       |
| Push                                                     | Expo Notifications                                          | Illimité, gratuit                            |
| Search                                                   | Postgres FTS (`tsvector` + `pg_trgm`)                       | Migration vers Meilisearch si besoin         |
| UI web                                                   | Tailwind v4 + shadcn/ui + Radix + Motion                    |                                              |
| UI mobile                                                | NativeWind v4 + Moti + Reanimated 3                         |                                              |
| State                                                    | TanStack Query (server) + Zustand (client)                  |                                              |
| i18n                                                     | next-intl (web) + Lingui (mobile)                           | FR (default), EN, IT                         |
| Validation                                               | Zod                                                         | Schémas partagés                             |
| Tests                                                    | Vitest (unit) + Playwright (E2E web) + Maestro (E2E mobile) |                                              |
| Observabilité                                            | Sentry + PostHog + Vercel Analytics                         |                                              |
| CI/CD                                                    | GitHub Actions + Vercel + EAS Build                         |                                              |

## 4. Structure du monorepo

```
foxeats/
├── apps/
│   ├── web/                  Next.js 15 — vitrine + /app + /merchant + /admin + /api
│   ├── mobile/               Expo — app client
│   ├── driver/               Expo — app livreur
│   └── merchant-mobile/      Expo — companion resto (post-MVP)
├── packages/
│   ├── api/                  Routers tRPC
│   ├── db/                   Schéma Drizzle, migrations, seed
│   ├── auth/                 Better Auth config
│   ├── ui-web/               Composants shadcn + Tailwind
│   ├── ui-mobile/            Composants NativeWind
│   ├── design-tokens/        Source unique couleurs/typo/spacing
│   ├── validators/           Schémas Zod partagés
│   ├── i18n/                 Catalogues FR/EN/IT
│   ├── maps/                 Wrappers MapLibre web/RN
│   ├── notifications/        Push + email + abstraction
│   └── config/               eslint, tsconfig, tailwind, prettier
├── tooling/                  Scripts CI, codegen, seed
├── docs/                     SPEC, ADR, contributing
├── .github/                  Workflows + templates
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

Routes Next.js dans `apps/web` :

- `/` `/cities/[slug]` `/blog/*` `/about` `/partners` `/couriers` — vitrine publique SEO.
- `/app/*` — app client web (PWA, login requis).
- `/merchant/*` — dashboard restaurant (login resto).
- `/admin/*` — console admin (login admin RBAC).
- `/api/trpc/[trpc]` — endpoint tRPC unique consommé par tous les clients.
- `/api/webhooks/{stripe,resend,pusher,inngest}` — webhooks tiers.

## 5. Modules fonctionnels

### 5.1 Client

Onboarding et auth (magic link, Google, Apple) — profil et préférences (allergènes, régimes, langue) — adresses multiples avec géoloc et favoris — home (catégories rondes, deals, top eats, restos proches) — recherche et filtres (cuisine, prix, note, halal, végé, sans gluten, ouvert) — page restaurant (galerie, infos, menu en accordéon, avis, plats stars) — panier multi-options et extras — codes promo, FoxCoins, FoxPass — checkout Stripe (Apple Pay, Google Pay, CB, SEPA) — suivi commande temps réel avec carte livreur — historique et favoris — parrainage — notation et avis — support chat — paramètres et RGPD.

### 5.2 Restaurant

Onboarding KYC Stripe Connect — gestion menu (catégories, plats, options, photos, disponibilité temps réel, horaires de service, périodes de pause) — prise et refus de commande temps réel (KDS + son + push) — impression ticket — statistiques (CA, ticket moyen, heures pic, plats stars, taux d'acceptation) — promotions et happy hour — gestion équipe et rôles — paiements et reversements Stripe — anti-gaspi (création de paniers d'invendus en fin de service).

### 5.3 Livreur

Onboarding KYC — statut online/offline — géoloc continue background — offres de courses (accepter/refuser sous timeout) — navigation MapLibre turn-by-turn — pickup avec QR code resto — preuve de remise (photo + signature client) — gains en direct — planning hebdo — historique courses — fiscalité auto-entrepreneur (export trimestriel URSSAF).

### 5.4 Admin

Modération restos/livreurs — workflow KYC — gestion litiges et remboursements — codes promo plateforme — contenu vitrine (CMS léger) — monitoring opé temps réel (carte des courses en cours, alertes) — support utilisateur — RBAC fin (admin, ops, finance, support).

### 5.5 Site vitrine

Home marketing — pages villes (`/cities/nice`, `/cities/cannes`, etc.) — « Devenez restaurant partenaire » avec formulaire d'inscription — « Devenez livreur » — blog MDX — pages légales (CGU, CGV, politique de confidentialité, mentions légales) — Schema.org Restaurant/Article, sitemap dynamique, OG images générées à la volée, Lighthouse cible 95+.

## 6. Différenciation Côte d'Azur

1. **Anti-gaspi** — lots invendus fin de service à prix cassé, géolocalisés, retrait uniquement.
2. **FoxPass** — abonnement mensuel livraison illimitée (au-dessus de seuil) + 10% chez partenaires premium.
3. **Mode Groupe** — commande partagée multi-utilisateurs, addition split automatique par plat ou parts égales.
4. **Précommande J+1** — réservation d'un créneau précis pour le lendemain (idéal pause déjeuner bureau).
5. **Multilingue FR/EN/IT** — marché touristique massif, IT inclus dès MVP.
6. **Spécialités locales** — badges « spécialité de la région » pour socca, pissaladière, salade niçoise, daube, pan-bagnat, tourte de blettes, etc.
7. **AI Sommelier** — suggestion vin / boisson selon plats, via Mistral free tier API.
8. **Photos plats IA** — génération automatique si resto n'en fournit pas (FLUX schnell via Replicate free credits, modération avant publication).
9. **FoxCoins** — cashback fidélité utilisable comme moyen de paiement partiel.
10. **Mode événement Riviera** — précommandes dispatchées sur plages, yachts, villas (été).

## 7. Milestones GitHub

| ID  | Nom                     | Objectif                                                                               | Issues approx. |
| --- | ----------------------- | -------------------------------------------------------------------------------------- | -------------- |
| M0  | Foundations             | Monorepo, CI, design tokens, scaffolding 3 apps Expo + web, Drizzle, Better Auth, tRPC | 12             |
| M1  | Auth & Profils          | Magic link, Google, Apple, profils, adresses, RGPD                                     | 8              |
| M2  | Catalogue restaurants   | DB schéma, seed Côte d'Azur, browse, search, filtres, page resto                       | 12             |
| M3  | Panier & Checkout       | Panier, options, codes promo, Stripe Connect, webhooks                                 | 10             |
| M4  | Commande & realtime     | Cycle de vie commande, événements Pusher, notifications                                | 8              |
| M5  | Tracking livreur        | MapLibre, ETA, geoloc continue, preuve de remise                                       | 7              |
| M6  | Dashboard restaurant    | Web resto, gestion menu, KDS, stats, promos                                            | 12             |
| M7  | App Livreur             | Expo driver, offres, navigation, gains                                                 | 10             |
| M8  | Admin Console           | Modération, KYC, litiges, monitoring                                                   | 8              |
| M9  | Site vitrine + SEO      | Home, villes, blog, légal, Lighthouse 95+                                              | 9              |
| M10 | Notifications & emails  | Templates Resend, push Expo, chat support                                              | 5              |
| M11 | Innovations Côte d'Azur | Anti-gaspi, FoxPass, Groupe, Précommande, AI Sommelier, FoxCoins                       | 10             |
| M12 | Hardening               | Tests E2E, perf, a11y, RGPD, sécurité, Sentry                                          | 8              |
| M13 | Release Beta privée     | TestFlight, Play Internal Testing, staging, runbook                                    | 5              |

Soit environ **124 issues**.

## 8. Sécurité & conformité

- **RGPD** : consentement explicite, export et suppression de compte, log d'accès aux PII, DPO@foxeats.fr.
- **PCI-DSS SAQ-A** : aucun PAN ne touche notre infra, Stripe Elements + Payment Element uniquement.
- **Stockage tokens** : sessions Better Auth httpOnly SameSite=Lax, secrets via Vercel env.
- **CSP** stricte sur `apps/web`, headers de sécurité OWASP via `next.config`.
- **Rate limit** : Upstash Redis (free tier) ou Vercel KV sur endpoints sensibles.
- **Logs PII** : redaction au transport (`pino-redact`).
- **Audit trail** côté admin et resto (qui a modifié quoi, quand).

## 9. Environnements

- `dev` — local + Neon branch `dev` + Stripe test.
- `preview` — branches Vercel + Neon branch par PR + Stripe test.
- `staging` — branche `staging` + Neon branch `staging` + Stripe test.
- `production` — branche `main` + Neon `main` + Stripe live.

Variables d'environnement publiées dans `docs/ENV.md`.

## 10. Hors scope MVP

- iPad app native dédiée KDS resto (le dashboard web responsive suffit).
- Programme de partenariat hôtelier API (post-M13).
- B2B catering / repas d'entreprise volumétriques.
- Marketplace épicerie / non-restaurant (à étudier après stabilisation).
