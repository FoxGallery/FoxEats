import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  Text as RNText,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

const LOCALES = [
  { id: 'fr' as const, label: 'Français' },
  { id: 'en' as const, label: 'English' },
  { id: 'it' as const, label: 'Italiano' },
];

const DIETARY = [
  { id: 'halal', label: 'Halal' },
  { id: 'vegetarian', label: 'Végétarien' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Sans gluten' },
  { id: 'lactose-free', label: 'Sans lactose' },
  { id: 'nut-free', label: 'Sans fruits à coque' },
  { id: 'pork-free', label: 'Sans porc' },
] as const;

export default function ProfileScreen() {
  const trpc = useTrpc();
  const me = trpc.me.get.useQuery();
  const update = trpc.me.updateProfile.useMutation({
    onSuccess: () => me.refetch(),
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locale, setLocale] = useState<'fr' | 'en' | 'it'>('fr');
  const [dietary, setDietary] = useState<string[]>([]);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!me.data) return;
    setName(me.data.name ?? '');
    setPhone(me.data.phone ?? '');
    setLocale((me.data.locale as 'fr' | 'en' | 'it') ?? 'fr');
    setDietary((me.data.dietaryFlags as string[]) ?? []);
    setMarketing(me.data.marketingConsent);
  }, [me.data]);

  async function save() {
    try {
      await update.mutateAsync({
        name: name || undefined,
        phone: phone || null,
        locale,
        dietaryFlags: dietary as Parameters<typeof update.mutateAsync>[0]['dietaryFlags'],
        marketingConsent: marketing,
      });
      Alert.alert('Profil enregistré');
    } catch (e) {
      Alert.alert('Erreur', (e as Error).message ?? 'Échec');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Profil' }} />
      <Screen>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View className="mt-4 gap-4">
            <Labeled label="Nom">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
                placeholderTextColor="#9AA1B0"
                className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-[15px]"
              />
            </Labeled>

            <Labeled label="Email">
              <TextInput
                editable={false}
                value={me.data?.email ?? ''}
                className="text-ink-muted h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-[15px]"
              />
            </Labeled>

            <Labeled label="Téléphone (optionnel)">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+33 …"
                placeholderTextColor="#9AA1B0"
                className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-[15px]"
              />
            </Labeled>

            <Labeled label="Langue">
              <View className="flex-row gap-2">
                {LOCALES.map((l) => (
                  <Pressable
                    key={l.id}
                    onPress={() => setLocale(l.id)}
                    className={`rounded-full border px-4 py-1.5 ${
                      locale === l.id ? 'border-primary bg-primary' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <RNText
                      className={`text-[13px] ${locale === l.id ? 'text-white' : 'text-ink'}`}
                    >
                      {l.label}
                    </RNText>
                  </Pressable>
                ))}
              </View>
            </Labeled>

            <Labeled label="Régimes & allergènes">
              <View className="flex-row flex-wrap gap-2">
                {DIETARY.map((f) => {
                  const active = dietary.includes(f.id);
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() =>
                        setDietary((d) =>
                          d.includes(f.id) ? d.filter((x) => x !== f.id) : [...d, f.id],
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 ${
                        active ? 'border-accent bg-accent' : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <RNText className={`text-[12px] ${active ? 'text-white' : 'text-ink'}`}>
                        {f.label}
                      </RNText>
                    </Pressable>
                  );
                })}
              </View>
            </Labeled>

            <View className="flex-row items-start gap-3 rounded-2xl bg-white p-4">
              <Switch
                value={marketing}
                onValueChange={setMarketing}
                trackColor={{ false: '#D9DBE2', true: '#0B3D91' }}
              />
              <View className="flex-1">
                <RNText className="text-ink text-[14px]">
                  Recevoir les offres et nouveautés par email.
                </RNText>
                <RNText className="text-ink-muted mt-0.5 text-[11px]">
                  Désinscription possible à tout moment.
                </RNText>
              </View>
            </View>

            <Pressable
              onPress={save}
              disabled={update.isPending}
              className="bg-primary mt-2 h-12 items-center justify-center rounded-xl"
            >
              <RNText className="font-semibold text-white">
                {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </RNText>
            </Pressable>
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <RNText className="text-ink-muted mb-1.5 text-[12px] font-medium">{label}</RNText>
      {children}
    </View>
  );
}
