import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { authClient } from '@foxeats/auth/client';

export default function Index() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    authClient
      .getSession()
      .then((s) => setAuthed(Boolean(s.data?.user)))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <View className="bg-surface flex-1 items-center justify-center">
        <ActivityIndicator color="#0B3D91" />
      </View>
    );
  }
  return authed ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/welcome" />;
}
