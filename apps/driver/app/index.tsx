import { Screen, Text, Button } from '@foxeats/ui-mobile';

export default function DriverHome() {
  return (
    <Screen>
      <Text variant="display" className="mt-10">
        FoxEats Driver
      </Text>
      <Text variant="body" className="text-ink-muted mt-2">
        Statut, offres de courses, navigation, gains → M7
      </Text>
      <Button label="Passer en ligne" variant="accent" size="lg" className="mt-8" />
    </Screen>
  );
}
