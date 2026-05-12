import { ScrollView, View, Pressable, Text as RNText, Alert, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

export default function CoursesScreen() {
  const router = useRouter();
  const trpc = useTrpc();
  const offers = trpc.couriers.offers.useQuery({ limit: 10 }, { refetchInterval: 8_000 });
  const orders = trpc.orders.myOrders.useQuery({ limit: 30 }, { refetchInterval: 15_000 });
  const accept = trpc.orders.courierAccept.useMutation({
    onSuccess: () => {
      offers.refetch();
      orders.refetch();
    },
  });
  const pickup = trpc.orders.courierPickup.useMutation({ onSuccess: () => orders.refetch() });
  const [refreshing, setRefreshing] = useState(false);

  const active = (orders.data?.items ?? []).filter((o) =>
    ['courier_assigned', 'picked_up', 'in_delivery'].includes(o.status),
  );

  function onAccept(id: string, shortCode: string) {
    Alert.alert('Accepter cette course ?', `Commande #${shortCode}`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Accepter', onPress: () => accept.mutate({ id }) },
    ]);
  }

  function onPickup(id: string) {
    Alert.alert('Récupéré au resto', 'La course passe en livraison.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => pickup.mutate({ id }) },
    ]);
  }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([offers.refetch(), orders.refetch()]);
    setRefreshing(false);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Mes courses' }} />
      <Screen>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0B3D91" />
          }
        >
          <Text variant="display" className="mt-4 text-[28px]">
            Courses
          </Text>

          {/* Offres disponibles */}
          <RNText className="text-ink-muted mt-6 text-[11px] font-semibold uppercase tracking-wider">
            Offres ({offers.data?.items.length ?? 0})
          </RNText>
          {!offers.data?.items.length && (
            <View className="mt-3 rounded-xl border border-dashed border-neutral-200 px-4 py-6">
              <RNText className="text-ink-muted text-center text-[12px]">
                Aucune offre pour l&apos;instant.{'\n'}Restez en ligne pour en recevoir.
              </RNText>
            </View>
          )}
          <View className="mt-3 gap-3">
            {offers.data?.items.map((o) => (
              <View
                key={o.id}
                className="bg-accent/[0.06] rounded-2xl p-4 ring-1"
                style={{ borderWidth: 1, borderColor: 'rgba(255,107,92,0.3)' }}
              >
                <View className="flex-row items-center justify-between">
                  <RNText className="text-accent text-[11px] uppercase tracking-wider">
                    Nouvelle offre · #{o.shortCode}
                  </RNText>
                  <RNText className="font-display text-ink text-[16px] font-bold">
                    +{(o.estimatedGainCents / 100).toFixed(2)} €
                  </RNText>
                </View>
                <RNText className="text-ink mt-2 text-[14px] font-medium">
                  {o.restaurantName}
                </RNText>
                <RNText className="text-ink-muted text-[12px]">
                  {o.restaurantCity}
                  {o.distanceKm != null ? ` · ${o.distanceKm.toFixed(1)} km` : ''}
                </RNText>
                <Pressable
                  onPress={() => onAccept(o.id, o.shortCode)}
                  disabled={accept.isPending}
                  className="bg-accent mt-3 h-11 items-center justify-center rounded-xl"
                >
                  <RNText className="text-[14px] font-bold text-white">Accepter</RNText>
                </Pressable>
              </View>
            ))}
          </View>

          {/* En cours */}
          {active.length > 0 && (
            <>
              <RNText className="text-ink-muted mt-8 text-[11px] font-semibold uppercase tracking-wider">
                En cours ({active.length})
              </RNText>
              <View className="mt-3 gap-3 pb-10">
                {active.map((o) => (
                  <View key={o.id} className="rounded-2xl bg-white p-4">
                    <View className="flex-row justify-between">
                      <RNText className="text-ink-subtle text-[11px] uppercase tracking-wider">
                        #{o.shortCode}
                      </RNText>
                      <RNText className="text-ink-muted text-[11px]">{o.status}</RNText>
                    </View>
                    <RNText className="text-ink mt-2 text-[14px] font-medium">
                      Gain {((o.deliveryFeeCents + (o.tipCents ?? 0)) / 100).toFixed(2)} €
                    </RNText>
                    <Pressable
                      onPress={() => router.push({ pathname: '/o/[id]', params: { id: o.id } })}
                      className="mt-3 h-10 items-center justify-center rounded-lg border border-neutral-200"
                    >
                      <RNText className="text-ink text-[13px] font-medium">
                        Détails & navigation
                      </RNText>
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
            </>
          )}
        </ScrollView>
      </Screen>
    </>
  );
}
