import { Screen, Text } from '@foxeats/ui-mobile';

export default function AccountScreen() {
  return (
    <Screen>
      <Text variant="display" className="mt-6">
        Compte
      </Text>
      <Text variant="body" className="text-ink-muted mt-1">
        Profil, adresses, FoxPass, FoxCoins → M1/M11
      </Text>
    </Screen>
  );
}
