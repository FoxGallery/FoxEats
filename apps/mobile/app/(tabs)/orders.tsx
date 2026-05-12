import { Screen, Text } from '@foxeats/ui-mobile';

export default function OrdersScreen() {
  return (
    <Screen>
      <Text variant="display" className="mt-6">
        Commandes
      </Text>
      <Text variant="body" className="text-ink-muted mt-1">
        Historique + commandes en cours → M4
      </Text>
    </Screen>
  );
}
