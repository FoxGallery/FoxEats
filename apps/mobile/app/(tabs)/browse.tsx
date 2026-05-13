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
import { Screen } from '@foxeats/ui-mobile';
import { Search, Star, Leaf, MapPin, Heart, Sprout, Salad, SearchX } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
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

const QUICK_FILTERS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'antiWaste', label: 'Anti-gaspi', icon: Leaf },
  { id: 'localSpecialty', label: 'Spé. Riviera', icon: MapPin },
  { id: 'halal', label: 'Halal', icon: Heart },
  { id: 'vegan', label: 'Vegan', icon: Sprout },
  { id: 'vegetarian', label: 'Végétarien', icon: Salad },
];

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
      <View className="-mx-5 px-5 pb-2">
        <RNText className="font-display text-ink mt-1 text-[28px] font-extrabold tracking-tight">
          Explorer
        </RNText>
        <RNText className="text-ink-muted mt-0.5 text-[13px]">
          Trouvez votre prochain plat sur la Riviera.
        </RNText>

        <View className="border-border bg-bg-elevated mt-4 h-12 flex-row items-center gap-3 rounded-2xl border px-4">
          <Search size={18} color="#8A909B" strokeWidth={2.2} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Pizza, sushi, socca…"
            placeholderTextColor="#8A909B"
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
            contentContainerStyle={{ gap: 8, paddingVertical: 14, paddingHorizontal: 0 }}
          >
            {QUICK_FILTERS.map((f) => {
              const active = filters.has(f.id);
              const Icon = f.icon;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => toggle(f.id)}
                  className={`h-10 flex-row items-center gap-1.5 rounded-full border px-4 ${
                    active ? 'bg-ink border-ink' : 'bg-bg-elevated border-border'
                  }`}
                >
                  <Icon size={13} color={active ? '#FFFFFF' : '#0E1116'} strokeWidth={2.4} />
                  <RNText
                    className={`text-[13px] font-semibold ${active ? 'text-ink-inverse' : 'text-ink'}`}
                  >
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
          <View className="border-border bg-bg-elevated -mx-5 mx-5 mt-4 items-center rounded-3xl border border-dashed px-4 py-12">
            <View className="bg-bg-subtle h-14 w-14 items-center justify-center rounded-2xl">
              <SearchX size={22} color="#8A909B" strokeWidth={2} />
            </View>
            <RNText className="font-display text-ink mt-4 text-[16px] font-bold">
              {debounced.length > 0
                ? `Aucun résultat pour « ${debounced} »`
                : 'Aucun restaurant pour ces filtres.'}
            </RNText>
            <RNText className="text-ink-muted mt-1 text-center text-[13px]">
              Essayez un autre mot-clé ou retirez un filtre.
            </RNText>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 100, paddingTop: 4 }}
        renderItem={({ item: r }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/r/[slug]', params: { slug: r.slug } })}
            className="-mx-5 px-5"
          >
            <View className="bg-bg-elevated border-border flex-row gap-3 rounded-2xl border p-3">
              {r.coverUrl && (
                <Image
                  source={{ uri: r.coverUrl }}
                  className="h-20 w-20 rounded-xl"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1 justify-center">
                <View className="flex-row items-center justify-between gap-2">
                  <RNText
                    className="font-display text-ink flex-1 text-[15px] font-semibold"
                    numberOfLines={1}
                  >
                    {r.name}
                  </RNText>
                  <View className="bg-ink flex-row items-center gap-0.5 rounded-md px-1.5 py-0.5">
                    <Star size={9} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                    <RNText className="text-ink-inverse text-[11px] font-bold">
                      {Number(r.rating ?? 0).toFixed(1)}
                    </RNText>
                  </View>
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
