import { useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { useTrpc } from '@/lib/trpc';

const STEPS = ['Bienvenue', 'Véhicule', 'IBAN', 'KYC Stripe', 'Prêt'] as const;

const VEHICLES = [
  { id: 'bike', label: 'Vélo', icon: '🚲' },
  { id: 'ebike', label: 'Vélo élec.', icon: '⚡' },
  { id: 'scooter', label: 'Trottinette', icon: '🛴' },
  { id: 'motorbike', label: 'Moto/Scoot', icon: '🛵' },
  { id: 'car', label: 'Voiture', icon: '🚗' },
  { id: 'walk', label: 'À pied', icon: '🚶' },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const trpc = useTrpc();
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState<(typeof VEHICLES)[number]['id']>('bike');
  const [iban, setIban] = useState('');
  const updateProfile = trpc.couriers.updateProfile.useMutation();

  async function next() {
    if (step === 1) {
      await updateProfile.mutateAsync({ vehicle });
    }
    if (step === 2) {
      if (iban && !/^FR\d{2}[A-Z0-9 ]{20,30}$/i.test(iban.replace(/\s/g, ''))) {
        Alert.alert('IBAN invalide', 'Format attendu : FR76 …');
        return;
      }
      await updateProfile.mutateAsync({ iban: iban.replace(/\s/g, '') || null });
    }
    if (step === STEPS.length - 1) {
      router.replace('/');
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <View className="bg-surface flex-1">
      <Stack.Screen options={{ title: 'Démarrage', headerBackVisible: step > 0 }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1">
        <View className="px-5 pb-10 pt-4">
          {/* Stepper */}
          <View className="flex-row gap-1">
            {STEPS.map((_, i) => (
              <View
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-neutral-200'}`}
              />
            ))}
          </View>
          <RNText className="text-ink-muted mt-2 text-[11px] uppercase tracking-widest">
            Étape {step + 1} / {STEPS.length}
          </RNText>

          {step === 0 && (
            <View className="mt-6">
              <Text variant="display" className="text-[32px]">
                Bienvenue 🛵
              </Text>
              <Text variant="body" className="text-ink-muted mt-3 text-[15px] leading-[1.5]">
                Quelques étapes pour commencer à livrer sur FoxEats. Comptez 10 minutes pour la
                partie KYC Stripe.
              </Text>
              <View className="mt-6 gap-2 rounded-2xl bg-white p-5">
                <Bullet>Gains versés chaque lundi par virement</Bullet>
                <Bullet>Pourboires 100% reversés</Bullet>
                <Bullet>Liberté de choisir vos zones et horaires</Bullet>
                <Bullet>Auto-entrepreneur — export URSSAF trimestriel</Bullet>
              </View>
            </View>
          )}

          {step === 1 && (
            <View className="mt-6">
              <Text variant="display" className="text-[28px]">
                Votre véhicule
              </Text>
              <View className="mt-5 flex-row flex-wrap gap-3">
                {VEHICLES.map((v) => (
                  <Pressable
                    key={v.id}
                    onPress={() => setVehicle(v.id)}
                    className={`h-24 w-[30%] items-center justify-center rounded-2xl border-2 ${
                      vehicle === v.id
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <RNText className="text-[28px]">{v.icon}</RNText>
                    <RNText
                      className={`mt-1 text-[12px] ${
                        vehicle === v.id ? 'text-primary font-bold' : 'text-ink-muted'
                      }`}
                    >
                      {v.label}
                    </RNText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View className="mt-6">
              <Text variant="display" className="text-[28px]">
                Votre IBAN
              </Text>
              <Text variant="body" className="text-ink-muted mt-2 text-[14px]">
                Compte sur lequel seront versés vos gains chaque lundi.
              </Text>
              <TextInput
                value={iban}
                onChangeText={setIban}
                placeholder="FR76 …"
                placeholderTextColor="#9AA1B0"
                autoCapitalize="characters"
                className="mt-5 h-14 rounded-2xl border border-neutral-200 bg-white px-5 text-[16px] tracking-wider"
              />
              <RNText className="text-ink-subtle mt-3 text-[11px]">
                Vous pourrez modifier votre IBAN plus tard depuis vos paramètres.
              </RNText>
            </View>
          )}

          {step === 3 && (
            <View className="mt-6">
              <Text variant="display" className="text-[28px]">
                KYC Stripe
              </Text>
              <Text variant="body" className="text-ink-muted mt-3 text-[15px] leading-[1.5]">
                Stripe vérifie votre identité (pièce d&apos;identité, justificatif). C&apos;est
                obligatoire pour recevoir vos paiements. Vous serez redirigé vers leur portail
                sécurisé.
              </Text>
              <View className="bg-accent/10 mt-6 rounded-2xl p-5">
                <RNText className="text-ink text-[13px]">
                  💡 Préparez votre pièce d&apos;identité et un justificatif récent (facture, RIB).
                </RNText>
              </View>
              <RNText className="text-ink-muted mt-4 text-[12px]">
                Note: le compte Stripe Connect courier sera créé à l&apos;étape suivante.
                L&apos;intégration complète sera lancée dès la production beta.
              </RNText>
            </View>
          )}

          {step === 4 && (
            <View className="mt-6">
              <Text variant="display" className="text-[28px]">
                Tout est prêt ! 🎉
              </Text>
              <Text variant="body" className="text-ink-muted mt-3 text-[15px] leading-[1.5]">
                Passez en ligne depuis l&apos;accueil pour recevoir vos premières offres de courses.
              </Text>
            </View>
          )}

          <Pressable
            onPress={next}
            disabled={updateProfile.isPending}
            className="bg-primary mt-8 h-14 items-center justify-center rounded-2xl"
          >
            <RNText className="text-[15px] font-bold text-white">
              {updateProfile.isPending
                ? 'Enregistrement…'
                : step === STEPS.length - 1
                  ? 'Commencer à livrer'
                  : 'Étape suivante'}
            </RNText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row items-start gap-2">
      <RNText className="text-success">✓</RNText>
      <RNText className="text-ink flex-1 text-[13px]">{children}</RNText>
    </View>
  );
}
