import { useState } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  Text as RNText,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

export default function CourierOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const trpc = useTrpc();
  const order = trpc.orders.get.useQuery({ id: String(id) }, { refetchInterval: 10_000 });
  const pickup = trpc.orders.courierPickup.useMutation({ onSuccess: () => order.refetch() });
  const markDelivered = trpc.orders.courierMarkDelivered.useMutation({
    onSuccess: () => {
      order.refetch();
      router.replace('/courses');
    },
  });
  const [proofPlaceholder, setProofPlaceholder] = useState<string>(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  );

  if (order.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B3D91" />
        </View>
      </Screen>
    );
  }
  if (!order.data) return null;

  const o = order.data;
  const items = (o.items as Array<{ name: string; quantity: number }>) ?? [];
  const addr = o.deliveryAddress as {
    street: string;
    city: string;
    postalCode: string;
    lat: number;
    lng: number;
    instructions?: string;
  } | null;

  function openNavigation() {
    if (!addr) return;
    const url = `https://www.openstreetmap.org/directions?from=&to=${addr.lat},${addr.lng}&route=`;
    Linking.openURL(url).catch(() => Alert.alert('Erreur', "Impossible d'ouvrir la navigation"));
  }

  function confirmDelivery() {
    Alert.alert(
      'Confirmer la livraison',
      o.leaveAtDoor
        ? 'Mode "Laisser devant" : photo obligatoire.'
        : 'Photo + signature client requises.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            // M7: on envoie un placeholder. M11 wira l'upload R2 via expo-image-picker.
            markDelivered.mutate({
              id: o.id,
              photoUrl: proofPlaceholder,
              signatureUrl: o.leaveAtDoor ? undefined : proofPlaceholder,
            });
          },
        },
      ],
    );
    setProofPlaceholder(proofPlaceholder);
  }

  return (
    <>
      <Stack.Screen options={{ title: `#${o.shortCode}` }} />
      <Screen>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View className="mt-4 rounded-2xl p-5" style={{ backgroundColor: '#0B3D91' }}>
            <RNText className="text-[10px] uppercase tracking-widest text-white/80">
              Course #{o.shortCode}
            </RNText>
            <RNText className="font-display mt-1 text-[24px] font-bold text-white">
              {o.status === 'courier_assigned'
                ? 'À récupérer au resto'
                : o.status === 'in_delivery'
                  ? 'En livraison'
                  : o.status === 'delivered'
                    ? 'Livrée'
                    : o.status}
            </RNText>
            <RNText className="mt-1 text-[12px] text-white/90">
              Gain {((o.deliveryFeeCents + (o.tipCents ?? 0)) / 100).toFixed(2)} €
            </RNText>
          </View>

          <View className="mt-4 rounded-2xl bg-white p-5">
            <RNText className="text-ink-muted text-[12px] uppercase tracking-widest">
              Adresse de livraison
            </RNText>
            <RNText className="text-ink mt-2 text-[15px] font-medium">{addr?.street}</RNText>
            <RNText className="text-ink-muted text-[13px]">
              {addr?.postalCode} {addr?.city}
            </RNText>
            {addr?.instructions && (
              <View className="bg-accent/10 mt-3 rounded-lg p-3">
                <RNText className="text-ink text-[12px]">📝 {addr.instructions}</RNText>
              </View>
            )}
            {o.leaveAtDoor && (
              <View className="bg-warn/10 mt-3 rounded-lg p-3">
                <RNText className="text-warn text-[12px]">
                  ⚠ Mode &laquo; Laisser devant &raquo; — photo de la livraison obligatoire.
                </RNText>
              </View>
            )}

            <Pressable
              onPress={openNavigation}
              className="bg-primary mt-4 h-11 items-center justify-center rounded-xl"
            >
              <RNText className="text-[14px] font-semibold text-white">
                Ouvrir l&apos;itinéraire
              </RNText>
            </Pressable>
          </View>

          <View className="mt-4 rounded-2xl bg-white p-5">
            <RNText className="text-ink-muted text-[12px] uppercase tracking-widest">
              Contenu
            </RNText>
            <View className="mt-2 gap-1">
              {items.map((it, i) => (
                <RNText key={i} className="text-ink text-[14px]">
                  {it.quantity}× {it.name}
                </RNText>
              ))}
            </View>
          </View>

          {o.status === 'courier_assigned' && (
            <Pressable
              onPress={() =>
                Alert.alert('Confirmer le pickup', 'La course passe en livraison.', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Confirmer', onPress: () => pickup.mutate({ id: o.id }) },
                ])
              }
              disabled={pickup.isPending}
              className="bg-accent mt-4 h-14 items-center justify-center rounded-2xl"
            >
              <RNText className="text-[15px] font-bold text-white">Récupérée au resto ✓</RNText>
            </Pressable>
          )}

          {o.status === 'in_delivery' && (
            <Pressable
              onPress={confirmDelivery}
              disabled={markDelivered.isPending}
              className="bg-success mt-4 h-14 items-center justify-center rounded-2xl"
            >
              <RNText className="text-[15px] font-bold text-white">
                {markDelivered.isPending ? 'Envoi…' : 'Marquer livrée'}
              </RNText>
            </Pressable>
          )}

          <View className="mt-6 pb-10" />
        </ScrollView>
      </Screen>
    </>
  );
}
