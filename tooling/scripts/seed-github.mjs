#!/usr/bin/env node
/**
 * Seed FoxGallery/FoxEats with labels, milestones, and the roadmap issues
 * (M0 to M13). Idempotent on labels and milestones (skips if name exists);
 * issues are appended only if no open issue with the same title is found.
 *
 * Usage: pnpm exec node tooling/scripts/seed-github.mjs [--dry-run]
 * Requires: gh CLI authenticated with write access to the repo.
 */
import { execFileSync } from 'node:child_process';

const OWNER = 'FoxGallery';
const REPO = 'FoxEats';
const DRY = process.argv.includes('--dry-run');

function gh(args, input) {
  if (DRY) {
    console.warn('DRY gh', args.join(' '), input ? '\n  body=' + JSON.stringify(input).slice(0, 80) + '...' : '');
    return '{}';
  }
  return execFileSync('gh', args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] });
}

function ghApi(method, path, body) {
  const args = ['api', '--method', method, path];
  if (body) args.push('--input', '-');
  return gh(args, body ? JSON.stringify(body) : undefined);
}

// ---------- Labels ----------
const labels = [
  { name: 'type:feat', color: '0B3D91', description: 'Nouvelle fonctionnalité produit' },
  { name: 'type:bug', color: 'C8261A', description: 'Bug à corriger' },
  { name: 'type:chore', color: '8B92A2', description: 'Maintenance / tooling' },
  { name: 'type:infra', color: '5B6478', description: 'Infrastructure / CI / déploiement' },
  { name: 'type:design', color: 'FF6B5C', description: 'Design / UI / DA' },
  { name: 'type:test', color: 'E6A100', description: 'Tests automatisés' },
  { name: 'type:docs', color: '1A8F4E', description: 'Documentation' },
  { name: 'app:web', color: '0B3D91', description: 'apps/web (Next.js)' },
  { name: 'app:mobile', color: '2D5BBE', description: 'apps/mobile (Expo client)' },
  { name: 'app:driver', color: 'FF6B5C', description: 'apps/driver (Expo livreur)' },
  { name: 'app:merchant', color: 'E84E3F', description: 'Dashboard restaurant' },
  { name: 'app:admin', color: '171C2A', description: 'Console admin' },
  { name: 'app:vitrine', color: '94ADE3', description: 'Site marketing public' },
  { name: 'app:api', color: '5F84D5', description: 'tRPC routers / API' },
  { name: 'app:shared', color: 'D9DBE2', description: 'Packages partagés' },
  { name: 'area:auth', color: 'FFB347', description: 'Authentification, sessions, OAuth' },
  { name: 'area:payments', color: '6A4DFF', description: 'Stripe Connect, paiements, reversements' },
  { name: 'area:realtime', color: '00B5C0', description: 'Pusher, événements live' },
  { name: 'area:maps', color: '4FB3A4', description: 'Cartographie / géocodage' },
  { name: 'area:notifications', color: 'C5A100', description: 'Push + email' },
  { name: 'area:i18n', color: 'D6336C', description: 'Multilingue FR/EN/IT' },
  { name: 'area:seo', color: '7B2CBF', description: 'SEO / vitrine / Lighthouse' },
  { name: 'area:rgpd', color: '0A0E18', description: 'RGPD / conformité / sécurité' },
  { name: 'p0', color: 'C8261A', description: 'Bloquant release' },
  { name: 'p1', color: 'E6A100', description: 'Important non bloquant' },
  { name: 'p2', color: '5B6478', description: 'Nice to have' },
  { name: 'status:blocked', color: '171C2A', description: 'Bloqué par dépendance' },
  { name: 'status:needs-design', color: 'FF6B5C', description: 'Maquette à produire avant dev' },
  { name: 'good first issue', color: '7CD992', description: 'Bonne tâche pour démarrer' },
];

console.warn(`→ Seeding labels (${labels.length})`);
for (const l of labels) {
  try {
    ghApi('POST', `/repos/${OWNER}/${REPO}/labels`, l);
    console.warn(`  + ${l.name}`);
  } catch {
    try {
      ghApi('PATCH', `/repos/${OWNER}/${REPO}/labels/${encodeURIComponent(l.name)}`, {
        new_name: l.name,
        color: l.color,
        description: l.description,
      });
      console.warn(`  ~ ${l.name} (updated)`);
    } catch {
      console.warn(`  ! ${l.name} skipped`);
    }
  }
}

// ---------- Milestones ----------
const startDate = new Date('2026-05-12');
const milestones = [
  { title: 'M0 — Foundations', weeks: 2, description: 'Monorepo, CI, design tokens, scaffolding web + 3 apps Expo, Drizzle, Better Auth, tRPC.' },
  { title: 'M1 — Auth & Profils', weeks: 2, description: 'Magic link, OAuth Google/Apple, profils, adresses, RGPD basiques.' },
  { title: 'M2 — Catalogue restaurants', weeks: 3, description: 'Schéma DB resto/menu, seed Côte d\'Azur, browse, search, filtres, page resto.' },
  { title: 'M3 — Panier & Checkout', weeks: 3, description: 'Panier, options, code promo, Stripe Connect onboarding+checkout, webhooks.' },
  { title: 'M4 — Commande & realtime', weeks: 2, description: 'Cycle de vie commande, événements Pusher, notifications.' },
  { title: 'M5 — Tracking livreur', weeks: 2, description: 'MapLibre, ETA, geoloc continue, preuve de remise.' },
  { title: 'M6 — Dashboard restaurant', weeks: 3, description: 'Web resto: gestion menu, KDS, stats, promos.' },
  { title: 'M7 — App Livreur', weeks: 3, description: 'Expo driver: offres, navigation, gains.' },
  { title: 'M8 — Admin Console', weeks: 2, description: 'Modération, KYC, litiges, monitoring opérationnel.' },
  { title: 'M9 — Site vitrine + SEO', weeks: 2, description: 'Home marketing, pages villes, blog, légal, Lighthouse 95+.' },
  { title: 'M10 — Notifications & emails', weeks: 1, description: 'Templates Resend, push Expo, chat support basique.' },
  { title: 'M11 — Innovations Côte d\'Azur', weeks: 3, description: 'Anti-gaspi, FoxPass, Mode Groupe, Précommande, AI Sommelier, FoxCoins.' },
  { title: 'M12 — Hardening', weeks: 2, description: 'Tests E2E, perf, a11y, RGPD, sécurité, Sentry.' },
  { title: 'M13 — Release Beta', weeks: 1, description: 'TestFlight, Play Internal, staging prod-ready, runbook.' },
];

