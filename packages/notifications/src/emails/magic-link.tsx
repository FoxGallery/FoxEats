import { Heading, Text, Section, Link } from '@react-email/components';
import { EmailLayout, EmailButton } from './_layout';

export type MagicLinkProps = {
  url: string;
  expiresInMinutes?: number;
};

export function MagicLinkEmail({ url, expiresInMinutes = 15 }: MagicLinkProps) {
  return (
    <EmailLayout preview="Votre lien de connexion FoxEats">
      <Heading className="font-display text-ink m-0 text-[26px] font-extrabold leading-tight tracking-tight">
        Votre lien de connexion
      </Heading>
      <Text className="text-inkMuted m-0 mt-3 text-[15px] leading-relaxed">
        Cliquez sur le bouton ci-dessous pour vous connecter à FoxEats. Ce lien est valable{' '}
        <strong className="text-ink">{expiresInMinutes} minutes</strong> et utilisable une seule
        fois.
      </Text>

      <EmailButton href={url}>Se connecter</EmailButton>

      <Section className="bg-bgSubtle mt-2 rounded-xl p-4">
        <Text className="text-inkSubtle m-0 text-[11px] font-semibold uppercase tracking-widest">
          Lien direct
        </Text>
        <Text className="text-inkMuted m-0 mt-1 break-all text-[12px]">
          <Link href={url} className="text-brand underline">
            {url}
          </Link>
        </Text>
      </Section>

      <Text className="text-inkSubtle mt-6 text-[12px] leading-relaxed">
        Vous n&apos;avez pas demandé ce lien ? Ignorez simplement cet email — personne ne pourra
        accéder à votre compte sans cliquer sur le lien.
      </Text>
    </EmailLayout>
  );
}
