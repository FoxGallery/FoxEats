import { useState } from 'react';
import {
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Screen, Text } from '@foxeats/ui-mobile';
import { authClient } from '@foxeats/auth/client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function EmailAuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Adresse email invalide.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setError(null);
    const result = await authClient.signIn.magicLink({
      email,
      callbackURL: 'foxeats://auth/callback',
    });
    if (result.error) {
      setError(result.error.message ?? "Impossible d'envoyer le lien.");
      setStatus('error');
      return;
    }
    setStatus('sent');
    router.push({ pathname: '/(auth)/check-email', params: { email } });
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="mt-10 flex-1"
        >
          <Text variant="display" className="text-[36px] leading-[1.1]">
            Votre email
          </Text>
          <Text variant="body" className="text-ink-muted mt-2 text-[15px]">
            Nous vous enverrons un lien sécurisé. Pas de mot de passe à retenir.
          </Text>

          <View className="mt-8">
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setStatus('idle');
                setError(null);
              }}
              placeholder="vous@exemple.fr"
              placeholderTextColor="#9AA1B0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              autoFocus
              editable={status !== 'sending'}
              className="text-ink h-14 rounded-2xl border border-neutral-200 bg-white px-5 text-[16px]"
            />
            {error && <RNText className="text-danger mt-2 text-[13px]">{error}</RNText>}
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={status === 'sending'}
            className="bg-primary mt-6 h-14 items-center justify-center rounded-2xl shadow-md active:opacity-90"
          >
            <RNText className="text-[16px] font-semibold text-white">
              {status === 'sending' ? 'Envoi…' : 'Recevoir le lien'}
            </RNText>
          </Pressable>

          <View className="mt-7 flex-row items-center">
            <View className="h-px flex-1 bg-neutral-200" />
            <RNText className="text-ink-subtle px-3 text-[11px] uppercase tracking-wider">
              ou
            </RNText>
            <View className="h-px flex-1 bg-neutral-200" />
          </View>

          <View className="mt-5 gap-3">
            <Pressable
              onPress={() =>
                authClient.signIn.social({
                  provider: 'google',
                  callbackURL: 'foxeats://auth/callback',
                })
              }
              className="h-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white"
            >
              <RNText className="text-ink text-[15px] font-medium">Continuer avec Google</RNText>
            </Pressable>
            <Pressable
              onPress={() =>
                authClient.signIn.social({
                  provider: 'apple',
                  callbackURL: 'foxeats://auth/callback',
                })
              }
              className="bg-ink h-14 items-center justify-center rounded-2xl"
            >
              <RNText className="text-[15px] font-medium text-white">Continuer avec Apple</RNText>
            </Pressable>
          </View>
        </MotiView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
