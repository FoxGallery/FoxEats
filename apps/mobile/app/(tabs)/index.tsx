import { useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';
import { Search, MapPin } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'all', label: 'Tout', emoji: '🍽️', color: '#0B3D91' },
  { id: 'niçoise', label: 'Niçois', emoji: '🥗', color: '#FF6B5C' },
  { id: 'italian', label: 'Italien', emoji: '🍝', color: '#3a8c5b' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕', color: '#c8261a' },
  { id: 'japanese', label: 'Japonais', emoji: '🍱', color: '#171c2a' },
  { id: 'burger', label: 'Burger', emoji: '🍔', color: '#e6a100' },
  { id: 'healthy', label: 'Healthy', emoji: '🥑', color: '#1a8f4e' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱', color: '#4fb3a4' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰', color: '#d6336c' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const trpc = useTrpc();
  const [city, setCity] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<string>('all');

  const cities = trpc.restaurants.cities.useQuery();
  const popular = trpc.restaurants.popular.useQuery({ city: city ?? undefined, limit: 8 });
  const list = trpc.restaurants.list.useQuery({
    city: city ?? undefined,
    // @ts-expect-error narrow casting handled at runtime
    cuisine: cuisine !== 'all' ? cuisine : undefined,
    sort: 'rating',
    limit: 20,
  });

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="-mx-5"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2">
          <View className="flex-row items-center gap-2">
            <View className="bg-accent/15 h-10 w-10 items-center justify-center rounded-full">
              <MapPin size={18} color="#FF6B5C" />
            </View>
            <View>
              <RNText className="text-ink-muted text-[10px] uppercase tracking-widest">
                Livrer à
              </RNText>
              <Pressable
                onPress={() => {
                  const idx = (cities.data ?? []).indexOf(city ?? '');
                  const next = (cities.data ?? [])[(idx + 1) % (cities.data?.length || 1)] ?? null;
                  setCity(next === city ? null : next);
                }}
              >
                <RNText className="font-display text-ink text-[16px] font-bold">
                  {city ?? "Toute la Côte d'Azur"} ▾
                </RNText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Search */}
        <Pressable
          onPress={() => router.push('/(tabs)/browse')}
          className="mx-5 mt-4 h-12 flex-row items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4"
        >
          <Search size={18} color="#9AA1B0" />
          <RNText className="text-ink-subtle text-[14px]">Rechercher un plat, un resto…</RNText>
        </Pressable>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingVertical: 16 }}
        >
          {CATEGORIES.map((c) => {
            const active = cuisine === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCuisine(c.id)}
                className="items-center gap-1.5"
              >
                <View
                  style={{ backgroundColor: c.color }}
                  className={`h-14 w-14 items-center justify-center rounded-full ${active ? 'scale-110' : ''}`}
                >
                  <RNText className="text-[26px]">{c.emoji}</RNText>
                </View>
                <RNText
                  className={`text-[11px] ${active ? 'text-ink font-bold' : 'text-ink-muted'}`}
                >
                  {c.label}
                </RNText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Popular horizontal */}
        <View className="mt-2 px-5">
          <View className="flex-row items-baseline justify-between">
            <Text variant="display" className="text-[22px]">
              Les meilleurs
            </Text>
            <RNText className="text-ink-muted text-[12px]">{city ?? "Côte d'Azur"}</RNText>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingTop: 12 }}
        >
          {popular.data?.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/r/[slug]', params: { slug: r.slug } })}
              className="w-[200px] overflow-hidden rounded-2xl bg-white"
            >
              {r.coverUrl && <Image source={{ uri: r.coverUrl }} className="aspect-[4/3] w-full" />}
              <View className="p-3">
                <View className="flex-row items-center justify-between">
                  <RNText className="text-ink flex-1 text-[14px] font-semibold" numberOfLines={1}>
                    {r.name}
                  </RNText>
                  <RNText className="text-accent ml-2 text-[12px] font-semibold">
                    ★ {Number(r.rating ?? 0).toFixed(1)}
                  </RNText>
                </View>
                <RNText className="text-ink-muted mt-0.5 text-[11px]" numberOfLines={1}>
                  {(r.cuisines as string[]).slice(0, 2).join(' · ')} · {r.city}
                </RNText>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* All restaurants */}
        <View className="mt-6 px-5">
          <View className="flex-row items-baseline justify-between">
            <Text variant="display" className="text-[22px]">
              Tous les restaurants
            </Text>
            <RNText className="text-ink-muted text-[12px]">{list.data?.items.length ?? 0}</RNText>
          </View>
          <View className="mt-3 gap-4 pb-10">
            {list.data?.items.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => router.push({ pathname: '/r/[slug]', params: { slug: r.slug } })}
                className="overflow-hidden rounded-2xl bg-white"
              >
                {r.coverUrl && (
                  <View className="relative">
                    <Image source={{ uri: r.coverUrl }} className="aspect-[16/10] w-full" />
                    {r.isLocalSpecialty && (
                      <View className="bg-accent absolute left-3 top-3 rounded-full px-2.5 py-1">
                        <RNText className="text-[10px] font-semibold uppercase tracking-wider text-white">
                          Spé. Côte d&apos;Azur
                        </RNText>
                      </View>
                    )}
                    {r.isAntiWasteEnabled && (
                      <View className="bg-success absolute right-3 top-3 rounded-full px-2.5 py-1">
                        <RNText className="text-[10px] font-semibold uppercase tracking-wider text-white">
                          Anti-gaspi
                        </RNText>
                      </View>
                    )}
                  </View>
                )}
                <View className="p-4">
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <RNText
                        className="font-display text-ink text-[17px] font-semibold"
                        numberOfLines={1}
                      >
                        {r.name}
                      </RNText>
                      <RNText className="text-ink-muted mt-0.5 text-[12px]" numberOfLines={1}>
                        {(r.cuisines as string[]).slice(0, 3).join(' · ')}
                      </RNText>
                    </View>
                    <View className="bg-ink rounded-lg px-2 py-1">
                      <RNText className="text-[11px] font-semibold text-white">
                        ★ {Number(r.rating ?? 0).toFixed(1)}
                      </RNText>
                    </View>
                  </View>
                  <View className="mt-2 flex-row items-center gap-2">
                    <RNText className="text-ink-muted text-[11px]">
                      {r.prepTimeMinMinutes}–{r.prepTimeMaxMinutes} min
                    </RNText>
                    <RNText className="text-ink-muted text-[11px]">·</RNText>
                    <RNText className="text-ink-muted text-[11px]">
                      {r.deliveryFeeCents === 0
                        ? 'Livraison offerte'
                        : `${(r.deliveryFeeCents / 100).toFixed(2)} € livraison`}
                    </RNText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
