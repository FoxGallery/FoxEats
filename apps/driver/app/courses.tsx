import { ScrollView, View, Pressable, Text as RNText, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

export default function CoursesScreen() {
  const router = useRouter();
  const trpc = useTrpc();
  // Pour M5, on liste les ordres assignés au livreur courant (ready→delivered).
  // M7 ajoutera l'offer matching / accept depuis l'écran public.
  const orders = trpc.orders.myOrders.useQuery({ limit: 30 }, { refetchInterval: 15_000 });
  const pickup = trpc.orders.courierPickup.useMutation({ onSuccess: () => orders.refetch() });

  function onPickup(id: string) {
    Alert.alert('Confirmer le pickup', 'La course passe en livraison.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => pickup.mutate({ id }) },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Mes courses' }} />
      <Screen>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Text variant="display" className="mt-4 text-[28px]">
            Courses
          </Text>
          {orders.isLoading && (
            <Text variant="caption" className="mt-3">
              Chargement…
            </Text>
          )}
          {!orders.isLoading && (orders.data?.items.length ?? 0) === 0 && (
            <View className="mt-10 rounded-xl border border-dashed border-neutral-200 px-4 py-10">
              <RNText className="text-ink-muted text-center text-[13px]">
                Aucune course pour le moment.{'\n'}Passez en ligne pour recevoir des offres.
              </RNText>
            </View>
          )}

          <View className="mt-4 gap-3 pb-10">
            {orders.data?.items.map((o) => (
              <View key={o.id} className="rounded-2xl bg-white p-4">
                <View className="flex-row justify-between">
                  <RNText className="text-ink-subtle text-[11px] uppercase tracking-wider">
                    #{o.shortCode}
                  </RNText>
                  <RNText className="text-ink-muted text-[11px]">{o.status}</RNText>
                </View>
                <RNText className="text-ink mt-2 text-[14px] font-medium">
                  {((o.totalCents ?? 0) / 100).toFixed(2)} € · Gain estimé{' '}
                  {((o.deliveryFeeCents + (o.tipCents ?? 0)) / 100).toFixed(2)} €
                </RNText>
                <Pressable
                  onPress={() => router.push({ pathname: '/o/[id]', params: { id: o.id } })}
                  className="mt-3 h-10 items-center justify-center rounded-lg border border-neutral-200"
                >
                  <RNText className="text-ink text-[13px] font-medium">Détails</RNText>
                </Pressable>
                {o.status === 'courier_assigned' && (
                  <Pressable
                    onPress={() => onPickup(o.id)}
                    disabled={pickup.isPending}
                    className="bg-primary mt-2 h-10 items-center justify-center rounded-lg"
                  >
                    <RNText className="text-[13px] font-medium text-white">
                      Récupérée — démarrer livraison
                    </RNText>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}
