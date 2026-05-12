import { Stack } from 'expo-router';

export default function AccountStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontWeight: '600' },
        headerStyle: { backgroundColor: '#FFF8EE' },
        headerShadowVisible: false,
      }}
    />
  );
}
