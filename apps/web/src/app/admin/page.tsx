'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function AdminHome() {
  const stats = trpc.admin.stats.useQuery(undefined, { refetchInterval: 10_000 });
  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="font-display text-ink text-3xl font-bold tracking-tight">
        Vue d&apos;ensemble
      </h1>
      <p className="text-ink-muted mt-1 text-[14px]">Mise à jour toutes les 10 secondes.</p>

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Commandes live" value={stats.data?.liveOrders ?? 0} accent />
        <Kpi label="Livreurs en ligne" value={stats.data?.onlineCouriers ?? 0} />
        <Kpi label="Restos actifs" value={stats.data?.activeRestaurants ?? 0} />
        <Kpi
          label="Restos pending"
          value={stats.data?.pendingRestaurants ?? 0}
          warn={Boolean(stats.data?.pendingRestaurants)}
        />
        <Kpi label="CA 24h" value={fmtCents(stats.data?.todayRevenueCents ?? 0)} />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ActionCard
          href="/admin/restaurants?status=pending"
          title="Restaurants en attente de validation"
          subtitle={`${stats.data?.pendingRestaurants ?? 0} à modérer`}
          tone="accent"
        />
        <ActionCard
          href="/admin/live"
          title="Monitoring opérationnel"
          subtitle="Carte des courses et livreurs en temps réel"
          tone="primary"
        />
        <ActionCard
          href="/admin/disputes"
          title="Litiges & remboursements"
          subtitle="Recherche par numéro de commande"
          tone="warn"
        />
        <ActionCard
          href="/admin/couriers?kycStatus=pending"
          title="KYC livreurs à valider"
          subtitle="Documents + IBAN à vérifier"
          tone="ink"
        />
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  warn?: boolean;
}) {
  const cls = accent
    ? 'bg-gradient-to-br from-brand to-accent text-white ring-transparent'
    : warn
      ? 'bg-warn/10 text-ink ring-warn/30'
      : 'bg-bg-elevated text-ink ring-border';
  return (
    <div className={`rounded-2xl p-4 shadow-sm ring-1 ${cls}`}>
      <p
        className={`text-[11px] uppercase tracking-widest ${
          accent ? 'text-white/80' : 'text-ink-muted'
        }`}
      >
        {label}
      </p>
      <p className="font-display mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  subtitle,
  tone,
}: {
  href: string;
  title: string;
  subtitle: string;
  tone: 'accent' | 'primary' | 'warn' | 'ink';
}) {
  const tones = {
    accent: 'from-accent/20 to-accent/5 hover:from-accent/30',
    primary: 'from-brand/20 to-brand/5 hover:from-brand/30',
    warn: 'from-warn/20 to-warn/5 hover:from-warn/30',
    ink: 'from-ink/15 to-ink/5 hover:from-ink/25',
  };
  return (
    <Link
      href={href}
      className={`ring-border block rounded-2xl bg-gradient-to-br p-5 ring-1 transition ${tones[tone]}`}
    >
      <h3 className="font-display text-ink text-lg font-semibold">{title}</h3>
      <p className="text-ink-muted mt-1 text-[13px]">{subtitle}</p>
    </Link>
  );
}

function fmtCents(cents: number) {
  return (cents / 100).toFixed(0) + ' €';
}
