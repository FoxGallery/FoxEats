import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '@foxeats/auth/client';
import { Screen, Text } from '@foxeats/ui-mobile';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; error?: string }>();

  useEffect(() => {
    async function handle() {
      if (params.error) {
        router.replace({ pathname: '/(auth)/email', params: { error: String(params.error) } });
        return;
      }
      // Better Auth handles token verification via /api/auth/magic-link/verify on the web side.
      // Once the session cookie is set, we just need to bounce into the app.
      const session = await authClient.getSession();
      if (session.data?.user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/email');
      }
    }
    handle();
  }, [params, router]);

  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0B3D91" />
        <Text variant="caption" className="mt-4">
          Connexion en cours…
        </Text>
      </View>
    </Screen>
  );
}
