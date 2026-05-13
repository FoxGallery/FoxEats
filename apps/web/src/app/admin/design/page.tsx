'use client';

import { useState } from 'react';
import {
  Sparkles,
  Salad,
  Pizza,
  UtensilsCrossed,
  ArrowRight,
  Check,
  AlertTriangle,
  Star,
  Clock,
  MapPin,
  Bike,
  CalendarClock,
  Mail,
} from 'lucide-react';
import { Chip } from '@/components/ui/chip';
import { Slider } from '@/components/ui/slider';
import { BottomCta } from '@/components/ui/bottom-cta';
import { RestaurantCard } from '@/components/ui/food-card';
import { photo } from '@/lib/photos';

const COLORS = [
  { name: 'brand', token: 'bg-brand', hex: '#FF5A4A' },
  { name: 'brand-hover', token: 'bg-brand-hover', hex: '#E84A3C' },
  { name: 'brand-soft', token: 'bg-brand-soft', hex: '#FFF0EE' },
  { name: 'accent', token: 'bg-accent', hex: '#0F2A56' },
  { name: 'accent-hover', token: 'bg-accent-hover', hex: '#082046' },
  { name: 'accent-soft', token: 'bg-accent-soft', hex: '#E8EDF6' },
  { name: 'success', token: 'bg-success', hex: '#1FA060' },
  { name: 'warning', token: 'bg-warning', hex: '#D97706' },
  { name: 'danger', token: 'bg-danger', hex: '#E11D2B' },
  { name: 'ink', token: 'bg-ink', hex: '#0A0A0F' },
  { name: 'ink-muted', token: 'bg-ink-muted', hex: '#6B6E78' },
  { name: 'bg', token: 'bg-bg', hex: '#FAFAFA' },
  { name: 'bg-elevated', token: 'bg-bg-elevated', hex: '#FFFFFF' },
  { name: 'bg-subtle', token: 'bg-bg-subtle', hex: '#F2F3F5' },
];

const TYPO = [
  { token: 'font-display text-[44px]', sample: 'Display 44 — Cabinet Grotesk' },
  { token: 'font-display text-[32px]', sample: 'Display 32 — H2' },
  { token: 'font-display text-[24px]', sample: 'Display 24 — H3' },
  { token: 'font-display text-[18px] font-bold', sample: 'Display 18 — section heading' },
  { token: 'text-[17px]', sample: 'Body 17 — Inter regular' },
  { token: 'text-[15px]', sample: 'Body 15 — UI standard' },
  { token: 'text-[13px]', sample: 'Body 13 — caption' },
  { token: 'text-[11px] uppercase tracking-widest', sample: 'EYEBROW 11 UPPERCASE' },
];

const RADIUS = [
  { name: 'xs', value: '6px', cls: 'rounded-[6px]' },
  { name: 'sm', value: '10px', cls: 'rounded-[10px]' },
  { name: 'md', value: '14px', cls: 'rounded-[14px]' },
  { name: 'lg', value: '20px', cls: 'rounded-[20px]' },
  { name: 'xl', value: '28px', cls: 'rounded-[28px]' },
  { name: '2xl', value: '36px', cls: 'rounded-[36px]' },
];

const SHADOWS = [
  { name: 'xs', cls: 'shadow-xs' },
  { name: 'sm', cls: 'shadow-sm' },
  { name: 'md', cls: 'shadow-md' },
  { name: 'lg', cls: 'shadow-lg' },
  { name: 'xl', cls: 'shadow-xl' },
  { name: 'food', cls: 'shadow-food' },
];

