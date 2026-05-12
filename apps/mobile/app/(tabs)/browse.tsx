import { Screen, Text } from '@foxeats/ui-mobile';

export default function BrowseScreen() {
  return (
    <Screen>
      <Text variant="display" className="mt-6">
        Explorer
      </Text>
      <Text variant="body" className="text-ink-muted mt-1">
        Recherche et filtres → M2
      </Text>
    </Screen>
  );
}