let cursor = new Date(startDate);
const milestoneNumbers = {};
console.warn(`\n→ Seeding milestones (${milestones.length})`);
for (const m of milestones) {
  cursor = new Date(cursor.getTime() + m.weeks * 7 * 24 * 60 * 60 * 1000);
  const dueOn = cursor.toISOString();
  try {
    const out = ghApi('POST', `/repos/${OWNER}/${REPO}/milestones`, {
      title: m.title,
      description: m.description,
      due_on: dueOn,
      state: 'open',
    });
    const number = JSON.parse(out).number;
    milestoneNumbers[m.title] = number;
    console.warn(`  + #${number} ${m.title} (due ${dueOn.slice(0, 10)})`);
  } catch {
    // already exists — fetch number
    const list = JSON.parse(gh(['api', `/repos/${OWNER}/${REPO}/milestones?state=all&per_page=100`]));
    const found = list.find((x) => x.title === m.title);
    if (found) {
      milestoneNumbers[m.title] = found.number;
      console.warn(`  ~ #${found.number} ${m.title} (existed)`);
    }
  }
}

// ---------- Issues ----------
function issue(milestone, title, labels, body) {
  return { milestone, title, labels, body };
}

const acceptance = (...items) =>
  '\n\n### Critères d\'acceptation\n' + items.map((i) => `- [ ] ${i}`).join('\n');

