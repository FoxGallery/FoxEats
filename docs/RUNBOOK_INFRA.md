# FoxEats — Runbook infrastructure

Procédures à exécuter manuellement (actions externes hors repo) pour finaliser la mise en place de M0 et préparer les environnements.

---

## 1. Vercel (issue #11)

### Création du projet

1. Aller sur https://vercel.com/new.
2. Importer le repo `FoxGallery/FoxEats`.
3. **Framework Preset** : Next.js (détecté).
4. **Root Directory** : `apps/web`.
5. **Build Command** : laisser par défaut, Vercel utilisera `vercel.json` du repo.
6. **Output Directory** : `.next` (déjà dans `vercel.json`).
7. **Install Command** : laisser vide (overridé par `vercel.json` qui fait `cd ../.. && pnpm install --frozen-lockfile`).

### Variables d'environnement Vercel

Dans Project Settings → Environment Variables, ajouter pour **Production**, **Preview** et **Development** :

| Clé                   | Valeur (dev/staging)                                | Notes                        |
| --------------------- | --------------------------------------------------- | ---------------------------- |
| `DATABASE_URL`        | URL Neon `?channel_binding=require&sslmode=require` | rotate après seed initial    |
| `BETTER_AUTH_SECRET`  | `openssl rand -base64 32`                           | un secret distinct par env   |
| `BETTER_AUTH_URL`     | `https://<preview>.vercel.app` ou domaine prod      | doit matcher l'URL canonique |
| `NEXT_PUBLIC_APP_URL` | idem                                                | exposé client                |

À ajouter au fur et à mesure (Stripe, Pusher, etc.) — la liste complète dans [`docs/ENV.md`](./ENV.md).

### Domaines

- **Production** : `foxeats.fr` (à acheter / pointer A+CNAME sur Vercel).
- **Staging** : `staging.foxeats.fr` ou la URL Vercel par défaut.

### Status checks GitHub requis

Une fois la première PR créée :

1. Settings → Branches → Add branch protection rule pour `main`.
2. Require status checks: `CI / Lint & Format`, `CI / Typecheck`, `CI / Unit Tests`, `CI / Build`.
3. Require PR review (au moins 1).
4. Block direct pushes.

### Cache Turbo distant (optionnel mais recommandé)

```bash
npx turbo login
npx turbo link
```

Puis ajouter dans GitHub Actions secrets:

- `TURBO_TOKEN` (token Vercel)
- `TURBO_TEAM` (slug team)

---

## 2. EAS Build (issue #12)

### Init EAS pour `apps/mobile`

```bash
cd apps/mobile
npx eas-cli login           # se loguer une seule fois
npx eas-cli init            # crée le projet, récupère projectId
```

Coller la valeur dans `apps/mobile/app.json` à `expo.extra.eas.projectId`.

### Init EAS pour `apps/driver`

```bash
cd ../driver
npx eas-cli init
```

Coller le `projectId` dans `apps/driver/app.json`.

### Profils build

Les profils `development`, `preview`, `production` sont déjà définis dans
`apps/mobile/eas.json` et `apps/driver/eas.json`.

Premier build dev (interne) :

```bash
cd apps/mobile
npx eas-cli build --profile development --platform all
```

### Secrets EAS

Pour pousser des secrets côté build (clé API par ex.) :

```bash
npx eas-cli secret:create --scope project --name DATABASE_URL --value '<url>'
```

### Soumission TestFlight / Play Internal

Avant la soumission, créer :

- **Apple Developer Account** (99 $/an) → bundle IDs `fr.foxeats.client` et `fr.foxeats.driver`, App Store Connect.
- **Google Play Console** (25 $ one-time) → applications correspondantes.

Puis :

```bash
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android
```

---

## 3. Comptes externes à provisionner

| Service         | URL                              | Plan                          | Note                                  |
| --------------- | -------------------------------- | ----------------------------- | ------------------------------------- |
| Neon            | https://console.neon.tech        | Free                          | une branche `main` + une `staging`    |
| Vercel          | https://vercel.com               | Hobby pour dev, Pro pour prod | régions `cdg1` (Paris)                |
| Stripe          | https://dashboard.stripe.com     | Standard + Connect            | activer Connect Express               |
| Pusher          | https://dashboard.pusher.com     | Sandbox (free 200k msg/jour)  | cluster `eu`                          |
| Inngest         | https://app.inngest.com          | Free (50k steps/mois)         | event key + signing key               |
| Resend          | https://resend.com               | Free (3k emails/mois)         | domaine `foxeats.fr` à vérifier (DNS) |
| Cloudflare R2   | https://dash.cloudflare.com      | Free (10 Go)                  | bucket `foxeats-prod` + `foxeats-dev` |
| MapTiler        | https://cloud.maptiler.com       | Free (100k loads/mois)        | restreindre par domaine               |
| Sentry          | https://sentry.io                | Free (5k events/mois)         | projets web + mobile + driver         |
| PostHog         | https://eu.posthog.com           | Free (1M events/mois)         | projet unique multi-app               |
| Mistral         | https://console.mistral.ai       | Free tier                     | clé pour AI Sommelier (M11)           |
| Replicate       | https://replicate.com            | Free credits                  | photos plats IA (M11)                 |
| Apple Developer | https://developer.apple.com      | 99 $/an                       | comptes iOS app + Sign-in with Apple  |
| Google Play     | https://play.google.com/console  | 25 $ one-time                 | publication Android                   |
| OAuth Google    | https://console.cloud.google.com | Free                          | client OAuth pour auth                |

---

## 4. Sécurité

- **JAMAIS** committer un secret. Toujours via env Vercel / EAS.
- Le password Neon initial partagé en session doit être rotated avant la prod.
- Activer 2FA partout (GitHub, Vercel, Stripe, Apple, Google).
- Vérifier régulièrement Sentry pour fuites de PII en logs.
