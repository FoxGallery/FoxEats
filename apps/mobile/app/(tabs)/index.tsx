import { useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';
import {
  Search,
  MapPin,
  ChevronDown,
  Star,
  Clock,
  Sparkles,
  Salad,
  UtensilsCrossed,
  Pizza,
  Fish,
  Beef,
  Apple,
  Leaf,
  Cake,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

const CATEGORIES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'Tout', icon: Sparkles },
  { id: 'niçoise', label: 'Niçois', icon: Salad },
  { id: 'italian', label: 'Italien', icon: UtensilsCrossed },
  { id: 'pizza', label: 'Pizza', icon: Pizza },
  { id: 'japanese', label: 'Japonais', icon: Fish },
  { id: 'burger', label: 'Burger', icon: Beef },
  { id: 'healthy', label: 'Healthy', icon: Apple },
  { id: 'vegan', label: 'Vegan', icon: Leaf },
  { id: 'dessert', label: 'Dessert', icon: Cake },
];

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
        <View className="flex-row items-center justify-between px-5 pt-1">
          <View className="flex-row items-center gap-2">
            <View className="bg-brand-soft h-10 w-10 items-center justify-center rounded-full">
              <MapPin size={16} color="#FF5A4A" strokeWidth={2.4} />
            </View>
            <Pressable
              onPress={() => {
                const arr = cities.data ?? [];
                if (arr.length === 0) return;
                const idx = arr.indexOf(city ?? '');
                const next = arr[(idx + 1) % arr.length] ?? null;
                setCity(next === city ? null : next);
              }}
            >
              <RNText className="text-ink-subtle text-[10px] font-semibold uppercase tracking-widest">
                Livrer à
              </RNText>
              <View className="flex-row items-center gap-1">
                <RNText className="font-display text-ink text-[16px] font-bold">
                  {city ?? "Côte d'Azur"}
                </RNText>
                <ChevronDown size={14} color="#0E1116" strokeWidth={2.4} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        <Pressable
          onPress={() => router.push('/(tabs)/browse')}
          className="border-border bg-bg-elevated mx-5 mt-4 h-14 flex-row items-center gap-3 rounded-2xl border px-4"
        >
          <Search size={18} color="#8A909B" strokeWidth={2.2} />
          <RNText className="text-ink-muted text-[14px]">Rechercher un plat, un resto…</RNText>
        </Pressable>

        {/* Categories chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 16 }}
        >
          {CATEGORIES.map((c) => {
            const active = cuisine === c.id;
            const Icon = c.icon;
            const tint = active ? '#FFFFFF' : '#0E1116';
            return (
              <Pressable
                key={c.id}
                onPress={() => setCuisine(c.id)}
                className={`h-10 flex-row items-center gap-1.5 rounded-full border px-4 ${
                  active ? 'bg-ink border-ink' : 'bg-bg-elevated border-border'
                }`}
              >
                <Icon size={14} color={tint} strokeWidth={2.2} />
                <RNText
                  className={`text-[13px] font-semibold ${
                    active ? 'text-ink-inverse' : 'text-ink'
                  }`}
                >
                  {c.label}
                </RNText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Popular */}
        <View className="mt-2 px-5">
          <View className="flex-row items-baseline justify-between">
            <RNText className="font-display text-ink text-[22px] font-bold">Les meilleurs</RNText>
            <RNText className="text-ink-muted text-[12px]">{city ?? "Côte d'Azur"}</RNText>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingTop: 14 }}
        >
          {popular.data?.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/r/[slug]', params: { slug: r.slug } })}
              className="w-[220px]"
            >
              <View className="bg-bg-subtle relative aspect-[4/3] overflow-hidden rounded-2xl">
                {r.coverUrl && (
                  <Image
                    source={{ uri: r.coverUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                )}
                <View className="bg-ink/90 absolute right-2 top-2 flex-row items-center gap-0.5 rounded-md px-2 py-0.5">
                  <Star size={9} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                  <RNText className="text-ink-inverse text-[10px] font-bold">
                    {Number(r.rating ?? 0).toFixed(1)}
                  </RNText>
                </View>
              </View>
              <View className="mt-2 px-1">
                <RNText
                  className="font-display text-ink text-[15px] font-semibold"
                  numberOfLines={1}
                >
                  {r.name}
                </RNText>
                <RNText className="text-ink-muted mt-0.5 text-[11px]" numberOfLines={1}>
                  {(r.cuisines as string[]).slice(0, 2).join(' · ')} · {r.city}
                </RNText>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* All restaurants */}
        <View className="mt-8 px-5 pb-32">
          <View className="flex-row items-baseline justify-between">
            <RNText className="font-display text-ink text-[22px] font-bold">Tous les restos</RNText>
            <RNText className="text-ink-muted text-[12px]">
              {list.data?.items.length ?? 0} adresses
            </RNText>
          </View>
          <View className="mt-4 gap-7">
            {list.data?.items.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => router.push({ pathname: '/r/[slug]', params: { slug: r.slug } })}
              >
                <View className="bg-bg-subtle relative aspect-[16/10] overflow-hidden rounded-2xl">
                  {r.coverUrl && (
                    <Image
                      source={{ uri: r.coverUrl }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  )}
                  {r.isLocalSpecialty && (
                    <View className="bg-brand absolute left-3 top-3 rounded-full px-2.5 py-1">
                      <RNText className="text-[10px] font-bold uppercase tracking-wider text-white">
                        Spé. Riviera
                      </RNText>
                    </View>
                  )}
                  {r.isAntiWasteEnabled && (
                    <View className="bg-success absolute right-3 top-3 rounded-full px-2.5 py-1">
                      <RNText className="text-[10px] font-bold uppercase tracking-wider text-white">
                        Anti-gaspi
                      </RNText>
                    </View>
                  )}
                </View>
                <View className="mt-3 flex-row items-start justify-between gap-3 px-1">
                  <View className="flex-1">
                    <RNText
                      className="font-display text-ink text-[17px] font-semibold"
                      numberOfLines={1}
                    >
                      {r.name}
                    </RNText>
                    <View className="mt-1 flex-row items-center gap-1.5">
                      <Clock size={11} color="#5E6470" strokeWidth={2.2} />
                      <RNText className="text-ink-muted text-[12px]">
                        {r.prepTimeMinMinutes}–{r.prepTimeMaxMinutes} min
                      </RNText>
                      <RNText className="text-ink-muted text-[12px]">·</RNText>
                      <RNText className="text-ink-muted text-[12px]">
                        {r.deliveryFeeCents === 0
                          ? 'Livraison offerte'
                          : `${(r.deliveryFeeCents / 100).toFixed(2)} € livraison`}
                      </RNText>
                    </View>
                  </View>
                  <View className="bg-ink flex-row items-center gap-1 rounded-lg px-2 py-1">
                    <Star size={10} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                    <RNText className="text-ink-inverse text-[12px] font-bold">
                      {Number(r.rating ?? 0).toFixed(1)}
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