const issues = [
  // ===== M0 — Foundations =====
  issue('M0 — Foundations', 'Initialiser pnpm workspaces + Turborepo', ['type:infra', 'app:shared', 'p0'],
    'Configurer le monorepo: `pnpm-workspace.yaml`, `turbo.json` avec cache distant, scripts racine `dev/build/lint/typecheck/test`.' +
    acceptance('`pnpm install` réussit', '`pnpm dev` lance web+mobile+driver', '`pnpm build` passe en CI', 'Cache Turbo branché sur Vercel')),
  issue('M0 — Foundations', 'Configurer ESLint v9 + Prettier + Husky + lint-staged', ['type:infra', 'app:shared', 'p1'],
    'Configs partagées dans `packages/config`. Hook pre-commit qui formate.' +
    acceptance('`pnpm lint` passe', '`pnpm format:check` passe', 'Commit pré-formaté via Husky')),
  issue('M0 — Foundations', 'Pipeline CI GitHub Actions (lint + typecheck + test + build)', ['type:infra', 'app:shared', 'p0'],
    'Workflow `.github/workflows/ci.yml` avec cache pnpm + Turbo.' +
    acceptance('CI verte sur PR', 'Cache pnpm + Turbo actif', 'Status checks requis sur main')),
  issue('M0 — Foundations', 'Connecter Neon Postgres + Drizzle ORM', ['type:infra', 'area:rgpd', 'app:shared', 'p0'],
    'Brancher Neon (`DATABASE_URL`), configurer Drizzle Kit, schémas initiaux, migrations.' +
    acceptance('`pnpm db:generate` produit une migration', '`pnpm db:migrate` applique sur Neon dev', '`pnpm db:studio` ouvre Drizzle Studio')),
  issue('M0 — Foundations', 'Schémas Drizzle complets (users, restaurants, menu, orders, couriers, payments)', ['type:infra', 'app:api', 'p0'],
    'Finaliser les schémas de `packages/db/src/schema/*` avec contraintes, index et relations Drizzle ORM.' +
    acceptance('Types exportés utilisables côté client', 'Index sur colonnes filtrables', 'Migration unique et idempotente')),
  issue('M0 — Foundations', 'Bootstrap Better Auth (sessions + adapter Drizzle)', ['type:infra', 'area:auth', 'app:api', 'p0'],
    'Initialiser Better Auth avec adapter Drizzle, route Next.js `/api/auth/[...all]`, client React et client mobile (SecureStore).' +
    acceptance('Session récupérable côté serveur via `auth.api.getSession`', 'Cookie httpOnly SameSite=Lax', 'Client mobile peut récupérer la session')),
  issue('M0 — Foundations', 'tRPC v11 setup (router racine + handler Next.js + client)', ['type:infra', 'app:api', 'p0'],
    'Configurer `packages/api` avec procédures public/protected/role-based, transformer superjson, client web + RN.' +
    acceptance('`health.ping` répond depuis web et mobile', 'Erreurs Zod formatées correctement', 'Types end-to-end fonctionnels')),
  issue('M0 — Foundations', 'Design tokens DA-A + intégration Tailwind v4 + NativeWind', ['type:design', 'app:shared', 'p0'],
    'Finaliser `packages/design-tokens`, preset Tailwind, intégration NativeWind v4, polices Cabinet Grotesk + Inter.' +
    acceptance('Couleurs accessibles depuis web et RN', 'Fonts chargées sur les 3 apps', 'Mode sombre stub présent')),
  issue('M0 — Foundations', 'App Next.js 15 minimale (vitrine placeholder + /app + /merchant + /admin)', ['type:feat', 'app:web', 'p0'],
    'Pages stub pour les 4 zones du Next, layout root, header/footer minimal.' +
    acceptance('Pages stub navigables', 'Lighthouse > 90 sur la home', 'Pas de console errors')),
  issue('M0 — Foundations', 'Expo SDK 52 — apps/mobile et apps/driver bootés', ['type:feat', 'app:mobile', 'app:driver', 'p0'],
    'Expo Router, NativeWind v4, structure tabs (mobile) + stack (driver), assets icons.' +
    acceptance('`pnpm dev:mobile` ouvre le dev client iOS et Android', 'Tabs fonctionnels', 'Driver app affiche écran d\'accueil')),
  issue('M0 — Foundations', 'Branchement Vercel pour apps/web + preview deployments', ['type:infra', 'app:web', 'p0'],
    'Importer le projet sur Vercel, configurer build command monorepo, env vars staging et prod.' +
    acceptance('Preview Vercel sur chaque PR', 'Variables d\'env synchronisées', 'Domaine staging `staging.foxeats.fr`')),
  issue('M0 — Foundations', 'Configurer EAS Build + EAS Update pour mobile et driver', ['type:infra', 'app:mobile', 'app:driver', 'p1'],
    'Initialiser EAS, profils dev/preview/prod, secrets EAS, workflow GitHub Action `eas-preview.yml`.' +
    acceptance('Build interne réussi sur iOS et Android', 'OTA channel staging fonctionnel', 'Secrets via `eas secret`')),

  // ===== M1 — Auth & Profils =====
  issue('M1 — Auth & Profils', 'Magic link email via Resend + template React Email', ['type:feat', 'area:auth', 'app:api', 'app:web', 'p0'],
    'Plugin Better Auth magicLink + envoi via Resend, template React Email (DA-A).' +
    acceptance('Email reçu en < 5s', 'Lien valide 15 min, usage unique', 'Localisé FR/EN/IT')),
  issue('M1 — Auth & Profils', 'OAuth Google sur web et mobile', ['type:feat', 'area:auth', 'app:web', 'app:mobile', 'p0'],
    'Provider Google, callbacks deep-link mobile (`foxeats://`).' +
    acceptance('Login Google fonctionne sur web', 'Login Google fonctionne sur iOS et Android', 'Profil utilisateur créé en BDD')),
  issue('M1 — Auth & Profils', 'OAuth Apple sur web et mobile', ['type:feat', 'area:auth', 'app:web', 'app:mobile', 'p0'],
    'Provider Apple + Sign-in with Apple natif iOS.' +
    acceptance('Sign-in with Apple natif iOS', 'Login Apple sur web', 'Email relai géré correctement')),
  issue('M1 — Auth & Profils', 'Écran login web (page /login)', ['type:feat', 'type:design', 'app:web', 'p0'],
    'Page login DA-A: champ email + boutons Google/Apple, état chargement, erreurs i18n.' +
    acceptance('Maquette validée', 'Accessible clavier', 'A11y AA')),
  issue('M1 — Auth & Profils', 'Flow onboarding mobile (welcome + email + OTP/magic confirmation)', ['type:feat', 'type:design', 'app:mobile', 'p0'],
    'Splash → continuer en email → confirmation magic link via universal link.' +
    acceptance('Universal link iOS fonctionne', 'Intent Android fonctionne', 'Animation Moti spring sur transitions')),
  issue('M1 — Auth & Profils', 'CRUD adresses utilisateur (autocomplete Photon + favoris)', ['type:feat', 'area:maps', 'app:mobile', 'app:web', 'p0'],
    'Recherche adresse via Photon, validation Zod, default address, instructions livreur.' +
    acceptance('Autocomplete < 300ms', 'Adresse géocodée stockée avec lat/lng', 'Default address modifiable')),
  issue('M1 — Auth & Profils', 'Page profil + préférences (langue, allergènes, régime)', ['type:feat', 'app:mobile', 'app:web', 'p1'],
    'Édition avatar, nom, téléphone, locale, dietary flags.' +
    acceptance('Sauvegarde optimiste', 'Avatar upload R2', 'Préférences appliquées aux filtres catalog')),
  issue('M1 — Auth & Profils', 'Suppression de compte + export RGPD', ['type:feat', 'area:rgpd', 'app:web', 'app:mobile', 'p0'],
    'Endpoint `me.requestExport` (génère JSON par Inngest, email avec lien R2), `me.deleteAccount` (soft delete + purge 30j).' +
    acceptance('Export téléchargeable signé 24h', 'Soft delete anonymise PII', 'Cron purge 30j fonctionnel')),

  // ===== M2 — Catalogue restaurants =====
  issue('M2 — Catalogue restaurants', 'Seed 30+ restaurants Côte d\'Azur avec menus types', ['type:chore', 'app:api', 'p0'],
    'Jeu de données réaliste réparti sur Nice/Cannes/Antibes/Monaco/Menton/Saint-Tropez/Cagnes/Grasse. Inclure spécialités niçoises.' +
    acceptance('30+ restos répartis', '≥ 10 plats par resto', 'Photos placeholders Unsplash et R2')),
  issue('M2 — Catalogue restaurants', 'Endpoint `restaurants.list` avec filtres + cursor pagination + tri géo', ['type:feat', 'app:api', 'area:maps', 'p0'],
    'Filtres cuisine, prix, note, halal/végé/vegan/gluten-free, ouvert, anti-gaspi. Tri haversine côté DB.' +
    acceptance('p95 < 200ms sur 100 restos', 'Curseur stable et idempotent', 'Tri pertinent par distance')),
  issue('M2 — Catalogue restaurants', 'Endpoint `restaurants.bySlug` (resto + menu en cascade)', ['type:feat', 'app:api', 'p0'],
    'Fetch resto + catégories + items + avis paginés.' +
    acceptance('Une requête DB groupée', 'SSR friendly (Next.js RSC)', 'Cache HTTP 60s')),
  issue('M2 — Catalogue restaurants', 'Page Home web (catégories rondes + deals + restos proches)', ['type:feat', 'type:design', 'app:web', 'p0'],
    'Layout proto Home repensé DA-A: header géoloc, chips delivery/pickup, catégories, sections horizontales.' +
    acceptance('Responsive mobile/tablet/desktop', 'Skeleton loaders', 'Sections SSR + revalidate 60s')),
  issue('M2 — Catalogue restaurants', 'Écran Home mobile (catégories + deals + cards XL)', ['type:feat', 'type:design', 'app:mobile', 'p0'],
    'Implémentation mobile du Home (proto adapté DA-A).' +
    acceptance('60 FPS au scroll', 'Pull-to-refresh', 'Top eats / Deals carousel Reanimated')),
  issue('M2 — Catalogue restaurants', 'Page restaurant web (galerie + infos + menu accordéon)', ['type:feat', 'type:design', 'app:web', 'p0'],
    'Reproduit la structure du proto Restaurant home page avec DA-A.' +
    acceptance('Galerie photos plein écran', 'Menu accordéon catégorie', 'Bouton sticky "Ajouter au panier"')),
  issue('M2 — Catalogue restaurants', 'Écran restaurant mobile (parité avec web)', ['type:feat', 'type:design', 'app:mobile', 'p0'],
    'Parité visuelle et fonctionnelle avec la page resto web.' +
    acceptance('Header parallax', 'Tabs catégories ancrées', 'Animation ajout panier')),
  issue('M2 — Catalogue restaurants', 'Recherche full-text Postgres + filtres', ['type:feat', 'app:api', 'p0'],
    '`tsvector` + `pg_trgm` sur nom, description, plats, ville.' +
    acceptance('Tolère fautes (trigram)', '< 150ms sur 30 restos', 'Surlignage des matches côté client')),
  issue('M2 — Catalogue restaurants', 'Écran Browse mobile (recherche + filtres chips)', ['type:feat', 'type:design', 'app:mobile', 'p0'],
    'Implémente le proto Brows screen avec DA-A: barre recherche, chips Pickup/Short/Top eats.' +
    acceptance('Debounce 200ms', 'Sheet filtres animé', 'Empty state illustré')),
  issue('M2 — Catalogue restaurants', 'Géoloc utilisateur + fallback ville Côte d\'Azur', ['type:feat', 'area:maps', 'app:mobile', 'app:web', 'p1'],
    'Permission, fallback Nice par défaut, sélecteur de ville.' +
    acceptance('Permission refusée gérée', 'Pas de blocage UI sans GPS', 'Indicateur ville en header')),
  issue('M2 — Catalogue restaurants', 'Badges plats locaux (socca, pissaladière, salade niçoise, etc.)', ['type:feat', 'type:design', 'app:shared', 'p2'],
    'Badge "Spécialité de la Côte d\'Azur" sur cards plats et restos.' +
    acceptance('Liste fermée de specialités', 'Icône signature DA-A', 'Filtre dédié dans Browse')),
  issue('M2 — Catalogue restaurants', 'Avis publics par restaurant', ['type:feat', 'app:api', 'app:web', 'app:mobile', 'p1'],
    'Pagination, tri par récence, note moyenne agrégée.' +
    acceptance('Note moyenne mise à jour atomically', 'Modération de base (signaler)', 'Réponses du resto affichées')),

  // ===== M3 — Panier & Checkout =====
  issue('M3 — Panier & Checkout', 'Panier client (Zustand + persistance locale)', ['type:feat', 'app:web', 'app:mobile', 'p0'],
    'Ajout/modif/suppression item, options multi-choix, notes plat, total live.' +
    acceptance('Persiste après reload (AsyncStorage / localStorage)', 'Validation Zod côté ajout', 'Conflit restos = clear + warn')),
  issue('M3 — Panier & Checkout', 'Endpoint `cart.quote` (recalcul serveur des prix + fees)', ['type:feat', 'app:api', 'p0'],
    'Source de vérité serveur: subtotal, delivery, service, TVA, total. Anti-tampering.' +
    acceptance('Mismatch client/serveur loggé', 'TVA 10% restauration', 'p95 < 100ms')),
  issue('M3 — Panier & Checkout', 'Onboarding Stripe Connect Express pour restos', ['type:feat', 'area:payments', 'app:merchant', 'p0'],
    'Account links, KYC, retour callback.' +
    acceptance('Resto onboardé en < 5 min', 'Status sync via webhook account.updated', 'Lien KYC renvoyable')),
  issue('M3 — Panier & Checkout', 'Payment Intent Stripe + Apple Pay + Google Pay', ['type:feat', 'area:payments', 'app:web', 'app:mobile', 'p0'],
    'Création PaymentIntent destination=connected account, application_fee_amount, capture deferred jusqu\'acceptation resto.' +
    acceptance('Apple Pay testé sur device', 'Google Pay testé sur device', 'Capture déclenchée à `accepted_by_restaurant`')),
  issue('M3 — Panier & Checkout', 'Webhook Stripe (payment_intent.*, charge.refunded, account.updated)', ['type:feat', 'area:payments', 'app:api', 'p0'],
    'Vérif signature, idempotence, dispatch vers Inngest.' +
    acceptance('Signature vérifiée', 'Replay sans effet de bord', 'Logs Sentry sur erreur')),
  issue('M3 — Panier & Checkout', 'Codes promo (validation + application au quote)', ['type:feat', 'app:api', 'app:web', 'app:mobile', 'p1'],
    'Validation code, per-user limit, scope ville/resto.' +
    acceptance('Codes invalides affichent raison claire', 'Cumul promo + foxcoins géré', 'Audit log usage')),
  issue('M3 — Panier & Checkout', 'Écran checkout web (adresse + paiement + récap)', ['type:feat', 'type:design', 'app:web', 'p0'],
    'Step single-page avec Payment Element Stripe.' +
    acceptance('Erreurs paiement i18n', 'Choix adresse + ajout inline', 'Bouton "Payer xx,xx €" sticky mobile')),
  issue('M3 — Panier & Checkout', 'Écran checkout mobile (parité web + sheet)', ['type:feat', 'type:design', 'app:mobile', 'p0'],
    'Reproduit le proto Place order screen avec DA-A.' +
    acceptance('Apple Pay sheet natif iOS', 'Google Pay natif Android', 'Récap collapsible')),
  issue('M3 — Panier & Checkout', 'Création de la commande après PaymentIntent réussi', ['type:feat', 'app:api', 'p0'],
    'Création `orders` + `order_events`, déclenche Inngest event `order.placed`.' +
    acceptance('Idempotence sur PaymentIntent ID', 'Stock plats indisponibles vérifié', 'Short code commande lisible')),
  issue('M3 — Panier & Checkout', 'Tip livreur (suggestions + custom)', ['type:feat', 'app:web', 'app:mobile', 'p2'],
    'Suggestions 1€/2€/3€/custom au checkout. Crédité au livreur in fine.' +
    acceptance('Tip ajouté au PaymentIntent', 'Affiché au livreur post-livraison', 'Modifiable post-livraison +24h')),

  // ===== M4 — Commande & realtime =====
  issue('M4 — Commande & realtime', 'State machine `order.status` avec transitions garanties', ['type:feat', 'app:api', 'p0'],
    'Machine d\'état stricte avec invariants, mutations atomiques + audit `order_events`.' +
    acceptance('Transitions illégales rejetées', 'Audit log complet', 'Tests unitaires de la machine')),
  issue('M4 — Commande & realtime', 'Pusher Channels: events `order:{id}` + `merchant:{id}` + `courier:{id}`', ['type:feat', 'area:realtime', 'app:api', 'p0'],
    'Auth de canaux, fan-out par Inngest.' +
    acceptance('Auth privée des canaux user', 'Latence < 500ms', 'Reconnect transparent')),
  issue('M4 — Commande & realtime', 'Écran suivi commande mobile (timeline + statut)', ['type:feat', 'type:design', 'app:mobile', 'p0'],
    'Timeline temps réel: placée → acceptée → préparation → prête → en livraison → livrée.' +
    acceptance('Updates < 1s après event Pusher', 'Notifications push synchrones', 'Reprise après backgrounding')),
  issue('M4 — Commande & realtime', 'Page suivi commande web', ['type:feat', 'app:web', 'p0'],
    'Version web responsive du suivi.' +
    acceptance('Parité fonctionnelle mobile', 'PWA installable depuis cet écran', 'Polling fallback si WS coupé')),
  issue('M4 — Commande & realtime', 'Notifications push à chaque transition d\'état', ['type:feat', 'area:notifications', 'app:api', 'p0'],
    'Expo Push pour customer, courier et merchant.' +
    acceptance('Templates localisés', 'Pas de double-push', 'Opt-out respecté')),
  issue('M4 — Commande & realtime', 'Annulation commande (avant pickup) + remboursement', ['type:feat', 'area:payments', 'app:api', 'p1'],
    'Côté customer (< 2 min) et merchant (avant prep) → refund Stripe.' +
    acceptance('Refund auto < 30s', 'Notification 3 parties', 'Audit log de la raison')),
  issue('M4 — Commande & realtime', 'Reçu PDF généré + envoi email post-livraison', ['type:feat', 'area:notifications', 'app:api', 'p2'],
    'Génération via React PDF, upload R2, lien dans email Resend.' +
    acceptance('Format propre A4', 'TVA détaillée', 'Lien expirant 7 jours')),
  issue('M4 — Commande & realtime', 'Historique commandes (mobile + web)', ['type:feat', 'app:mobile', 'app:web', 'p1'],
    'Liste paginée, filtres par statut, "Recommander" en 1 tap.' +
    acceptance('Infinite scroll', 'Recommander pré-remplit le panier', 'Empty state explicite')),

  // ===== M5 — Tracking livreur =====
  issue('M5 — Tracking livreur', 'Carte MapLibre web avec position resto/livreur/destination', ['type:feat', 'area:maps', 'app:web', 'p0'],
    'Tuiles MapTiler streets-v2, markers DA-A, polyline trajet.' +
    acceptance('Tuiles chargent < 1s', 'Markers animés Moti/Motion', 'Style cohérent DA-A')),
  issue('M5 — Tracking livreur', 'Carte MapLibre native sur mobile customer', ['type:feat', 'area:maps', 'app:mobile', 'p0'],
    'Wrapper `@maplibre/maplibre-react-native`, gestes natifs, animations smooth.' +
    acceptance('60 FPS sur iPhone 12', 'Recentrage sur livreur', 'Cluster markers si zoomed out')),
  issue('M5 — Tracking livreur', 'Geoloc continue background livreur (Expo Location + TaskManager)', ['type:feat', 'area:maps', 'app:driver', 'p0'],
    'Background location avec batterie optimisée, post périodique vers `couriers.heartbeat`.' +
    acceptance('Battery drain < 5%/h', 'Reprend après foreground', 'Permissions iOS/Android OK')),
  issue('M5 — Tracking livreur', 'ETA dynamique (livreur → resto, resto → client)', ['type:feat', 'area:maps', 'app:api', 'p0'],
    'Calcul OSRM public (router.project-osrm.org) avec cache + fallback haversine.' +
    acceptance('ETA mis à jour toutes les 30s', 'Précision ±2 min sur 10 km', 'Fallback offline propre')),
  issue('M5 — Tracking livreur', 'Preuve de remise (photo + signature client)', ['type:feat', 'app:driver', 'p0'],
    'Upload R2, lien attaché à `orders.deliveryProofUrl`.' +
    acceptance('Photo compressée < 500 ko', 'Signature optionnelle si "laisser devant"', 'Visible au customer dans suivi')),
  issue('M5 — Tracking livreur', 'Position livreur visible dans suivi customer en temps réel', ['type:feat', 'area:realtime', 'app:mobile', 'app:web', 'p0'],
    'Events Pusher `courier:location`, throttle 5s.' +
    acceptance('Latence p95 < 2s', 'Interpolation marker fluide', 'Pas de fuite GPS hors course active')),
  issue('M5 — Tracking livreur', 'Mode "Laisser devant" + photo livraison sans contact', ['type:feat', 'app:mobile', 'app:driver', 'p2'],
    'Option client au checkout, photo obligatoire si choisi.' +
    acceptance('Disponible si type=delivery', 'Photo upload R2', 'Notif customer avec photo')),

  // ===== M6 — Dashboard restaurant =====
  issue('M6 — Dashboard restaurant', 'Layout dashboard /merchant avec auth + RBAC owner/staff', ['type:feat', 'app:merchant', 'app:web', 'p0'],
    'Sidebar + multi-resto si owner, sélecteur de resto.' +
    acceptance('RBAC owner vs staff', 'Switch resto rapide', 'Skeleton chargement')),
  issue('M6 — Dashboard restaurant', 'Gestion menu (CRUD catégories + items + options)', ['type:feat', 'app:merchant', 'app:api', 'p0'],
    'Drag & drop ordre, upload photos R2, options multi-niveaux.' +
    acceptance('Réordre persisté', 'Photos compressées avant upload', 'Bulk import CSV')),
  issue('M6 — Dashboard restaurant', 'Disponibilité plats temps réel (sold out toggle)', ['type:feat', 'app:merchant', 'area:realtime', 'p0'],
    'Toggle live qui retire instantanément du catalog client (Pusher).' +
    acceptance('Toggle propagé < 1s aux clients', 'Bulk pause par catégorie', 'Reset auto chaque jour à 5h')),
  issue('M6 — Dashboard restaurant', 'Page commandes KDS (kitchen display system)', ['type:feat', 'app:merchant', 'app:web', 'p0'],
    'Colonnes Nouvelles / En préparation / Prêtes, son d\'alerte, timer.' +
    acceptance('Son configurable', 'Compatible tablette/écran 16:9', 'Réception live via Pusher')),
  issue('M6 — Dashboard restaurant', 'Accepter / Refuser commande (avec raison)', ['type:feat', 'app:merchant', 'app:api', 'p0'],
    'Boutons primaires DA-A, modal raison si refus, refund auto.' +
    acceptance('Timer 3 min avant auto-reject', 'Refund Stripe immédiat si reject', 'Notif customer instantanée')),
  issue('M6 — Dashboard restaurant', 'Statistiques (CA, ticket moyen, plats stars, heures pic)', ['type:feat', 'app:merchant', 'app:api', 'p1'],
    'Graphes Recharts, période jour/semaine/mois.' +
    acceptance('Chargement < 1s', 'Export CSV', 'Comparaison période précédente')),
  issue('M6 — Dashboard restaurant', 'Promotions resto (happy hour, % off)', ['type:feat', 'app:merchant', 'app:api', 'p1'],
    'Création promo locale, plages horaires, application auto sur catalog.' +
    acceptance('Plages multiples', 'Badge promo visible côté client', 'Limite usages par user')),
  issue('M6 — Dashboard restaurant', 'Horaires d\'ouverture + jours fériés', ['type:feat', 'app:merchant', 'app:api', 'p0'],
    'Édition par jour, exceptions, pause spontanée.' +
    acceptance('Resto "fermé" empêche commandes', 'Banner sur catalog si fermé bientôt', 'Auto-réouverture')),
  issue('M6 — Dashboard restaurant', 'Reversements + relevés Stripe Connect', ['type:feat', 'area:payments', 'app:merchant', 'p1'],
    'Dashboard payouts, prochain virement, historique.' +
    acceptance('Lien Stripe Express Dashboard', 'Export comptable mensuel', 'Frais détaillés transparents')),
  issue('M6 — Dashboard restaurant', 'Onboarding restaurant guidé (5 étapes)', ['type:feat', 'type:design', 'app:merchant', 'p0'],
    'Profil → KYC Stripe → Menu (CSV ou manuel) → Horaires → Test commande.' +
    acceptance('Progression sauvegardée', 'Validation par admin avant activation', 'Email récap envoyé')),
  issue('M6 — Dashboard restaurant', 'Impression ticket (PDF + WebUSB optionnel)', ['type:feat', 'app:merchant', 'p2'],
    'Print PDF dédié + intégration imprimante ESC/POS en option.' +
    acceptance('Layout ticket 80mm', 'Auto-print à acceptation', 'Réimpression manuelle')),
  issue('M6 — Dashboard restaurant', 'Gestion équipe (rôles + invitations email)', ['type:feat', 'app:merchant', 'area:auth', 'p2'],
    'Inviter staff avec rôle limité, audit log actions sensibles.' +
    acceptance('Invitations expirent 7j', 'Rôle révocable', 'Audit log accessible owner')),

  // ===== M7 — App Livreur =====
  issue('M7 — App Livreur', 'Onboarding livreur (profil + véhicule + IBAN + KYC Stripe)', ['type:feat', 'app:driver', 'area:payments', 'p0'],
    'Création compte Stripe Connect Express courier-type.' +
    acceptance('Documents uploadés via R2', 'Vérif IBAN', 'Validation admin avant activation')),
  issue('M7 — App Livreur', 'Toggle online/offline + statut courier', ['type:feat', 'app:driver', 'area:realtime', 'p0'],
    'Switch persistant, déconnecte si > 1h inactif.' +
    acceptance('Statut sync via Pusher', 'Auto-offline après 1h sans heartbeat', 'Indicateur visuel clair')),
  issue('M7 — App Livreur', 'Réception offres de courses (push + écran modal)', ['type:feat', 'app:driver', 'area:realtime', 'p0'],
    'Dispatch via Inngest selon distance, score, dispo.' +
    acceptance('Délai accept 30s avec compteur', 'Distance + gain affichés', 'Refus → réassignation auto')),
  issue('M7 — App Livreur', 'Acceptation course + navigation MapLibre turn-by-turn', ['type:feat', 'app:driver', 'area:maps', 'p0'],
    'Itinéraire OSRM, instructions vocales optionnelles.' +
    acceptance('Itinéraire optimisé', 'Recalcul si écart', 'Mode voix toggle')),
  issue('M7 — App Livreur', 'Pickup avec QR code resto', ['type:feat', 'app:driver', 'app:merchant', 'p1'],
    'Resto affiche QR à la remise, livreur scanne → status `picked_up`.' +
    acceptance('Scan rapide < 1s', 'Fallback code manuel', 'Anti-double-pickup')),
  issue('M7 — App Livreur', 'Page gains en direct + planning hebdo', ['type:feat', 'app:driver', 'p1'],
    'Courses du jour, gain total, prochains pics estimés.' +
    acceptance('Mise à jour temps réel', 'Export CSV mensuel', 'Estimation heures pic par ville')),
  issue('M7 — App Livreur', 'Reversements livreur (auto hebdomadaire Stripe)', ['type:feat', 'area:payments', 'app:driver', 'p1'],
    'Cron Inngest hebdo + transfert Stripe Connect.' +
    acceptance('Virement lundi pour semaine précédente', 'Historique consultable', 'Notif email + push')),
  issue('M7 — App Livreur', 'Notation client par livreur (post-livraison)', ['type:feat', 'app:driver', 'p2'],
    'Note + commentaire optionnel, anonymisé côté client.' +
    acceptance('Bloque commandes répétitives clients toxiques', 'Modération admin', 'Notif silent côté customer')),
  issue('M7 — App Livreur', 'Fiscalité auto-entrepreneur (export trimestriel URSSAF)', ['type:feat', 'app:driver', 'p2'],
    'Génération récap mensuel + total trimestriel format URSSAF.' +
    acceptance('Format compatible URSSAF auto-entrepreneur', 'Email auto fin de trimestre', 'PDF + CSV')),
  issue('M7 — App Livreur', 'Mode "préférences zones" (rayonnement)', ['type:feat', 'app:driver', 'area:maps', 'p2'],
    'Livreur définit zones favorites, dispatch priorise ses zones.' +
    acceptance('UI carte avec polygones', 'Persisté', 'Influence l\'algo de dispatch')),

  // ===== M8 — Admin Console =====
  issue('M8 — Admin Console', 'Layout admin + RBAC (admin, ops, finance, support)', ['type:feat', 'app:admin', 'area:auth', 'p0'],
    'Sidebar avec sections, gardes par rôle, audit log accès.' +
    acceptance('RBAC fin par section', 'Audit log accès', 'Mode lecture seule pour support')),
  issue('M8 — Admin Console', 'Modération restaurants (review + approve + reject)', ['type:feat', 'app:admin', 'p0'],
    'Workflow nouveau resto → admin review → activation.' +
    acceptance('Notif resto à chaque changement', 'Raison rejet email', 'Historique des modérations')),
  issue('M8 — Admin Console', 'Modération livreurs (KYC + véhicule + documents)', ['type:feat', 'app:admin', 'p0'],
    'Validation papiers livreur, blocage immédiat possible.' +
    acceptance('Documents R2 viewer intégré', 'Blocage push livreur immédiat', 'Trail audit complet')),
  issue('M8 — Admin Console', 'Litiges + remboursements manuels', ['type:feat', 'app:admin', 'area:payments', 'p0'],
    'Workflow litige → enquête → décision (refund partiel/total).' +
    acceptance('SLA 24h affiché', 'Refund Stripe en 1 clic', 'Communication client templated')),
  issue('M8 — Admin Console', 'Codes promo globaux + ciblage ville/cohorte', ['type:feat', 'app:admin', 'p1'],
    'Création promo plateforme, cohortes par filtre (nouveaux, ville, etc.).' +
    acceptance('Preview cohorte avant emission', 'Limite budget total', 'Stats utilisation live')),
  issue('M8 — Admin Console', 'Monitoring opé temps réel (live map commandes/livreurs)', ['type:feat', 'area:realtime', 'app:admin', 'p1'],
    'MapLibre admin avec toutes les courses actives, livreurs online.' +
    acceptance('Refresh < 2s', 'Filtres par ville', 'Indicateurs SLA délai pickup')),
  issue('M8 — Admin Console', 'Gestion contenu vitrine (CMS léger MDX)', ['type:feat', 'app:admin', 'app:vitrine', 'p2'],
    'Édition pages villes, blog, partners, couriers via MDX.' +
    acceptance('Preview avant publication', 'Versioning basique', 'Multilingue FR/EN/IT')),
  issue('M8 — Admin Console', 'Support utilisateur (tickets + chat templated)', ['type:feat', 'app:admin', 'p2'],
    'Vue tickets, statuts, assignation, templates de réponse.' +
    acceptance('Recherche full-text tickets', 'Templates i18n', 'Notif user push + email')),

  // ===== M9 — Site vitrine + SEO =====
  issue('M9 — Site vitrine + SEO', 'Home marketing avec hero animé + sections', ['type:feat', 'type:design', 'app:vitrine', 'area:seo', 'p0'],
    'Hero Riviera, sections "Comment ça marche", restos partenaires, témoignages, CTAs.' +
    acceptance('Lighthouse perf > 95', 'CLS < 0.1', 'Anims Motion respectent prefers-reduced')),
  issue('M9 — Site vitrine + SEO', 'Pages villes (/cities/[slug]) — Nice, Cannes, Antibes, Monaco, Menton, Saint-Tropez, Cagnes, Grasse', ['type:feat', 'app:vitrine', 'area:seo', 'p0'],
    'SEO local: titre/desc unique, JSON-LD LocalBusiness, restos par ville, FAQ.' +
    acceptance('Indexées par Google search console', 'Hreflang FR/EN/IT', 'OG dynamique')),
  issue('M9 — Site vitrine + SEO', 'Page "Devenir restaurant partenaire" + formulaire', ['type:feat', 'app:vitrine', 'p0'],
    'Pitch, FAQ, formulaire d\'inscription → admin queue.' +
    acceptance('Anti-spam Cloudflare Turnstile', 'Notif Slack/email équipe', 'Confirmation email demandeur')),
  issue('M9 — Site vitrine + SEO', 'Page "Devenir livreur" + formulaire', ['type:feat', 'app:vitrine', 'p1'],
    'Process d\'inscription, gains attendus par ville, FAQ.' +
    acceptance('Calculatrice gains', 'Plages horaires demandées', 'Pré-inscription qualifiée')),
  issue('M9 — Site vitrine + SEO', 'Blog MDX (articles + catégories)', ['type:feat', 'app:vitrine', 'area:seo', 'p2'],
    'Articles MDX FR/EN/IT, syntax highlight, RSS, sitemap.' +
    acceptance('TOC auto', 'Reading time', 'RSS validé')),
  issue('M9 — Site vitrine + SEO', 'Pages légales (CGU, CGV, confidentialité, mentions, cookies)', ['type:docs', 'area:rgpd', 'app:vitrine', 'p0'],
    'Rédaction conforme CNIL + RGPD, version multilingue.' +
    acceptance('Validation juridique', 'Lien footer global', 'Versioning daté')),
  issue('M9 — Site vitrine + SEO', 'Sitemap XML + robots.txt + JSON-LD', ['type:infra', 'area:seo', 'app:vitrine', 'p0'],
    'Sitemap dynamique avec lastmod, Schema.org Restaurant/Article/LocalBusiness.' +
    acceptance('Validé GSC', 'JSON-LD validé Google Rich Results', 'Pas de pages orphelines')),
  issue('M9 — Site vitrine + SEO', 'Open Graph images générées dynamiquement', ['type:feat', 'app:vitrine', 'area:seo', 'p1'],
    'Edge function ImageResponse pour pages + blog.' +
    acceptance('1200x630 valide', 'Cache CDN', 'Préview Twitter/LinkedIn OK')),
  issue('M9 — Site vitrine + SEO', 'Cookie consent banner conforme RGPD', ['type:feat', 'area:rgpd', 'app:vitrine', 'p0'],
    'Catégories opt-in (analytics, marketing), refusable, log de consentement.' +
    acceptance('Aucune cookie tiers avant consent', 'Log consent en BDD', 'Récupération preferences ultérieures')),

  // ===== M10 — Notifications & emails =====
  issue('M10 — Notifications & emails', 'Templates React Email (welcome, magic, order confirm, livraison, refund)', ['type:feat', 'area:notifications', 'type:design', 'p0'],
    'Templates DA-A multilingues.' +
    acceptance('Render correct Gmail/Outlook/Apple Mail', 'Multilingue', 'Préheaders optimisés')),
  issue('M10 — Notifications & emails', 'Centre de notifications in-app (mobile + web)', ['type:feat', 'app:mobile', 'app:web', 'p1'],
    'Liste notifs, marquer lu, deep links.' +
    acceptance('Badge unread count', 'Pull-to-refresh', 'Filtres par catégorie')),
  issue('M10 — Notifications & emails', 'Préférences notifications par canal (push/email/sms)', ['type:feat', 'area:notifications', 'app:mobile', 'app:web', 'p1'],
    'Granularité par catégorie + canal.' +
    acceptance('Respect strict des opt-out', 'Default opt-in raisonnable', 'Synchro multi-device')),
  issue('M10 — Notifications & emails', 'Chat support intégré (mobile + web)', ['type:feat', 'app:mobile', 'app:web', 'app:admin', 'p2'],
    'Conversation avec admin, pièces jointes R2.' +
    acceptance('Realtime via Pusher', 'Persistance Postgres', 'Notif push admin nouveau message')),
  issue('M10 — Notifications & emails', 'Workflow Inngest pour relances panier abandonné', ['type:feat', 'area:notifications', 'app:api', 'p2'],
    'Email J+1 puis J+3 si panier > 15€ non finalisé.' +
    acceptance('Désinscription en 1 clic', 'Respect RGPD marketing', 'Mesure taux conversion')),

  // ===== M11 — Innovations Côte d'Azur =====
  issue('M11 — Innovations Côte d\'Azur', 'Module Anti-gaspi (lots invendus fin de service)', ['type:feat', 'app:merchant', 'app:mobile', 'app:web', 'p1'],
    'Resto crée lot avec photo + prix réduit + créneau retrait, client voit dans onglet dédié.' +
    acceptance('Géolocalisé', 'Stock limité auto-décrémenté', 'Retrait obligatoire (pas livraison)')),
  issue('M11 — Innovations Côte d\'Azur', 'FoxPass — abonnement Stripe (livraison illimitée + 10% partenaires)', ['type:feat', 'area:payments', 'app:web', 'app:mobile', 'p1'],
    'Souscription Stripe Subscription, badge FoxPass, vérification à chaque commande.' +
    acceptance('Trial 7 jours', 'Cancel à tout moment', 'Page de gestion abonnement')),
  issue('M11 — Innovations Côte d\'Azur', 'Mode Groupe (commande partagée + split addition)', ['type:feat', 'app:mobile', 'app:web', 'p2'],
    'Initiateur partage lien magique, chacun ajoute ses items, paiement split à validation.' +
    acceptance('Lien expirant 1h', 'Notif live ajouts', 'Split par parts égales ou par items')),
  issue('M11 — Innovations Côte d\'Azur', 'Précommande J+1 (créneau horaire précis)', ['type:feat', 'app:mobile', 'app:web', 'app:merchant', 'p2'],
    'Sélecteur créneau (15 min), notif resto la veille au soir.' +
    acceptance('Capacité par créneau', 'Annulable jusqu\'à H-2', 'Workflow Inngest pour notif')),
  issue('M11 — Innovations Côte d\'Azur', 'AI Sommelier (suggestion vin/boisson via Mistral)', ['type:feat', 'app:mobile', 'app:web', 'p2'],
    'Suggestion contextuelle à l\'ajout au panier d\'un plat principal.' +
    acceptance('Latence < 2s', 'Suggestions de la carte du resto en priorité', 'Désactivable')),
  issue('M11 — Innovations Côte d\'Azur', 'Photos plats IA (FLUX schnell via Replicate) si resto sans photo', ['type:feat', 'app:merchant', 'p2'],
    'Génération opt-in resto, modération admin avant publication.' +
    acceptance('Mention "image illustrative IA"', 'Resto peut remplacer à tout moment', 'Filtre safety actif')),
  issue('M11 — Innovations Côte d\'Azur', 'FoxCoins — cashback fidélité (gagner + dépenser)', ['type:feat', 'app:api', 'app:mobile', 'app:web', 'p1'],
    'Earn 2% par commande, dépense partielle au checkout.' +
    acceptance('Ledger immutable', 'Expiration 1 an FIFO', 'Affichage solde et historique')),
  issue('M11 — Innovations Côte d\'Azur', 'Parrainage (referral codes + récompenses FoxCoins)', ['type:feat', 'app:mobile', 'app:web', 'p2'],
    'Code unique par user, 5€ FoxCoins pour parrain + filleul.' +
    acceptance('Anti-fraude (1 par foyer)', 'Tracking deep link', 'Stats parrainage profile')),
  issue('M11 — Innovations Côte d\'Azur', 'Mode événement Riviera (livraison plages/yachts/villas)', ['type:feat', 'app:mobile', 'app:driver', 'p2'],
    'Précommande dispatch sur point GPS libre (sans adresse), instructions photo livreur.' +
    acceptance('Spots populaires suggérés', 'Photo zone obligatoire par livreur', 'Tarif livraison adapté')),
  issue('M11 — Innovations Côte d\'Azur', 'Multilingue FR/EN/IT activé dans tous les écrans', ['type:feat', 'area:i18n', 'app:web', 'app:mobile', 'app:driver', 'p0'],
    'Tous les écrans M0–M10 traduits, switcher accessible.' +
    acceptance('100% des strings dans catalogues', 'Pas de fallback caché', 'Pluralisation correcte')),

  // ===== M12 — Hardening =====
  issue('M12 — Hardening', 'Tests E2E Playwright sur flux critiques web', ['type:test', 'app:web', 'p0'],
    'Login, panier, checkout, suivi commande.' +
    acceptance('CI parallèle, < 5 min', 'Vidéos en cas d\'échec', 'Couverture flux p0')),
  issue('M12 — Hardening', 'Tests E2E Maestro sur flux critiques mobile', ['type:test', 'app:mobile', 'p0'],
    'Onboarding, ajout panier, checkout, tracking.' +
    acceptance('Sur iOS sim et Android emul', 'Suite < 10 min', 'Doc reproduction locale')),
  issue('M12 — Hardening', 'Audit a11y AA web et mobile', ['type:test', 'app:web', 'app:mobile', 'p1'],
    'Axe sur web, manuel sur mobile.' +
    acceptance('Zero erreur Axe critique', 'Contrastes vérifiés DA-A', 'Tab order cohérent')),
  issue('M12 — Hardening', 'Perf Lighthouse 95+ sur les 5 pages clés vitrine', ['type:test', 'area:seo', 'app:vitrine', 'p1'],
    'LCP < 1.8s, CLS < 0.05, INP < 200ms.' +
    acceptance('Mesure CI sur PR', 'Budget perf défini', 'Images WebP/AVIF')),
  issue('M12 — Hardening', 'CSP strict + headers OWASP sur apps/web', ['type:infra', 'area:rgpd', 'app:web', 'p0'],
    'CSP par feature, HSTS, Permissions-Policy, COOP/COEP si compat.' +
    acceptance('Pas de regression CSP en prod', 'Report-URI Sentry', 'Score SecurityHeaders.com A+')),
  issue('M12 — Hardening', 'Rate limiting sur endpoints sensibles', ['type:infra', 'area:rgpd', 'app:api', 'p0'],
    'Upstash Redis ou Vercel KV sur auth/checkout/search.' +
    acceptance('100 req/min auth par IP', '429 propre avec retry-after', 'Bypass admin')),
  issue('M12 — Hardening', 'Audit RGPD complet + DPIA', ['type:docs', 'area:rgpd', 'app:shared', 'p0'],
    'Inventaire PII, durées conservation, base légale, DPIA.' +
    acceptance('Document DPIA committé', 'Politique de purge automatisée', 'Registre RGPD à jour')),
  issue('M12 — Hardening', 'Setup Sentry web + mobile + capture commandes échouées', ['type:infra', 'app:shared', 'p1'],
    'SDK web/RN, source maps upload, alertes Slack.' +
    acceptance('Erreurs commandes alertées en < 1 min', 'Source maps utilisables', 'Pas de PII dans events')),

  // ===== M13 — Release Beta =====
  issue('M13 — Release Beta', 'Build production iOS + soumission TestFlight', ['type:infra', 'app:mobile', 'app:driver', 'p0'],
    'EAS build prod, certificats, TestFlight interne.' +
    acceptance('Build accepté Apple', 'Testeurs internes invités', 'Notes de version FR/EN')),
  issue('M13 — Release Beta', 'Build production Android + Internal Testing Play', ['type:infra', 'app:mobile', 'app:driver', 'p0'],
    'AAB upload, Play Console, testeurs internes.' +
    acceptance('Build accepté Google', 'Testeurs invités', 'Versionnage automatique EAS')),
  issue('M13 — Release Beta', 'Environnement staging prod-like (Vercel + Neon branche staging)', ['type:infra', 'app:shared', 'p0'],
    'Branche `staging` Vercel, Neon branch staging, Stripe test mode propre.' +
    acceptance('Données seed reproductibles', 'Reset hebdo automatisé', 'Accès limité IP/auth')),
  issue('M13 — Release Beta', 'Runbook incidents + on-call', ['type:docs', 'area:rgpd', 'p0'],
    'Procédures: incident paiement, fuite GPS livreur, downtime Neon, etc.' +
    acceptance('Schéma escalation', 'Rotation on-call', 'Annexes contacts critiques')),
  issue('M13 — Release Beta', 'Recette beta privée (10 testeurs payants Nice + 5 restos)', ['type:chore', 'p0'],
    'Onboarding manuel, feedback hebdo, NPS, itération.' +
    acceptance('10 testeurs commandent au moins 3x', '5 restos onboardés et actifs', 'Rapport NPS post-2 semaines')),
];

// Resolve label ids → label names (already names, OK). Resolve milestone numbers.
console.warn(`\n→ Seeding issues (${issues.length})`);

const existingIssues = JSON.parse(
  gh(['api', `/repos/${OWNER}/${REPO}/issues?state=all&per_page=200`]),
);
const existingTitles = new Set(existingIssues.map((i) => i.title));

for (const iss of issues) {
  if (existingTitles.has(iss.title)) {
    console.warn(`  = ${iss.title} (exists)`);
    continue;
  }
  const milestoneNumber = milestoneNumbers[iss.milestone];
  if (!milestoneNumber) {
    console.warn(`  ! ${iss.title} — milestone "${iss.milestone}" not found, skipping`);
    continue;
  }
  try {
    ghApi('POST', `/repos/${OWNER}/${REPO}/issues`, {
      title: iss.title,
      body: iss.body,
      labels: iss.labels,
      milestone: milestoneNumber,
    });
    console.warn(`  + ${iss.title}`);
  } catch (err) {
    console.warn(`  ! ${iss.title} failed: ${err.message}`);
  }
}

console.warn('\n✓ GitHub seed complete.');