export default function DesignSystemPage() {
  const [chipActive, setChipActive] = useState<string>('pizza');
  const [sliderVal, setSliderVal] = useState(20);

  return (
    <main className="bg-bg text-ink min-h-screen pb-24">
      <header className="border-border bg-bg/90 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-brand text-[11px] font-bold uppercase tracking-widest">
              Design system v2
            </p>
            <h1 className="font-display text-ink text-[20px] font-extrabold tracking-tight">
              FoxEats UI Check
            </h1>
          </div>
          <span className="border-border bg-bg-elevated text-ink-muted rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
            Light only
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        {/* COLORS */}
        <Section title="Couleurs" subtitle="Palette v2 — light uniquement">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {COLORS.map((c) => (
              <div
                key={c.name}
                className="border-border bg-bg-elevated shadow-xs overflow-hidden rounded-2xl border"
              >
                <div className={`h-20 w-full ${c.token}`} />
                <div className="p-3">
                  <p className="font-display text-ink text-[13px] font-bold tracking-tight">
                    {c.name}
                  </p>
                  <p className="text-ink-muted mt-0.5 font-mono text-[11px]">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* TYPOGRAPHY */}
        <Section title="Typographie" subtitle="Cabinet Grotesk display + Inter sans">
          <div className="border-border bg-bg-elevated shadow-xs space-y-3 rounded-3xl border p-6">
            {TYPO.map((t) => (
              <div key={t.sample} className="border-border border-b pb-3 last:border-0 last:pb-0">
                <p className={`text-ink ${t.token}`}>{t.sample}</p>
                <p className="text-ink-subtle mt-1 font-mono text-[10px]">{t.token}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* RADIUS */}
        <Section title="Radius" subtitle="Échelle de rayons">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {RADIUS.map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className={`border-border bg-bg-elevated shadow-xs mx-auto h-16 w-16 border ${r.cls}`}
                />
                <p className="font-display text-ink mt-2 text-[12px] font-bold">{r.name}</p>
                <p className="text-ink-muted font-mono text-[10px]">{r.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* SHADOWS */}
        <Section title="Shadows" subtitle="Élévations subtiles + signature food">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {SHADOWS.map((s) => (
              <div key={s.name} className="text-center">
                <div
                  className={`border-border bg-bg-elevated mx-auto h-20 w-full rounded-2xl border ${s.cls}`}
                />
                <p className="font-display text-ink mt-3 text-[12px] font-bold">{s.name}</p>
                <p className="text-ink-muted font-mono text-[10px]">shadow-{s.name}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* BUTTONS */}
        <Section title="Boutons" subtitle="CTA primaires, secondaires, ghost">
          <div className="border-border bg-bg-elevated shadow-xs space-y-4 rounded-3xl border p-6">
            <Row label="Primary BottomCta">
              <BottomCta label="Passer la commande" trailing={<span>24,50 €</span>} />
            </Row>
            <Row label="Ink BottomCta">
              <BottomCta tone="ink" label="Confirmer" />
            </Row>
            <Row label="Success BottomCta">
              <BottomCta tone="success" label="Payer" />
            </Row>
            <Row label="Disabled">
              <BottomCta label="Compléter les infos" disabled />
            </Row>
          </div>
        </Section>

        {/* CHIPS */}
        <Section title="Chips" subtitle="Filtres rapides, catégories">
          <div className="border-border bg-bg-elevated shadow-xs space-y-5 rounded-3xl border p-6">
            <Row label="Brand active">
              <div className="flex flex-wrap gap-2">
                <Chip active tone="brand" leading={<Sparkles size={14} strokeWidth={2.2} />}>
                  Tout
                </Chip>
                <Chip tone="brand" leading={<Salad size={14} strokeWidth={2.2} />}>
                  Niçois
                </Chip>
                <Chip tone="brand" leading={<Pizza size={14} strokeWidth={2.2} />}>
                  Pizza
                </Chip>
              </div>
            </Row>
            <Row label="Ink tone (default)">
              <div className="flex flex-wrap gap-2">
                {['pizza', 'sushi', 'pasta'].map((id) => (
                  <Chip
                    key={id}
                    active={chipActive === id}
                    onClick={() => setChipActive(id)}
                    leading={<UtensilsCrossed size={14} strokeWidth={2.2} />}
                  >
                    {id}
                  </Chip>
                ))}
              </div>
            </Row>
            <Row label="Accent / Neutral">
              <div className="flex flex-wrap gap-2">
                <Chip active tone="accent">
                  Active accent
                </Chip>
                <Chip tone="neutral">Neutral</Chip>
              </div>
            </Row>
          </div>
        </Section>

        {/* SLIDER */}
        <Section title="Slider" subtitle="Composant réutilisable, variants brand/accent">
          <div className="border-border bg-bg-elevated shadow-xs grid gap-6 rounded-3xl border p-6 sm:grid-cols-2">
            <Slider
              tone="brand"
              icon={<CalendarClock size={14} strokeWidth={2.4} className="text-brand" />}
              label="Heures par semaine"
              value={sliderVal}
              min={5}
              max={50}
              step={1}
              onChange={setSliderVal}
              format={(v) => `${v} h`}
            />
            <Slider
              tone="accent"
              icon={<Bike size={14} strokeWidth={2.4} className="text-accent" />}
              label="Courses par heure"
              value={2.5}
              min={1}
              max={4}
              step={0.1}
              onChange={() => {}}
              format={(v) => v.toFixed(1)}
            />
          </div>
        </Section>

        {/* BADGES */}
        <Section title="Badges sémantiques" subtitle="État + ton">
          <div className="border-border bg-bg-elevated shadow-xs rounded-3xl border p-6">
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand" icon={Star}>
                Featured
              </Badge>
              <Badge tone="success" icon={Check}>
                Validé
              </Badge>
              <Badge tone="warning" icon={AlertTriangle}>
                Attention
              </Badge>
              <Badge tone="danger" icon={AlertTriangle}>
                Erreur
              </Badge>
              <Badge tone="accent" icon={MapPin}>
                Côte d&apos;Azur
              </Badge>
              <Badge tone="ink" icon={Clock}>
                28 min
              </Badge>
            </div>
          </div>
        </Section>

        {/* CARDS */}
        <Section title="Cards" subtitle="Pattern v2 standard">
          <div className="grid gap-5 md:grid-cols-2">
            <RestaurantCard
              resto={{
                slug: 'demo',
                name: 'Trattoria del Sole',
                coverUrl: photo('resto-italian-1'),
                rating: 4.8,
                prepTimeMinMinutes: 25,
                prepTimeMaxMinutes: 35,
                deliveryFeeCents: 250,
                cuisines: ['Italien', 'Pizza'],
                isLocalSpecialty: true,
                isAntiWasteEnabled: false,
              }}
              href="#"
            />
            <RestaurantCard
              resto={{
                slug: 'demo2',
                name: 'Bowl & Co',
                coverUrl: photo('resto-cafe-1'),
                rating: 4.6,
                prepTimeMinMinutes: 18,
                prepTimeMaxMinutes: 28,
                deliveryFeeCents: 0,
                cuisines: ['Healthy', 'Vegan'],
                isAntiWasteEnabled: true,
              }}
              href="#"
            />
          </div>
        </Section>

        {/* GRADIENTS */}
        <Section title="Gradients signature" subtitle="Hero brand → accent">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="from-brand to-accent shadow-food relative h-40 overflow-hidden rounded-3xl bg-gradient-to-br via-[#E84838]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="relative flex h-full items-end p-5 text-white">
                <p className="font-display text-[15px] font-bold">Hero brand → accent</p>
              </div>
            </div>
            <div className="from-accent to-brand shadow-food relative h-40 overflow-hidden rounded-3xl bg-gradient-to-br via-[#1E4FA8]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_60%)]" />
              <div className="relative flex h-full items-end p-5 text-white">
                <p className="font-display text-[15px] font-bold">Hero accent → brand (couriers)</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ICONS */}
        <Section title="Icônes" subtitle="Lucide React — pas d'emojis">
          <div className="border-border bg-bg-elevated shadow-xs grid grid-cols-4 gap-3 rounded-3xl border p-6 sm:grid-cols-8">
            {[
              { Icon: Sparkles, name: 'Sparkles' },
              { Icon: MapPin, name: 'MapPin' },
              { Icon: Star, name: 'Star' },
              { Icon: Clock, name: 'Clock' },
              { Icon: Mail, name: 'Mail' },
              { Icon: ArrowRight, name: 'ArrowRight' },
              { Icon: Check, name: 'Check' },
              { Icon: Bike, name: 'Bike' },
            ].map(({ Icon, name }) => (
              <div key={name} className="text-center">
                <div className="bg-bg-subtle text-ink mx-auto grid h-12 w-12 place-items-center rounded-2xl">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <p className="text-ink-muted mt-1.5 text-[10px] font-semibold">{name}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <p className="text-brand text-[11px] font-bold uppercase tracking-widest">{title}</p>
        {subtitle && <p className="text-ink-muted mt-1 text-[13px]">{subtitle}</p>}
      </div>
      {children as any}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border border-b pb-4 last:border-0 last:pb-0">
      <p className="text-ink-subtle mb-2 text-[11px] font-bold uppercase tracking-widest">
        {label}
      </p>
      {children as any}
    </div>
  );
}

function Badge({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'ink';
  icon: typeof Star;
  children: React.ReactNode;
}) {
  const map: Record<typeof tone, string> = {
    brand: 'bg-brand-soft text-brand',
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    ink: 'bg-ink text-ink-inverse',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${map[tone]}`}
    >
      <Icon size={12} strokeWidth={2.6} />
      {children as any}
    </span>
  );
}
