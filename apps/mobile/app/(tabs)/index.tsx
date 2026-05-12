import { ScrollView, View } from 'react-native';
import { Screen, Text } from '@foxeats/ui-mobile';

export default function HomeScreen() {
  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="py-6">
          <Text variant="caption">Livrer à</Text>
          <Text variant="title" className="mt-1">
            Promenade des Anglais, Nice
          </Text>
        </View>
        <Text variant="display" className="mt-4">
          Côte d&apos;Azur
        </Text>
        <Text variant="body" className="mt-1 text-ink-muted">
          Implémentation Home → M2
        </Text>
      </ScrollView>
    </Screen>
  );
}
