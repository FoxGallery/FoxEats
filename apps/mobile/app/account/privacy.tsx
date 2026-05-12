import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, Pressable, Text as RNText, TextInput, Alert, Share } from 'react-native';
import { Screen, Text } from '@foxeats/ui-mobile';
import { authClient } from '@foxeats/auth/client';
import { useTrpc } from '@/lib/trpc';

export default function PrivacyScreen() {
  const router = useRouter();
  const trpc = useTrpc();
  const requestExport = trpc.me.requestExport.useMutation();
  const deleteAccount = trpc.me.deleteAccount.useMutation();
  const [confirm, setConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  async function doExport() {
    try {
      const data = await requestExport.mutateAsync();
      await Share.share({
        title: 'Export FoxEats',
        message: JSON.stringify(data, null, 2),
      });
    } catch (e) {
      Alert.alert('Erreur export', (e as Error).message ?? 'Échec');
    }
  }

  async function doDelete() {
    if (confirm !== 'SUPPRIMER MON COMPTE') return;
    try {
      await deleteAccount.mutateAsync({ confirm: 'SUPPRIMER MON COMPTE' });
      await authClient.signOut();
      router.replace('/(auth)/welcome');
    } catch (e) {
      Alert.alert('Erreur', (e as Error).message ?? 'Échec');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Vie privée & RGPD' }} />
      <Screen>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Text variant="body" className="text-ink-muted mt-4 text-[14px] leading-[1.5]">
            Vous avez le droit d&apos;accéder à vos données et de supprimer votre compte à tout
            moment.
          </Text>

          <View className="mt-6 rounded-2xl bg-white p-5">
            <Text variant="title" className="text-[16px]">
              Exporter mes données
            </Text>
            <Text variant="caption" className="mt-1 text-[13px]">
              Profil, adresses, FoxCoins — format JSON.
            </Text>
            <Pressable
              onPress={doExport}
              disabled={requestExport.isPending}
              className="bg-primary mt-4 h-11 items-center justify-center rounded-xl"
            >
              <RNText className="font-medium text-white">
                {requestExport.isPending ? 'Préparation…' : 'Exporter mes données'}
              </RNText>
            </Pressable>
          </View>

          <View className="border-danger/30 bg-danger/[0.03] mt-4 rounded-2xl border p-5">
            <Text variant="title" className="text-danger text-[16px]">
              Supprimer mon compte
            </Text>
            <Text variant="caption" className="mt-1 text-[13px]">
              Suppression définitive. Anonymisation immédiate, purge après 30 jours.
            </Text>
            {!showDelete ? (
              <Pressable
                onPress={() => setShowDelete(true)}
                className="border-danger mt-4 h-11 items-center justify-center rounded-xl border"
              >
                <RNText className="text-danger font-medium">Supprimer mon compte</RNText>
              </Pressable>
            ) : (
              <View className="mt-4">
                <RNText className="text-ink-muted text-[12px]">
                  Tapez{' '}
                  <RNText className="text-ink font-mono font-medium">SUPPRIMER MON COMPTE</RNText>{' '}
                  pour confirmer.
                </RNText>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="SUPPRIMER MON COMPTE"
                  placeholderTextColor="#9AA1B0"
                  autoCapitalize="characters"
                  className="mt-3 h-12 rounded-xl border border-neutral-200 bg-white px-4 text-[14px]"
                />
                <Pressable
                  onPress={doDelete}
                  disabled={confirm !== 'SUPPRIMER MON COMPTE' || deleteAccount.isPending}
                  className="bg-danger mt-3 h-11 items-center justify-center rounded-xl disabled:opacity-50"
                >
                  <RNText className="font-medium text-white">
                    {deleteAccount.isPending ? 'Suppression…' : 'Confirmer la suppression'}
                  </RNText>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}
