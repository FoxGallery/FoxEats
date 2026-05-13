import { Heading, Text, Section } from '@react-email/components';
import { EmailLayout, EmailButton } from './_layout';

export type OrderDeliveredProps = {
  shortCode: string;
  restaurantName: string;
  totalCents: number;
  reviewUrl: string;
};

export function OrderDeliveredEmail({
  shortCode,
  restaurantName,
  totalCents,
  reviewUrl,
}: OrderDeliveredProps) {
  return (
    <EmailLayout preview={`Commande #${shortCode} livrée — Bon appétit !`}>
      <Section className="rounded-2xl bg-gradient-to-br from-[#1FA060] to-[#0E7A60] p-6 text-center text-white">
        <Text className="m-0 text-[11px] font-bold uppercase tracking-widest text-white opacity-90">
          Commande #{shortCode}
        </Text>
        <Heading className="font-display m-0 mt-2 text-[28px] font-extrabold leading-tight tracking-tight text-white">
          Bon appétit ! 🎉
        </Heading>
        <Text className="m-0 mt-2 text-[14px] text-white opacity-90">
          Votre commande de {restaurantName} a bien été livrée.
        </Text>
      </Section>

      <Heading className="font-display text-ink m-0 mt-7 text-[20px] font-bold leading-tight tracking-tight">
        Tout s&apos;est bien passé ?
      </Heading>
      <Text className="text-inkMuted m-0 mt-2 text-[14px] leading-relaxed">
        Votre avis aide les autres clients à choisir et nous aide à améliorer la qualité. Ça prend
        30 secondes.
      </Text>

      <EmailButton href={reviewUrl}>Laisser un avis</EmailButton>

      <Section className="bg-bgSubtle mt-2 rounded-2xl p-4 text-center">
        <Text className="text-inkSubtle m-0 text-[11px] font-bold uppercase tracking-widest">
          Total payé
        </Text>
        <Text className="font-display text-ink m-0 mt-1 text-[22px] font-extrabold tracking-tight">
          {(totalCents / 100).toFixed(2)} €
        </Text>
      </Section>

      <Text className="text-inkMuted mt-6 text-[13px] leading-relaxed">
        Merci de votre confiance — on espère vous revoir vite sur FoxEats !
      </Text>
    </EmailLayout>
  );
}
