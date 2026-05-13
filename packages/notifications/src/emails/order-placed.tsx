import { Heading, Text, Section, Row, Column, Hr } from '@react-email/components';
import { EmailLayout, EmailButton } from './_layout';

export type OrderItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type OrderPlacedProps = {
  shortCode: string;
  restaurantName: string;
  items: OrderItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  serviceFeeCents: number;
  tipCents: number;
  discountCents: number;
  totalCents: number;
  trackingUrl: string;
  etaMinutes?: number;
};

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;

export function OrderPlacedEmail({
  shortCode,
  restaurantName,
  items,
  subtotalCents,
  deliveryFeeCents,
  serviceFeeCents,
  tipCents,
  discountCents,
  totalCents,
  trackingUrl,
  etaMinutes = 35,
}: OrderPlacedProps) {
  return (
    <EmailLayout preview={`Commande #${shortCode} confirmée — ${restaurantName}`}>
      {/* Status banner */}
      <Section className="from-brand to-accent rounded-2xl bg-gradient-to-br p-6 text-center text-white">
        <Text className="m-0 text-[11px] font-bold uppercase tracking-widest text-white opacity-90">
          Commande #{shortCode}
        </Text>
        <Heading className="font-display m-0 mt-2 text-[24px] font-extrabold leading-tight tracking-tight text-white">
          Commande confirmée ✓
        </Heading>
        <Text className="m-0 mt-2 text-[14px] text-white opacity-90">
          Arrivée estimée dans environ <strong>{etaMinutes} minutes</strong>
        </Text>
      </Section>

      <Heading className="font-display text-ink m-0 mt-7 text-[18px] font-bold tracking-tight">
        {restaurantName}
      </Heading>

      {/* Items */}
      <Section className="border-border bg-bgSubtle mt-4 rounded-2xl border p-4">
        {items.map((it, i) => (
          <Row key={i} className="py-1">
            <Column className="text-ink text-[13px]">
              <strong>{it.quantity}×</strong> {it.name}
            </Column>
            <Column className="text-ink text-right text-[13px] font-semibold">
              {fmt(it.unitPriceCents * it.quantity)}
            </Column>
          </Row>
        ))}
      </Section>

      {/* Totals */}
      <Section className="mt-4">
        <SummaryRow label="Sous-total" value={fmt(subtotalCents)} />
        <SummaryRow label="Frais de service" value={fmt(serviceFeeCents)} />
        <SummaryRow label="Livraison" value={fmt(deliveryFeeCents)} />
        {tipCents > 0 && <SummaryRow label="Pourboire livreur" value={fmt(tipCents)} />}
        {discountCents > 0 && (
          <SummaryRow label="Remise" value={`-${fmt(discountCents)}`} highlight />
        )}
        <Hr className="border-border my-3" />
        <Row>
          <Column className="font-display text-ink text-[16px] font-bold">Total</Column>
          <Column className="font-display text-ink text-right text-[20px] font-extrabold tracking-tight">
            {fmt(totalCents)}
          </Column>
        </Row>
      </Section>

      <EmailButton href={trackingUrl}>Suivre ma commande</EmailButton>

      <Text className="text-inkSubtle mt-2 text-center text-[12px]">
        Suivez votre commande en temps réel dans l&apos;app FoxEats.
      </Text>
    </EmailLayout>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Row className="py-0.5">
      <Column className="text-inkMuted text-[13px]">{label}</Column>
      <Column
        className={`text-right text-[13px] ${highlight ? 'text-brand font-semibold' : 'text-ink'}`}
      >
        {value}
      </Column>
    </Row>
  );
}
