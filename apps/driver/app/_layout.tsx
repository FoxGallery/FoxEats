import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TrpcProvider } from '@/components/trpc-provider';

export default function RootLayout() {
  return (
    <TrpcProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFF8EE' } }} />
    </TrpcProvider>
  );
}
