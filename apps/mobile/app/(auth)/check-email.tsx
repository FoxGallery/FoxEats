import { View, Pressable, Text as RNText } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Screen, Text } from '@foxeats/ui-mobile';

export default function CheckEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-2">
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          className="items-center"
        >
          <View className="bg-accent/15 h-20 w-20 items-center justify-center rounded-full">
            <RNText className="text-[28px]">✉️</RNText>
          </View>
          <Text variant="display" className="mt-6 text-center text-[32px] leading-[1.15]">
            Vérifiez{'\n'}votre boîte mail
          </Text>
          <Text
            variant="body"
            className="text-ink-muted mt-3 text-center text-[15px] leading-[1.5]"
          >
            Lien envoyé à{'\n'}
            <Text variant="body" className="text-ink font-semibold">
              {email ?? 'votre adresse'}
            </Text>
            .
          </Text>
          <Text variant="caption" className="mt-3 text-center text-[12px]">
            Valide 15 minutes, utilisable une seule fois.
          </Text>
        </MotiView>

        <Pressable onPress={() => router.replace('/(auth)/email')} className="mt-10">
          <RNText className="text-primary text-[14px] font-medium underline">
            ← Utiliser une autre adresse
          </RNText>
        </Pressable>
      </View>
    </Screen>
  );
}
