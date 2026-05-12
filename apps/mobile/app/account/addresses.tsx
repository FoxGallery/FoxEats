import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText, TextInput, Alert } from 'react-native';
import { Screen, Text } from '@foxeats/ui-mobile';
import { geocode, type GeocodeResult } from '@foxeats/maps/geocode';
import { useTrpc } from '@/lib/trpc';
import { useDebouncedEffect } from '@/lib/use-debounced-effect';

export default function AddressesScreen() {
  const trpc = useTrpc();
  const list = trpc.me.addresses.useQuery();
  const create = trpc.me.createAddress.useMutation({
    onSuccess: () => list.refetch(),
  });
  const remove = trpc.me.deleteAddress.useMutation({ onSuccess: () => list.refetch() });
  const setDefault = trpc.me.setDefaultAddress.useMutation({ onSuccess: () => list.refetch() });

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [label, setLabel] = useState('');

  useDebouncedEffect(
    () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      const ctrl = new AbortController();
      geocode(query, ctrl.signal)
        .then(setResults)
        .catch(() => setResults([]));
      return () => ctrl.abort();
    },
    [query],
    220,
  );

  async function save() {
    if (!selected) return;
    try {
      await create.mutateAsync({
        label: label || undefined,
        street: selected.street,
        city: selected.city,
        postalCode: selected.postalCode,
        country: selected.country,
        coords: { lat: selected.lat, lng: selected.lng },
      });
      setQuery('');
      setSelected(null);
      setLabel('');
      setResults([]);
    } catch (e) {
      Alert.alert('Erreur', (e as Error).message ?? 'Échec');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Mes adresses' }} />
      <Screen>
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
          <Text variant="title" className="mt-4">
            Nouvelle adresse
          </Text>

          <View className="mt-3">
            <TextInput
              value={query}
              onChangeText={(v) => {
                setQuery(v);
                setSelected(null);
              }}
              placeholder="ex. 39 Promenade des Anglais, Nice"
              placeholderTextColor="#9AA1B0"
              autoCapitalize="words"
              className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-[15px]"
            />
            {results.length > 0 && !selected && (
              <View className="mt-2 overflow-hidden rounded-xl bg-white">
                {results.map((r, i) => (
                  <Pressable
                    key={`${r.lat}-${r.lng}-${i}`}
                    onPress={() => {
                      setSelected(r);
                      setQuery(r.label);
                      setResults([]);
                    }}
                    className="border-b border-neutral-100 px-4 py-3 last:border-b-0 active:bg-neutral-50"
                  >
                    <RNText className="text-ink text-[14px]">{r.street}</RNText>
                    <RNText className="text-ink-muted text-[12px]">
                      {r.postalCode} {r.city}
                    </RNText>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {selected && (
            <View className="mt-3">
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="Libellé (optionnel) — Maison, Bureau…"
                placeholderTextColor="#9AA1B0"
                className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-[15px]"
              />
              <Pressable
                onPress={save}
                disabled={create.isPending}
                className="bg-primary mt-4 h-12 items-center justify-center rounded-xl"
              >
                <RNText className="font-semibold text-white">
                  {create.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </RNText>
              </Pressable>
            </View>
          )}

          <Text variant="title" className="mt-8">
            Enregistrées
          </Text>
          <View className="mt-3 gap-2">
            {list.isLoading && <Text variant="caption">Chargement…</Text>}
            {list.data?.length === 0 && (
              <View className="rounded-xl border border-dashed border-neutral-200 px-4 py-6">
                <RNText className="text-ink-muted text-center text-[13px]">
                  Aucune adresse pour l&apos;instant.
                </RNText>
              </View>
            )}
            {list.data?.map((a) => (
              <View key={a.id} className="rounded-xl bg-white p-4">
                <View className="flex-row items-center gap-2">
                  {a.label && <RNText className="text-ink font-semibold">{a.label}</RNText>}
                  {a.isDefault && (
                    <RNText className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                      DÉFAUT
                    </RNText>
                  )}
                </View>
                <RNText className="text-ink-muted mt-1 text-[13px]">
                  {a.street}, {a.postalCode} {a.city}
                </RNText>
                <View className="mt-3 flex-row gap-4">
                  {!a.isDefault && (
                    <Pressable onPress={() => setDefault.mutate({ id: a.id })}>
                      <RNText className="text-primary text-[12px]">Par défaut</RNText>
                    </Pressable>
                  )}
                  <Pressable onPress={() => remove.mutate({ id: a.id })}>
                    <RNText className="text-danger text-[12px]">Supprimer</RNText>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}
