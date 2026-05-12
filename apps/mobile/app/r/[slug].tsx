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
import { ChevronDown, ArrowLeft } from 'lucide-react-native';
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
          <ActivityIndicator color="#0B3D91" />
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
  const photos = (r.photos as string[]) ?? [];
  const cuisines = (r.cuisines as string[]) ?? [];

  return (
    <View className="bg-surface flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
        <View>
          {r.coverUrl && <Image source={{ uri: r.coverUrl }} className="aspect-[16/10] w-full" />}
          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-white"
            accessibilityLabel="Retour"
          >
            <ArrowLeft size={18} color="#0A1733" />
          </Pressable>
          {r.isLocalSpecialty && (
            <View className="bg-accent absolute left-4 top-14 ml-12 rounded-full px-2.5 py-1">
              <RNText className="text-[10px] font-semibold uppercase tracking-wider text-white">
                Spé. Côte d&apos;Azur
              </RNText>
            </View>
          )}
        </View>

        <View className="px-5 pb-10 pt-5">
          <Text variant="display" className="text-[32px] leading-[1.1]">
            {r.name}
          </Text>
          {r.description && (
            <RNText className="text-ink-muted mt-2 text-[14px] leading-[1.5]">
              {r.description}
            </RNText>
          )}

          <View className="mt-3 flex-row flex-wrap gap-2">
            {cuisines.map((c) => (
              <View key={c} className="rounded-full bg-neutral-100 px-3 py-1">
                <RNText className="text-ink-muted text-[11px] font-medium">{c}</RNText>
              </View>
            ))}
          </View>

          <View className="mt-5 flex-row gap-3 rounded-2xl bg-white p-4">
            <Stat
              top={`★ ${Number(r.rating ?? 0).toFixed(1)}`}
              bottom={`${r.ratingCount} avis`}
              color="text-accent"
            />
            <View className="w-px bg-neutral-100" />
            <Stat
              top={`${r.prepTimeMinMinutes}–${r.prepTimeMaxMinutes} min`}
              bottom="Préparation"
            />
            <View className="w-px bg-neutral-100" />
            <Stat
              top={
                r.deliveryFeeCents === 0 ? 'Gratuit' : `${(r.deliveryFeeCents / 100).toFixed(2)} €`
              }
              bottom="Livraison"
            />
          </View>

          <RNText className="text-ink-muted mt-3 text-[12px]">
            📍 {r.street}, {r.postalCode} {r.city}
          </RNText>

          {photos.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 16 }}
            >
              {photos.map((p, i) => (
                <Image key={i} source={{ uri: p }} className="h-32 w-48 rounded-xl" />
              ))}
            </ScrollView>
          )}

          <Text variant="display" className="mt-6 text-[24px]">
            Carte
          </Text>
          <View className="mt-3 gap-2">
            {categories.map((cat) => (
              <CategoryAccordion key={cat.id} category={cat} />
            ))}
          </View>

          <View className="mt-8">
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
            <View className="mt-3 gap-2">
              {reviews.data?.items.length === 0 && (
                <View className="rounded-xl border border-dashed border-neutral-200 p-5">
                  <RNText className="text-ink-muted text-center text-[13px]">
                    Pas encore d&apos;avis. Soyez le premier !
                  </RNText>
                </View>
              )}
              {reviews.data?.items.map((rv) => (
                <View key={rv.id} className="rounded-2xl bg-white p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-primary/10 h-9 w-9 items-center justify-center rounded-full">
                      <RNText className="text-primary text-[14px] font-semibold">
                        {rv.authorInitial}
                      </RNText>
                    </View>
                    <View className="flex-1">
                      <RNText className="text-ink text-[14px] font-medium">
                        {rv.authorName ?? 'Anonyme'}
                      </RNText>
                      <RNText className="text-ink-subtle text-[11px]">
                        {new Date(rv.createdAt).toLocaleDateString('fr-FR')}
                      </RNText>
                    </View>
                    <View className="bg-ink rounded-lg px-2 py-1">
                      <RNText className="text-[11px] font-semibold text-white">
                        ★ {rv.rating}
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

function Stat({ top, bottom, color }: { top: string; bottom: string; color?: string }) {
  return (
    <View className="flex-1 items-center">
      <RNText className={`font-display text-[15px] font-bold ${color ?? 'text-ink'}`}>{top}</RNText>
      <RNText className="text-ink-muted text-[10px]">{bottom}</RNText>
    </View>
  );
}

function CategoryAccordion({ category }: { category: Category }) {
  const [open, setOpen] = useState(true);
  return (
    <View className="overflow-hidden rounded-2xl bg-white">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between gap-3 px-5 py-4"
      >
        <View>
          <RNText className="font-display text-ink text-[16px] font-semibold">
            {category.name}
          </RNText>
          <RNText className="text-ink-muted mt-0.5 text-[11px]">
            {category.items.length} plats
          </RNText>
        </View>
        <View
          className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100"
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        >
          <ChevronDown size={14} color="#5B6478" />
        </View>
      </Pressable>
      {open && (
        <View>
          {category.items.map((it, i) => (
            <View
              key={it.id}
              className={`flex-row gap-4 px-5 py-3 ${i < category.items.length - 1 ? 'border-b border-neutral-100' : ''}`}
            >
              <View className="flex-1">
                <RNText className="text-ink text-[15px] font-semibold">{it.name}</RNText>
                {it.description && (
                  <RNText
                    className="text-ink-muted mt-1 text-[12px] leading-[1.4]"
                    numberOfLines={2}
                  >
                    {it.description}
                  </RNText>
                )}
                <View className="mt-2 flex-row flex-wrap items-center gap-2">
                  <RNText className="text-ink text-[14px] font-semibold">
                    {(it.priceCents / 100).toFixed(2)} €
                  </RNText>
                  {it.isLocalSpecialty && <Badge label="Spé. locale" color="accent" />}
                  {it.isPopular && <Badge label="Populaire" color="primary" />}
                  {it.isVegan && <Badge label="Vegan" color="success" />}
                  {it.isSpicy && <Badge label="Épicé" color="danger" />}
                </View>
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
  color: 'accent' | 'primary' | 'success' | 'danger';
}) {
  const map: Record<typeof color, string> = {
    accent: 'bg-accent/10 text-accent',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <View className={`rounded-full px-2 py-0.5 ${map[color]}`}>
      <RNText className={`text-[9px] font-semibold uppercase tracking-wider ${map[color]}`}>
        {label}
      </RNText>
    </View>
  );
}
