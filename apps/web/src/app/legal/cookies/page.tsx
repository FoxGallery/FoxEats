import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Politique cookies' };

export default function CookiesPage() {
  return (
    <>
      <h1 className="font-display text-ink text-3xl font-bold">Politique cookies</h1>
      <p className="text-ink-muted text-[12px]">Dernière mise à jour : 12 mai 2026</p>

      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre appareil par le site visité. Il permet
        par exemple de garder votre session ouverte ou de mesurer l&apos;audience.
      </p>

      <h2>2. Cookies utilisés</h2>

      <h3>Cookies nécessaires (toujours actifs)</h3>
      <ul>
        <li>
          <strong>better-auth.session_token</strong> — votre session utilisateur (httpOnly,
          SameSite=Lax)
        </li>
        <li>
          <strong>foxeats-cart-v1</strong> (localStorage) — votre panier en cours
        </li>
        <li>
          <strong>foxeats-cookie-consent-v1</strong> (localStorage) — votre choix de consentement
        </li>
      </ul>

      <h3>Cookies d&apos;analyse (avec consentement)</h3>
      <ul>
        <li>
          <strong>Vercel Analytics</strong> — mesure d&apos;audience anonymisée (pas
          d&apos;identification personnelle)
        </li>
        <li>
          <strong>PostHog</strong> — analyse produit anonymisée
        </li>
      </ul>

      <h3>Cookies marketing (avec consentement)</h3>
      <p>Aucun cookie marketing tiers n&apos;est utilisé à ce jour.</p>

      <h2>3. Gérer votre consentement</h2>
      <p>
        Vous pouvez modifier votre choix à tout moment via la bannière de consentement (recharger la
        page après suppression manuelle du localStorage) ou via votre espace personnel.
      </p>

      <h2>4. Cookies tiers</h2>
      <p>
        Stripe et MapTiler déposent des cookies techniques nécessaires au fonctionnement du paiement
        et de la cartographie.
      </p>
    </>
  );
}
