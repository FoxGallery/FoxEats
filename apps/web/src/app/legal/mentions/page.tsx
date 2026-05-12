import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mentions légales' };

export default function MentionsPage() {
  return (
    <>
      <h1 className="font-display text-ink text-3xl font-bold">Mentions légales</h1>
      <p className="text-ink-muted text-[12px]">Dernière mise à jour : 12 mai 2026</p>

      <h2>Éditeur</h2>
      <p>
        FoxEats SAS — capital social : 1 000 €<br />
        Siège social : Côte d&apos;Azur, France
        <br />
        Email : partenaires@foxeats.fr
        <br />
        SIREN : en cours d&apos;immatriculation (beta privée)
      </p>

      <h2>Directeur de la publication</h2>
      <p>Le représentant légal de FoxEats SAS.</p>

      <h2>Hébergement</h2>
      <p>
        Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
        <br />
        Données stockées dans la région UE (cdg1 — Paris).
      </p>

      <h2>Crédits</h2>
      <p>
        Cartographie : OpenStreetMap contributors, MapTiler. Polices : Cabinet Grotesk, Inter.
        Images des restaurants : photographies fournies par les restaurateurs partenaires et
        illustrations Picsum / Unsplash.
      </p>
    </>
  );
}
