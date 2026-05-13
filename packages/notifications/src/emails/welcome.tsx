import { Heading, Text, Section } from '@react-email/components';
import { EmailLayout, EmailButton } from './_layout';

export type WelcomeProps = {
  firstName?: string;
  appUrl?: string;
};

export function WelcomeEmail({ firstName, appUrl = 'https://foxeats.fr/app' }: WelcomeProps) {
  return (
    <EmailLayout preview="Bienvenue chez FoxEats — la Riviera, livrée chez vous">
      <Heading className="font-display text-ink m-0 text-[26px] font-extrabold leading-tight tracking-tight">
        {firstName ? `Bienvenue ${firstName} 👋` : 'Bienvenue chez FoxEats 👋'}
      </Heading>
      <Text className="text-inkMuted m-0 mt-3 text-[15px] leading-relaxed">
        On est ravis de vous compter parmi nous. FoxEats, c&apos;est plus de 30 restaurants curatés
        sur toute la Côte d&apos;Azur, des spécialités locales (socca, pissaladière, tropézienne…)
        et une livraison soignée en moins de 35 minutes.
      </Text>

      <EmailButton href={appUrl}>Découvrir l&apos;app</EmailButton>

      <Section className="bg-bgSubtle mt-6 rounded-2xl p-5">
        <Text className="text-brand m-0 text-[12px] font-bold uppercase tracking-widest">
          Ce qui vous attend
        </Text>
        <Text className="text-ink m-0 mt-2 text-[14px] leading-relaxed">
          🥗 Spécialités niçoises curatées
          <br />
          🛵 Livraison 28 min en moyenne
          <br />
          🌍 Interface en français, anglais, italien
          <br />
          ♻️ Anti-gaspi inclus — jusqu&apos;à -50 % sur les invendus
        </Text>
      </Section>

      <Text className="text-inkMuted mt-6 text-[13px] leading-relaxed">
        Une question ? Répondez simplement à cet email, on lit toutes les réponses.
      </Text>
    </EmailLayout>
  );
}
