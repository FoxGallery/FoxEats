import { useState } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  Text as RNText,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';
import { ArrowLeft } from 'lucide-react-native';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'En attente du paiement',
  placed: 'Commande passée',
  accepted_by_restaurant: 'Acceptée par le restaurant',
  rejected_by_restaurant: 'Refusée',
  preparing: 'En préparation',
  ready_for_pickup: 'Prête',
  courier_assigned: 'Livreur en route',
  picked_up: 'En livraison',
  in_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const STEPS = [
  { status: 'placed', label: 'Commande reçue', icon: '🧾' },
  { status: 'accepted_by_restaurant', label: 'Acceptée', icon: '✅' },
  { status: 'preparing', label: 'En préparation', icon: '👨‍🍳' },
  { status: 'ready_for_pickup', label: 'Prête', icon: '📦' },
  { status: 'in_delivery', label: 'En livraison', icon: '🛵' },
  { status: 'delivered', label: 'Livrée', icon: '🎉' },
];

const RANK: Record<string, number> = {
  pending_payment: -1,
  placed: 0,
  accepted_by_restaurant: 1,
  rejected_by_restaurant: 1,
  preparing: 2,
  ready_for_pickup: 3,
  courier_assigned: 4,
  picked_up: 4,
  in_delivery: 4,
  delivered: 5,
  cancelled: 99,
  refunded: 99,
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const trpc = useTrpc();
  const order = trpc.orders.get.useQuery({ id: String(id) }, { refetchInterval: 10_000 });
  const cancel = trpc.orders.cancel.useMutation({ onSuccess: () => order.refetch() });

  if (order.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0B3D91" />
        </View>
      </Screen>
    );
  }
  if (!order.data) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text variant="body">Commande introuvable.</Text>
        </View>
      </Screen>
    );
  }

  const o = order.data;
  const items =
    (o.items as Array<{ name: string; quantity: number; unitPriceCents: number }>) ?? [];
  const currentRank = RANK[o.status] ?? 0;
  const isCancelled = ['cancelled', 'refunded', 'rejected_by_restaurant'].includes(o.status);
  const isCancellable =
    ['pending_payment', 'placed', 'accepted_by_restaurant'].includes(o.status) && !o.acceptedAt;

  function doCancel() {
    Alert.alert('Annuler la commande', 'Confirmer ? Le remboursement est automatique.', [
      { text: 'Garder', style: 'cancel' },
      {
        text: 'Annuler',
        style: 'destructive',
        onPress: () => cancel.mutate({ id: o.id, reason: 'cancelled_by_customer' }),
      },
    ]);
  }

  return (
    <View className="bg-surface flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentInsetAdjustmentBehavior="never">
        <View className="px-5 pb-10 pt-12">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ArrowLeft size={18} color="#0A1733" />
          </Pressable>

          <View
            className="mt-4 rounded-3xl bg-gradient-to-br p-6"
            style={{ backgroundColor: '#0B3D91' }}
          >
            <RNText className="text-[10px] uppercase tracking-widest text-white/80">
              Commande #{o.shortCode}
            </RNText>
            <RNText className="font-display mt-1 text-[28px] font-bold leading-tight text-white">
              {STATUS_LABELS[o.status] ?? o.status}
            </RNText>
            <RNText className="mt-1 text-[13px] text-white/90">
              {(o.totalCents / 100).toFixed(2)} € · {items.length} plat{items.length > 1 ? 's' : ''}
            </RNText>
          </View>

          {!isCancelled && (
            <View className="mt-4 rounded-2xl bg-white p-5">
              <RNText className="text-ink font-semibold">Suivi</RNText>
              <View className="mt-4 gap-3">
                {STEPS.map((step, idx) => {
                  const reached = currentRank >= idx;
                  const active = currentRank === idx;
                  return (
                    <View key={step.status} className="flex-row items-center gap-3">
                      <View
                        style={{
                          backgroundColor: active ? '#FF6B5C' : reached ? '#0B3D91' : '#EEEFF2',
                        }}
                        className="h-9 w-9 items-center justify-center rounded-full"
                      >
                        <RNText className="text-[14px]">{step.icon}</RNText>
                      </View>
                      <RNText
                        className={`text-[14px] ${
                          active ? 'text-ink font-bold' : reached ? 'text-ink' : 'text-ink-muted'
                        }`}
                      >
                        {step.label}
                      </RNText>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View className="mt-4 rounded-2xl bg-white p-5">
            <RNText className="text-ink font-semibold">Récapitulatif</RNText>
            <View className="mt-3 gap-1">
              {items.map((it, i) => (
                <View key={i} className="flex-row justify-between py-1">
                  <RNText className="text-ink flex-1 text-[14px]">
                    {it.quantity}× {it.name}
                  </RNText>
                  <RNText className="text-ink text-[14px] font-medium">
                    {((it.unitPriceCents * it.quantity) / 100).toFixed(2)} €
                  </RNText>
                </View>
              ))}
            </View>
            <View className="mt-3 border-t border-neutral-100 pt-3">
              <Row label="Sous-total" cents={o.subtotalCents} />
              <Row label="Frais de service" cents={o.serviceFeeCents} />
              <Row label="Livraison" cents={o.deliveryFeeCents} />
              {o.tipCents > 0 && <Row label="Pourboire livreur" cents={o.tipCents} />}
              {o.discountCents > 0 && <Row label="Remise" cents={-o.discountCents} highlight />}
              <View className="mt-2 flex-row justify-between border-t border-neutral-100 pt-2">
                <RNText className="text-ink font-semibold">Total</RNText>
                <RNText className="text-ink font-semibold">
                  {(o.totalCents / 100).toFixed(2)} €
                </RNText>
              </View>
            </View>
          </View>

          {isCancellable && (
            <View className="border-danger/30 bg-danger/[0.03] mt-4 rounded-2xl border p-5">
              <RNText className="text-danger font-semibold">Annuler la commande</RNText>
              <RNText className="text-ink-muted mt-1 text-[12px]">
                Possible jusqu&apos;à l&apos;acceptation par le restaurant. Remboursement
                automatique.
              </RNText>
              <Pressable
                onPress={doCancel}
                disabled={cancel.isPending}
                className="border-danger mt-3 h-10 items-center justify-center rounded-lg border"
              >
                <RNText className="text-danger text-[13px] font-medium">
                  {cancel.isPending ? 'Annulation…' : 'Annuler ma commande'}
                </RNText>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, cents, highlight }: { label: string; cents: number; highlight?: boolean }) {
  return (
    <View className="flex-row justify-between py-0.5">
      <RNText className="text-ink-muted text-[13px]">{label}</RNText>
      <RNText className={`text-[13px] ${highlight ? 'text-success' : 'text-ink'}`}>
        {cents < 0 ? '-' : ''}
        {(Math.abs(cents) / 100).toFixed(2)} €
      </RNText>
    </View>
  );
}
