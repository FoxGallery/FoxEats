import { useEffect, useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';
import {
  startCourierLocationTracking,
  stopCourierLocationTracking,
  isCourierLocationTracking,
} from '@/lib/location-task';

export default function DriverHome() {
  const router = useRouter();
  const trpc = useTrpc();
  const me = trpc.couriers.me.useQuery();
  const status = trpc.couriers.status.useQuery(undefined, { refetchInterval: 30_000 });
  const setStatus = trpc.couriers.setStatus.useMutation({ onSuccess: () => status.refetch() });

  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    isCourierLocationTracking().then(setTracking);
  }, []);

  const isOnline = status.data?.status === 'online' || status.data?.status === 'on_delivery';

  async function toggleOnline(next: boolean) {
    if (next) {
      const result = await startCourierLocationTracking();
      if (!result.ok) {
        Alert.alert(
          'Permission requise',
          result.reason === 'background_denied'
            ? 'La permission de localisation en arrière-plan est nécessaire pour partager votre position pendant les courses.'
            : 'Veuillez autoriser FoxEats Driver à accéder à votre position.',
        );
        return;
      }
      setTracking(true);
      setStatus.mutate({ status: 'online' });
    } else {
      await stopCourierLocationTracking();
      setTracking(false);
      setStatus.mutate({ status: 'offline' });
    }
  }

  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="mt-8">
          <Text variant="display" className="text-[36px]">
            FoxEats Driver
          </Text>
          <Text variant="caption" className="mt-1">
            {me.data ? `Bonjour ${me.data.userId.slice(0, 6)}` : 'Connectez-vous pour démarrer'}
          </Text>
        </View>

        <View className="mt-8 rounded-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <RNText className="font-display text-ink text-[20px] font-bold">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </RNText>
              <RNText className="text-ink-muted mt-1 text-[12px]">
                {isOnline
                  ? 'Vous recevez les offres de courses.'
                  : 'Passez en ligne pour recevoir les offres.'}
              </RNText>
            </View>
            <Switch
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: '#D9DBE2', true: '#FF6B5C' }}
              thumbColor="#fff"
            />
          </View>
          {tracking && (
            <View className="bg-accent/10 mt-4 flex-row items-center gap-2 rounded-lg px-3 py-2">
              <View className="bg-accent h-2 w-2 rounded-full" />
              <RNText className="text-accent text-[12px]">Partage de position actif</RNText>
            </View>
          )}
        </View>

        <View className="mt-4 rounded-2xl bg-white p-5">
          <RNText className="text-ink-muted text-[12px] uppercase tracking-widest">
            Aujourd&apos;hui
          </RNText>
          <View className="mt-3 flex-row justify-between">
            <Stat top="0" bottom="Courses" />
            <Stat top="0,00 €" bottom="Gains" />
            <Stat top="—" bottom="Avis" />
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/courses')}
          className="bg-primary mt-4 h-12 items-center justify-center rounded-xl"
        >
          <RNText className="font-semibold text-white">Voir mes courses</RNText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Stat({ top, bottom }: { top: string; bottom: string }) {
  return (
    <View className="items-center">
      <RNText className="font-display text-ink text-[20px] font-bold">{top}</RNText>
      <RNText className="text-ink-muted text-[11px]">{bottom}</RNText>
    </View>
  );
}
