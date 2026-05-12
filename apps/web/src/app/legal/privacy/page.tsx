import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Politique de confidentialité' };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="font-display text-ink text-3xl font-bold">Politique de confidentialité</h1>
      <p className="text-ink-muted text-[12px]">Dernière mise à jour : 12 mai 2026</p>

      <h2>1. Responsable du traitement</h2>
      <p>FoxEats SAS — partenaires@foxeats.fr.</p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>Identification : email, nom, téléphone (optionnel), avatar (optionnel)</li>
        <li>Adresses de livraison et coordonnées GPS associées</li>
        <li>Préférences alimentaires (régimes, allergènes)</li>
        <li>Historique de commandes et avis</li>
        <li>
          Données de paiement (gérées exclusivement par Stripe — nous ne stockons aucun numéro de
          carte)
        </li>
        <li>Données techniques : adresse IP, user-agent, journaux d&apos;erreurs</li>
      </ul>

      <h2>3. Finalités</h2>
      <ul>
        <li>Exécution du service de livraison de repas</li>
        <li>Suivi de la commande et information du Client</li>
        <li>Lutte contre la fraude</li>
        <li>Communication produit (avec consentement)</li>
        <li>Amélioration du service (analyses statistiques anonymisées)</li>
      </ul>

      <h2>4. Base légale</h2>
      <p>
        Exécution contractuelle (commande), obligation légale (facturation), consentement
        (marketing), intérêt légitime (sécurité).
      </p>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>Compte actif : durée d&apos;utilisation + 30 jours après demande de suppression</li>
        <li>Historique de commande : 10 ans (obligations comptables)</li>
        <li>Logs techniques : 12 mois</li>
      </ul>

      <h2>6. Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de
        portabilité, d&apos;effacement et d&apos;opposition. Exercez-les via{' '}
        <a href="/app/privacy">votre espace personnel</a> ou en écrivant à dpo@foxeats.fr.
      </p>

      <h2>7. Destinataires</h2>
      <p>
        Vos données ne sont jamais vendues. Elles sont partagées uniquement avec : les restaurateurs
        partenaires (nom, adresse, plats commandés), les livreurs (nom, adresse, téléphone), les
        prestataires techniques (Stripe, Neon, Vercel, Resend, Pusher, Cloudflare R2) — tous sous
        contrat de sous-traitance conforme RGPD.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Voir notre <a href="/legal/cookies">politique cookies</a>.
      </p>

      <h2>9. Réclamation</h2>
      <p>
        Vous pouvez introduire une réclamation auprès de la CNIL (commission nationale de
        l&apos;informatique et des libertés) —{' '}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        .
      </p>
    </>
  );
}
