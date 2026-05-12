import type { Metadata } from 'next';

export const metadata: Metadata = { title: "Conditions Générales d'Utilisation" };

export default function CguPage() {
  return (
    <>
      <h1 className="font-display text-ink text-3xl font-bold">
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-ink-muted text-[12px]">Dernière mise à jour : 12 mai 2026</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d&apos;Utilisation (« CGU ») régissent l&apos;accès au
        site et aux applications FoxEats (« le Service ») édités par FoxEats SAS.
      </p>

      <h2>2. Accès au Service</h2>
      <p>
        L&apos;accès au Service est gratuit. L&apos;Utilisateur déclare avoir la capacité juridique
        de contracter et être âgé d&apos;au moins 18 ans.
      </p>

      <h2>3. Comptes utilisateurs</h2>
      <p>
        La création d&apos;un compte implique l&apos;acceptation pleine et entière des présentes
        CGU. L&apos;Utilisateur est responsable de la confidentialité de ses identifiants.
      </p>

      <h2>4. Comportement</h2>
      <p>
        L&apos;Utilisateur s&apos;engage à utiliser le Service de bonne foi. Tout comportement
        abusif (commandes répétitives sans paiement, fraude, harcèlement) pourra entraîner la
        suspension du compte.
      </p>

      <h2>5. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du Service est protégé par le droit d&apos;auteur. Toute
        reproduction sans autorisation est interdite.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        FoxEats agit en qualité de plateforme de mise en relation. La responsabilité de la qualité
        des plats relève des restaurateurs partenaires.
      </p>

      <h2>7. Modification</h2>
      <p>
        Les CGU peuvent être modifiées à tout moment. L&apos;Utilisateur sera notifié des
        changements majeurs.
      </p>

      <h2>8. Droit applicable</h2>
      <p>Le présent contrat est soumis au droit français. Tribunal compétent : Nice.</p>
    </>
  );
}
