import { Heading, Text, Section } from '@react-email/components';
import { EmailLayout, EmailButton } from './_layout';

export type RefundProps = {
  shortCode: string;
  restaurantName: string;
  refundCents: number;
  reason?: string;
  orderUrl: string;
};

export function RefundEmail({
  shortCode,
  restaurantName,
  refundCents,
  reason,
  orderUrl,
}: RefundProps) {
  return (
    <EmailLayout preview={`Remboursement émis pour la commande #${shortCode}`}>
      <Section className="bg-bgSubtle rounded-2xl p-6 text-center">
        <Text className="text-inkSubtle m-0 text-[11px] font-bold uppercase tracking-widest">
          Commande #{shortCode}
        </Text>
        <Heading className="font-display text-ink m-0 mt-2 text-[24px] font-extrabold leading-tight tracking-tight">
          Remboursement émis
        </Heading>
        <Text className="font-display text-brand m-0 mt-3 text-[36px] font-extrabold leading-none tracking-tight">
          {(refundCents / 100).toFixed(2)} €
        </Text>
        <Text className="text-inkMuted m-0 mt-2 text-[13px]">
          crédités sur votre moyen de paiement
        </Text>
      </Section>

      <Text className="text-ink m-0 mt-6 text-[15px] leading-relaxed">Bonjour,</Text>
      <Text className="text-inkMuted m-0 mt-3 text-[14px] leading-relaxed">
        Un remboursement de <strong className="text-ink">{(refundCents / 100).toFixed(2)} €</strong>{' '}
        a été émis pour votre commande chez <strong className="text-ink">{restaurantName}</strong>.
      </Text>
      {reason && (
        <Section className="border-brand bg-brandSoft mt-4 rounded-xl border-l-4 p-4">
          <Text className="text-brand m-0 text-[11px] font-bold uppercase tracking-widest">
            Motif
          </Text>
          <Text className="text-ink m-0 mt-1 text-[13px] leading-relaxed">{reason}</Text>
        </Section>
      )}

      <Text className="text-inkMuted mt-4 text-[13px] leading-relaxed">
        Le remboursement apparaît généralement sur votre compte sous 5 à 10 jours ouvrés, selon
        votre banque.
      </Text>

      <EmailButton href={orderUrl}>Voir le détail</EmailButton>

      <Text className="text-inkSubtle mt-2 text-[12px] leading-relaxed">
        Une question sur ce remboursement ? Répondez à cet email, notre équipe support FR répond
        sous 2 h en heures ouvrées.
      </Text>
    </EmailLayout>
  );
}
