import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Conditions Générales de Vente' };

export default function CgvPage() {
  return (
    <>
      <h1 className="font-display text-ink text-3xl font-bold">Conditions Générales de Vente</h1>
      <p className="text-ink-muted text-[12px]">Dernière mise à jour : 12 mai 2026</p>

      <h2>1. Préambule</h2>
      <p>
        Les présentes CGV régissent la vente de plats par les restaurateurs partenaires (« Vendeurs
        ») via la plateforme FoxEats à des consommateurs particuliers (« Clients »).
      </p>

      <h2>2. Commande</h2>
      <p>
        La commande est ferme dès validation du paiement. Le Client reçoit une confirmation par
        email et peut suivre l&apos;état de sa commande en temps réel.
      </p>

      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en euros TTC. Le total inclut le prix des plats, les frais de service
        (8%), les frais de livraison définis par le restaurateur et la TVA applicable (10% pour la
        restauration).
      </p>

      <h2>4. Paiement</h2>
      <p>
        Le paiement s&apos;effectue exclusivement en ligne via Stripe (Apple Pay, Google Pay, carte
        bancaire, SEPA). Le débit intervient à l&apos;acceptation de la commande par le restaurant.
      </p>

      <h2>5. Annulation et remboursement</h2>
      <p>
        Le Client peut annuler sa commande sans frais dans les 2 minutes suivant l&apos;acceptation
        par le restaurant. Au-delà, l&apos;annulation peut être refusée.
      </p>

      <h2>6. Livraison</h2>
      <p>
        Les délais de livraison sont communiqués à titre indicatif. FoxEats met en œuvre ses
        meilleurs efforts pour respecter ces délais.
      </p>

      <h2>7. Allergènes</h2>
      <p>
        Les allergènes sont indiqués sur chaque plat. Le Client est invité à consulter ces
        informations avant commande.
      </p>

      <h2>8. Service client</h2>
      <p>
        Pour toute réclamation : <a href="mailto:support@foxeats.fr">support@foxeats.fr</a>. Délai
        de réponse maximum : 24h ouvrées.
      </p>
    </>
  );
}
