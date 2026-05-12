import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0B3D91] via-[#1a4ba8] to-[#FF6B5C] opacity-90" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-start justify-center px-6 py-24 text-white">
        <span className="mb-6 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-md ring-1 ring-white/20">
          Côte d&apos;Azur · Nice · Cannes · Antibes · Monaco · Saint-Tropez
        </span>
        <h1 className="font-display text-6xl leading-[1.05] tracking-tight md:text-8xl">
          La table de la
          <br />
          <span className="text-[#FF6B5C]">Riviera</span>, à votre porte.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/80 md:text-xl">
          FoxEats livre les meilleures adresses du sud de la France en quelques minutes. Spécialités locales,
          restaurateurs sélectionnés, livreurs équitablement rémunérés.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="rounded-xl bg-white px-6 py-3 font-medium text-[#0B3D91] shadow-lg transition hover:bg-white/95"
          >
            Commander maintenant
          </Link>
          <Link
            href="/partners"
            className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-medium backdrop-blur-md transition hover:bg-white/15"
          >
            Devenir restaurant partenaire
          </Link>
        </div>
        <p className="mt-16 text-sm text-white/60">
          Site en construction · v0 · cahier des charges dans <code className="rounded bg-white/10 px-1">docs/SPEC.md</code>
        </p>
      </div>
    </main>
  );
}
