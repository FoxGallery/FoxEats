import { Screen, Text } from '@foxeats/ui-mobile';

export default function OrdersScreen() {
  return (
    <Screen>
      <Text variant="display" className="mt-6">Commandes</Text>
      <Text variant="body" className="mt-1 text-ink-muted">Historique + commandes en cours → M4</Text>
    </Screen>
  );
}
