import { useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText } from 'react-native';
import { Stack, Link } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

type Period = 'day' | 'week' | 'month';

export default function EarningsScreen() {
  const trpc = useTrpc();
  const [period, setPeriod] = useState<Period>('week');
  const earnings = trpc.couriers.earnings.useQuery({ period }, { refetchInterval: 30_000 });

  return (
    <>
      <Stack.Screen options={{ title: 'Gains' }} />
      <Screen>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Text variant="display" className="mt-4 text-[28px]">
            Mes gains
          </Text>

          <View className="mt-4 flex-row gap-1 rounded-full bg-neutral-100 p-1">
            {(['day', 'week', 'month'] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 items-center rounded-full py-2 ${period === p ? 'bg-white' : ''}`}
              >
                <RNText
                  className={`text-[12px] font-medium ${period === p ? 'text-ink' : 'text-ink-muted'}`}
                >
                  {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
                </RNText>
              </Pressable>
            ))}
          </View>

          <View className="mt-5 rounded-3xl p-6" style={{ backgroundColor: '#0B3D91' }}>
            <RNText className="text-[11px] uppercase tracking-widest text-white/70">
              Total brut
            </RNText>
            <RNText className="font-display mt-1 text-[44px] font-bold text-white">
              {((earnings.data?.totalCents ?? 0) / 100).toFixed(2).replace('.', ',')} €
            </RNText>
            <RNText className="mt-1 text-[12px] text-white/80">
              {earnings.data?.deliveriesCount ?? 0} course
              {(earnings.data?.deliveriesCount ?? 0) > 1 ? 's' : ''}
            </RNText>
          </View>

          <View className="mt-4 flex-row gap-3">
            <Kpi
              label="Pourboires"
              value={`${((earnings.data?.tipsCents ?? 0) / 100).toFixed(2)} €`}
            />
            <Kpi
              label="Moy./course"
              value={`${((earnings.data?.avgPerDeliveryCents ?? 0) / 100).toFixed(2)} €`}
            />
          </View>

          <View className="mt-4 rounded-2xl bg-white p-5">
            <RNText className="text-ink text-[14px] font-semibold">Reversement Stripe</RNText>
            <RNText className="text-ink-muted mt-2 text-[12px]">
              Vos gains sont reversés chaque lundi sur votre IBAN. La période en cours est
              consolidée puis virée automatiquement par Stripe Connect.
            </RNText>
          </View>

          <Link href="/urssaf" asChild>
            <Pressable className="mt-4 h-12 items-center justify-center rounded-xl border border-neutral-200 bg-white">
              <RNText className="text-ink text-[14px] font-medium">
                Export URSSAF trimestriel
              </RNText>
            </Pressable>
          </Link>
        </ScrollView>
      </Screen>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4">
      <RNText className="text-ink-muted text-[10px] uppercase tracking-widest">{label}</RNText>
      <RNText className="font-display text-ink mt-1 text-[20px] font-bold">{value}</RNText>
    </View>
  );
}
