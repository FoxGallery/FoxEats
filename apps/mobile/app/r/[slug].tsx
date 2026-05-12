import { useState } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  Text as RNText,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { ChevronDown, ArrowLeft, Star, Clock, Truck, MapPin } from 'lucide-react-native';
import { useTrpc } from '@/lib/trpc';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@foxeats/api';

type BySlugOutput = inferRouterOutputs<AppRouter>['restaurants']['bySlug'];
type Category = BySlugOutput['categories'][number];

export default function RestaurantDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const trpc = useTrpc();
  const query = trpc.restaurants.bySlug.useQuery({ slug: String(slug) });
  const reviews = trpc.reviews.forRestaurant.useQuery({ slug: String(slug), limit: 5 });

  if (query.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF5A4A" />
        </View>
      </Screen>
    );
  }
  if (!query.data) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text variant="body">Restaurant introuvable.</Text>
        </View>
      </Screen>
    );
  }

  const data: BySlugOutput = query.data;
  const { restaurant: r, categories } = data;
  const cuisines = (r.cuisines as string[]) ?? [];

  return (
    <View className="bg-bg flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
        <View>
          {r.coverUrl && (
            <Image
              source={{ uri: r.coverUrl }}
              className="aspect-[16/9] w-full"
              resizeMode="cover"
            />
          )}
          <Pressable
            onPress={() => router.back()}
            className="bg-bg-elevated absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full"
            accessibilityLabel="Retour"
          >
            <ArrowLeft size={18} color="#0E1116" strokeWidth={2.4} />
          </Pressable>
          <View className="absolute right-4 top-12 flex-row gap-2">
            {r.isLocalSpecialty && (
              <View className="bg-brand rounded-full px-2.5 py-1">
                <RNText className="text-[10px] font-bold uppercase tracking-wider text-white">
                  Spé. Riviera
                </RNText>
              </View>
            )}
            {r.isAntiWasteEnabled && (
              <View className="bg-success rounded-full px-2.5 py-1">
                <RNText className="text-[10px] font-bold uppercase tracking-wider text-white">
                  Anti-gaspi
                </RNText>
              </View>
            )}
          </View>
        </View>

        <View className="-mt-10 px-5 pb-10">
          <View className="bg-bg-elevated border-border rounded-3xl border p-5">
            <Text variant="display" className="text-[28px] leading-[1.05]">
              {r.name}
            </Text>
            {r.description && (
              <RNText className="text-ink-muted mt-2 text-[14px] leading-[1.5]">
                {r.description}
              </RNText>
            )}

            {cuisines.length > 0 && (
              <View className="mt-3 flex-row flex-wrap gap-1.5">
                {cuisines.slice(0, 5).map((c) => (
                  <View key={c} className="bg-bg-subtle rounded-full px-2.5 py-1">
                    <RNText className="text-ink-muted text-[11px] font-medium">{c}</RNText>
                  </View>
                ))}
              </View>
            )}

            <View className="bg-bg-subtle mt-4 flex-row rounded-2xl">
              <StatBox
                icon={<Star size={12} color="#FF5A4A" fill="#FF5A4A" strokeWidth={0} />}
                top={Number(r.rating ?? 0).toFixed(1)}
                bottom={`${r.ratingCount} avis`}
              />
              <View className="bg-border w-px" />
              <StatBox
                icon={<Clock size={12} color="#0E1116" strokeWidth={2.4} />}
                top={`${r.prepTimeMinMinutes}–${r.prepTimeMaxMinutes}'`}
                bottom="préparation"
              />
              <View className="bg-border w-px" />
              <StatBox
                icon={<Truck size={12} color="#0E1116" strokeWidth={2.4} />}
                top={
                  r.deliveryFeeCents === 0
                    ? 'Offerte'
                    : `${(r.deliveryFeeCents / 100).toFixed(2)} €`
                }
                bottom="livraison"
              />
            </View>

            <View className="mt-3 flex-row items-center gap-1.5">
              <MapPin size={12} color="#5E6470" strokeWidth={2.2} />
              <RNText className="text-ink-muted text-[12px]">
                {r.street}, {r.postalCode} {r.city}
              </RNText>
            </View>
          </View>

          <Text variant="display" className="mt-8 text-[22px]">
            Carte
          </Text>
          <View className="mt-3 gap-3">
            {categories.map((cat) => (
              <CategoryAccordion key={cat.id} category={cat} />
            ))}
          </View>

          <View className="mt-10">
            <View className="flex-row items-baseline justify-between">
              <Text variant="display" className="text-[22px]">
                Avis
              </Text>
              {(reviews.data?.aggregate.count ?? 0) > 0 && (
                <RNText className="text-ink-muted text-[12px]">
                  ★ {reviews.data?.aggregate.avg.toFixed(1)} · {reviews.data?.aggregate.count}
                </RNText>
              )}
            </View>
            <View className="mt-4 gap-3">
              {reviews.data?.items.length === 0 && (
                <View className="border-border rounded-2xl border border-dashed p-6">
                  <RNText className="text-ink-muted text-center text-[13px]">
                    Pas encore d&apos;avis. Soyez le premier !
                  </RNText>
                </View>
              )}
              {reviews.data?.items.map((rv) => (
                <View key={rv.id} className="bg-bg-elevated border-border rounded-2xl border p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-brand-soft h-9 w-9 items-center justify-center rounded-full">
                      <RNText className="text-brand text-[13px] font-bold">
                        {rv.authorInitial}
                      </RNText>
                    </View>
                    <View className="flex-1">
                      <RNText className="text-ink text-[14px] font-semibold">
                        {rv.authorName ?? 'Anonyme'}
                      </RNText>
                      <RNText className="text-ink-subtle text-[11px]">
                        {new Date(rv.createdAt).toLocaleDateString('fr-FR')}
                      </RNText>
                    </View>
                    <View className="bg-ink flex-row items-center gap-1 rounded-lg px-2 py-1">
                      <Star size={10} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                      <RNText className="text-ink-inverse text-[12px] font-bold">
                        {rv.rating}
                      </RNText>
                    </View>
                  </View>
                  {rv.comment && (
                    <RNText className="text-ink-muted mt-3 text-[13px] leading-[1.5]">
                      {rv.comment}
                    </RNText>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({ icon, top, bottom }: { icon: React.ReactNode; top: string; bottom: string }) {
  return (
    <View className="flex-1 items-center justify-center py-3">
      <View className="flex-row items-center gap-1">
        {icon}
        <RNText className="font-display text-ink text-[14px] font-bold">{top}</RNText>
      </View>
      <RNText className="text-ink-subtle mt-0.5 text-[10px]">{bottom}</RNText>
    </View>
  );
}

function CategoryAccordion({ category }: { category: Category }) {
  const [open, setOpen] = useState(true);
  return (
    <View className="bg-bg-elevated border-border overflow-hidden rounded-2xl border">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between gap-3 px-5 py-4"
      >
        <View>
          <RNText className="font-display text-ink text-[17px] font-bold">{category.name}</RNText>
          <RNText className="text-ink-subtle mt-0.5 text-[11px]">
            {category.items.length} plat{category.items.length > 1 ? 's' : ''}
          </RNText>
        </View>
        <View
          className="bg-bg-subtle h-8 w-8 items-center justify-center rounded-full"
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        >
          <ChevronDown size={14} color="#5E6470" strokeWidth={2.4} />
        </View>
      </Pressable>
      {open && (
        <View>
          {category.items.map((it, i) => (
            <View
              key={it.id}
              className={`flex-row gap-3 px-5 py-3 ${i < category.items.length - 1 ? 'border-border border-b' : ''}`}
            >
              <View className="flex-1">
                <View className="flex-row flex-wrap items-center gap-1.5">
                  <RNText className="text-ink text-[15px] font-semibold">{it.name}</RNText>
                  {it.isPopular && <Badge label="Pop." color="brand" />}
                  {it.isLocalSpecialty && <Badge label="Spé." color="accent" />}
                  {it.isVegan && <Badge label="Vegan" color="success" />}
                </View>
                {it.description && (
                  <RNText
                    className="text-ink-muted mt-1 text-[12px] leading-[1.45]"
                    numberOfLines={2}
                  >
                    {it.description}
                  </RNText>
                )}
                <RNText className="text-ink mt-2 text-[14px] font-bold">
                  {(it.priceCents / 100).toFixed(2)} €
                </RNText>
              </View>
              {it.photoUrl && (
                <Image source={{ uri: it.photoUrl }} className="h-20 w-20 rounded-xl" />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: 'brand' | 'accent' | 'success' | 'danger';
}) {
  const cls: Record<typeof color, string> = {
    brand: 'bg-brand-soft',
    accent: 'bg-accent-soft',
    success: 'bg-success-soft',
    danger: 'bg-danger-soft',
  };
  const txt: Record<typeof color, string> = {
    brand: 'text-brand',
    accent: 'text-accent',
    success: 'text-success',
    danger: 'text-danger',
  };
  return (
    <View className={`rounded-full px-1.5 py-0.5 ${cls[color]}`}>
      <RNText className={`text-[9px] font-bold uppercase tracking-wider ${txt[color]}`}>
        {label}
      </RNText>
    </View>
  );
}
