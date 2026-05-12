import { ScrollView, View, Pressable, Text as RNText, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'En attente du paiement',
  placed: 'Commande passée',
  accepted_by_restaurant: 'Acceptée',
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

const ACTIVE = new Set([
  'pending_payment',
  'placed',
  'accepted_by_restaurant',
  'preparing',
  'ready_for_pickup',
  'courier_assigned',
  'picked_up',
  'in_delivery',
]);

export default function OrdersScreen() {
  const router = useRouter();
  const trpc = useTrpc();
  const list = trpc.orders.myOrders.useQuery({ limit: 30 }, { refetchInterval: 15_000 });
  const [refreshing, setRefreshing] = useState(false);
  const all = list.data?.items ?? [];
  const active = all.filter((o) => ACTIVE.has(o.status));
  const past = all.filter((o) => !ACTIVE.has(o.status));

  async function onRefresh() {
    setRefreshing(true);
    await list.refetch();
    setRefreshing(false);
  }

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0B3D91" />
        }
      >
        <Text variant="display" className="mt-6 text-[32px]">
          Mes commandes
        </Text>

        {list.isLoading && (
          <Text variant="caption" className="mt-4">
            Chargement…
          </Text>
        )}
        {!list.isLoading && all.length === 0 && (
          <View className="mt-10 rounded-xl border border-dashed border-neutral-200 px-4 py-10">
            <RNText className="text-ink-muted text-center text-[13px]">
              Pas encore de commande.
            </RNText>
          </View>
        )}

        {active.length > 0 && (
          <View className="mt-6">
            <RNText className="text-ink-muted text-[11px] font-semibold uppercase tracking-wider">
              En cours
            </RNText>
            <View className="mt-3 gap-3">
              {active.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onPress={() => router.push({ pathname: '/o/[id]', params: { id: o.id } })}
                  active
                />
              ))}
            </View>
          </View>
        )}

        {past.length > 0 && (
          <View className="mt-8 pb-10">
            <RNText className="text-ink-muted text-[11px] font-semibold uppercase tracking-wider">
              Historique
            </RNText>
            <View className="mt-3 gap-3">
              {past.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onPress={() => router.push({ pathname: '/o/[id]', params: { id: o.id } })}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function OrderCard({
  order,
  onPress,
  active,
}: {
  order: { shortCode: string; status: string; totalCents: number; createdAt: Date; items: unknown };
  onPress: () => void;
  active?: boolean;
}) {
  const items = (order.items as Array<{ name: string; quantity: number }>) ?? [];
  const summary = items
    .slice(0, 3)
    .map((i) => `${i.quantity}× ${i.name}`)
    .join(' · ');
  return (
    <Pressable onPress={onPress} className="rounded-2xl bg-white p-4 active:opacity-80">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <RNText className="text-ink-subtle text-[11px] uppercase tracking-wider">
              #{order.shortCode}
            </RNText>
            {active && (
              <View className="bg-accent/10 rounded-full px-2 py-0.5">
                <RNText className="text-accent text-[9px] font-semibold uppercase tracking-wider">
                  En cours
                </RNText>
              </View>
            )}
          </View>
          <RNText className="text-ink mt-1 text-[14px] font-medium" numberOfLines={1}>
            {summary || '—'}
          </RNText>
          <RNText className="text-ink-muted mt-0.5 text-[11px]">
            {STATUS_LABELS[order.status] ?? order.status} ·{' '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </RNText>
        </View>
        <RNText className="font-display text-ink text-[15px] font-bold">
          {(order.totalCents / 100).toFixed(2)} €
        </RNText>
      </View>
    </Pressable>
  );
}
