import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  Pressable,
  Text as RNText,
  Image,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { Search } from 'lucide-react-native';
import { useTrpc } from '@/lib/trpc';

type RestaurantCard = {
  id: string;
  slug: string;
  name: string;
  coverUrl: string | null;
  cuisines: unknown;
  rating: string | null;
  ratingCount: number;
  prepTimeMinMinutes: number;
  prepTimeMaxMinutes: number;
  deliveryFeeCents: number;
  city: string;
};

const QUICK_FILTERS = [
  { id: 'antiWaste', label: 'Anti-gaspi' },
  { id: 'localSpecialty', label: "Spé. Côte d'Azur" },
  { id: 'halal', label: 'Halal' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Végétarien' },
] as const;

export default function BrowseScreen() {
  const router = useRouter();
  const trpc = useTrpc();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filters, setFilters] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 220);
    return () => clearTimeout(id);
  }, [q]);

  const search = trpc.restaurants.search.useQuery(
    { q: debounced, limit: 30 },
    { enabled: debounced.length > 0 },
  );
  const list = trpc.restaurants.list.useQuery(
    {
      antiWaste: filters.has('antiWaste') || undefined,
      localSpecialty: filters.has('localSpecialty') || undefined,
      halal: filters.has('halal') || undefined,
      dietary: filters.has('vegan')
        ? ['vegan']
        : filters.has('vegetarian')
          ? ['vegetarian']
          : undefined,
      sort: 'rating',
      limit: 30,
    },
    { enabled: debounced.length === 0 },
  );

  function toggle(id: string) {
    setFilters((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const items: RestaurantCard[] =
    debounced.length > 0
      ? ((search.data?.items as RestaurantCard[] | undefined) ?? [])
      : ((list.data?.items as RestaurantCard[] | undefined) ?? []);

  return (
    <Screen>
      <View className="-mx-5 px-5 pb-3">
        <Text variant="display" className="mt-2 text-[28px]">
          Explorer
        </Text>
        <View className="mt-3 h-12 flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4">
          <Search size={18} color="#9AA1B0" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Pizza, sushi, socca…"
            placeholderTextColor="#9AA1B0"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="text-ink flex-1 text-[15px]"
          />
        </View>

        {debounced.length === 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
          >
            {QUICK_FILTERS.map((f) => {
              const active = filters.has(f.id);
              return (
                <Pressable
                  key={f.id}
                  onPress={() => toggle(f.id)}
                  className={`rounded-full border px-4 py-1.5 ${
                    active ? 'border-primary bg-primary' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <RNText className={`text-[12px] ${active ? 'text-white' : 'text-ink'}`}>
                    {f.label}
                  </RNText>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={
          <View className="px-5 py-10">
            <RNText className="text-ink-muted text-center text-[13px]">
              {debounced.length > 0
                ? `Aucun résultat pour "${debounced}".`
                : 'Aucun restaurant pour ces filtres.'}
            </RNText>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 80 }}
        renderItem={({ item: r }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/r/[slug]', params: { slug: r.slug } })}
            className="-mx-5 px-5"
          >
            <View className="flex-row gap-3 rounded-2xl bg-white p-3">
              {r.coverUrl && (
                <Image source={{ uri: r.coverUrl }} className="h-20 w-20 rounded-xl" />
              )}
              <View className="flex-1 justify-center">
                <View className="flex-row items-center justify-between">
                  <RNText className="text-ink flex-1 font-semibold" numberOfLines={1}>
                    {r.name}
                  </RNText>
                  <RNText className="text-accent ml-2 text-[12px] font-semibold">
                    ★ {Number(r.rating ?? 0).toFixed(1)}
                  </RNText>
                </View>
                <RNText className="text-ink-muted mt-0.5 text-[12px]" numberOfLines={1}>
                  {(r.cuisines as string[]).slice(0, 3).join(' · ')} · {r.city}
                </RNText>
                <RNText className="text-ink-subtle mt-0.5 text-[11px]">
                  {r.prepTimeMinMinutes}–{r.prepTimeMaxMinutes} min ·{' '}
                  {(r.deliveryFeeCents / 100).toFixed(2)} € livraison
                </RNText>
              </View>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}
