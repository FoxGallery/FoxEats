import { useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText, Share, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

export default function UrssafScreen() {
  const trpc = useTrpc();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(
    (Math.floor(now.getMonth() / 3) + 1) as 1 | 2 | 3 | 4,
  );
  const exportQ = trpc.couriers.exportUrssaf.useQuery({ year, quarter }, { enabled: false });

  async function downloadShare() {
    const res = await exportQ.refetch();
    if (!res.data) return;
    try {
      await Share.share({
        title: res.data.filename,
        message: res.data.csv,
      });
    } catch (e) {
      Alert.alert('Erreur', (e as Error).message ?? 'Échec');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Export URSSAF' }} />
      <Screen>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Text variant="display" className="mt-4 text-[28px]">
            URSSAF
          </Text>
          <Text variant="body" className="text-ink-muted mt-1 text-[14px]">
            Export trimestriel de votre chiffre d&apos;affaires pour votre déclaration
            auto-entrepreneur.
          </Text>

          <View className="mt-6 rounded-2xl bg-white p-5">
            <RNText className="text-ink-muted text-[12px] font-medium">Année</RNText>
            <View className="mt-2 flex-row gap-2">
              {[year - 1, year, year + 1].map((y) => (
                <Pressable
                  key={y}
                  onPress={() => setYear(y)}
                  className={`flex-1 rounded-lg border py-2 ${
                    y === year ? 'border-primary bg-primary' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <RNText
                    className={`text-center text-[14px] ${y === year ? 'text-white' : 'text-ink'}`}
                  >
                    {y}
                  </RNText>
                </Pressable>
              ))}
            </View>

            <RNText className="text-ink-muted mt-4 text-[12px] font-medium">Trimestre</RNText>
            <View className="mt-2 flex-row gap-2">
              {([1, 2, 3, 4] as const).map((q) => (
                <Pressable
                  key={q}
                  onPress={() => setQuarter(q)}
                  className={`flex-1 rounded-lg border py-2 ${
                    q === quarter ? 'border-primary bg-primary' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <RNText
                    className={`text-center text-[14px] ${q === quarter ? 'text-white' : 'text-ink'}`}
                  >
                    T{q}
                  </RNText>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={downloadShare}
              disabled={exportQ.isFetching}
              className="bg-accent mt-5 h-12 items-center justify-center rounded-xl"
            >
              <RNText className="text-[14px] font-bold text-white">
                {exportQ.isFetching ? 'Préparation…' : 'Exporter le CSV'}
              </RNText>
            </Pressable>
          </View>

          {exportQ.data && (
            <View className="bg-success/10 mt-4 rounded-2xl p-5">
              <RNText className="text-success text-[14px] font-semibold">
                T{quarter} {year} · {exportQ.data.deliveriesCount} courses
              </RNText>
              <RNText className="text-ink mt-1 text-[24px] font-bold">
                {(exportQ.data.totalGrossCents / 100).toFixed(2)} €
              </RNText>
              <RNText className="text-ink-muted mt-1 text-[12px]">
                Montant à déclarer auprès de l&apos;URSSAF en BIC.
              </RNText>
            </View>
          )}
        </ScrollView>
      </Screen>
    </>
  );
}
