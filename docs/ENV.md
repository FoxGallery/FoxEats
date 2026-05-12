# Variables d'environnement FoxEats

| Variable | Scope | Description | Obtenir |
|---|---|---|---|
| `DATABASE_URL` | server | Connexion Neon Postgres | console Neon → project → connection string |
| `BETTER_AUTH_SECRET` | server | Secret signature sessions | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | server | URL publique (`https://foxeats.fr`) | — |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | server | OAuth Google | Google Cloud Console |
| `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` | server | OAuth Apple | Apple Developer |
| `STRIPE_SECRET_KEY` | server | Clé API Stripe | dashboard Stripe |
| `STRIPE_PUBLISHABLE_KEY` | public | Clé publique Stripe | idem |
| `STRIPE_WEBHOOK_SECRET` | server | Vérif signature webhooks | dashboard Stripe → webhooks |
| `STRIPE_CONNECT_CLIENT_ID` | server | Connect Express OAuth | settings Connect |
| `PUSHER_APP_ID` `PUSHER_KEY` `PUSHER_SECRET` `PUSHER_CLUSTER` | server | Realtime channels | dashboard Pusher |
| `NEXT_PUBLIC_PUSHER_KEY` `NEXT_PUBLIC_PUSHER_CLUSTER` | public | Subscribe côté client | idem |
| `INNGEST_EVENT_KEY` `INNGEST_SIGNING_KEY` | server | Background workflows | dashboard Inngest |
| `RESEND_API_KEY` | server | Envoi emails transactionnels | dashboard Resend |
| `RESEND_FROM` | server | From par défaut (`FoxEats <noreply@foxeats.fr>`) | — |
| `R2_ACCOUNT_ID` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` `R2_BUCKET` | server | Stockage Cloudflare R2 | dashboard Cloudflare R2 |
| `R2_PUBLIC_URL` | public | CDN public (`cdn.foxeats.fr`) | DNS Cloudflare |
| `MAPTILER_KEY` / `NEXT_PUBLIC_MAPTILER_KEY` | mixed | Tuiles cartes | dashboard MapTiler |
| `MISTRAL_API_KEY` | server | AI Sommelier | console Mistral |
| `REPLICATE_API_TOKEN` | server | Photos plats IA (FLUX schnell) | Replicate |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | mixed | Monitoring | dashboard Sentry |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | public | Analytics produit | dashboard PostHog |
| `NEXT_PUBLIC_APP_URL` | public | Origin canonique | — |

Configurer dans :
- **Local** : `.env.local` (copie de `.env.example`).
- **Vercel** : Project Settings → Environment Variables (production / preview / development).
- **EAS** : `eas secret:create` pour les secrets builds.
