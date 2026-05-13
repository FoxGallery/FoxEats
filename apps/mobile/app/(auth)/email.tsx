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
import { Screen } from '@foxeats/ui-mobile';
import { authClient } from '@foxeats/auth/client';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react-native';

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
          className="mt-8 flex-1"
        >
          {/* Icon bulle */}
          <View className="bg-brand-soft h-14 w-14 items-center justify-center rounded-2xl">
            <Mail size={22} color="#FF5A4A" strokeWidth={2.2} />
          </View>
          <RNText className="font-display text-ink mt-6 text-[32px] font-extrabold leading-tight tracking-tight">
            Votre email
          </RNText>
          <RNText className="text-ink-muted mt-2 text-[15px] leading-relaxed">
            On vous envoie un lien sécurisé. Pas de mot de passe à retenir.
          </RNText>

          <View className="mt-7">
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setStatus('idle');
                setError(null);
              }}
              placeholder="vous@exemple.fr"
              placeholderTextColor="#8A909B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              autoFocus
              editable={status !== 'sending'}
              className="border-border bg-bg-elevated text-ink h-14 rounded-2xl border px-5 text-[16px]"
              style={
                error
                  ? { borderColor: '#E11D2B' }
                  : status === 'sending'
                    ? { opacity: 0.6 }
                    : undefined
              }
            />
            {error && (
              <View className="bg-danger-soft mt-2 flex-row items-center gap-1.5 rounded-lg px-3 py-2">
                <AlertCircle size={13} color="#E11D2B" strokeWidth={2.4} />
                <RNText className="text-danger text-[13px] font-medium">{error}</RNText>
              </View>
            )}
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={status === 'sending'}
            className="bg-brand mt-5 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-90"
            style={{
              shadowColor: '#FF5A4A',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              opacity: status === 'sending' ? 0.7 : 1,
            }}
          >
            <RNText className="text-[16px] font-bold text-white">
              {status === 'sending' ? 'Envoi…' : 'Recevoir le lien'}
            </RNText>
            {status !== 'sending' && <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.6} />}
          </Pressable>

          {/* Separator */}
          <View className="mt-7 flex-row items-center">
            <View className="bg-border h-px flex-1" />
            <RNText className="text-ink-subtle px-3 text-[11px] font-bold uppercase tracking-widest">
              ou
            </RNText>
            <View className="bg-border h-px flex-1" />
          </View>

          {/* Social */}
          <View className="mt-5 gap-3">
            <Pressable
              onPress={() =>
                authClient.signIn.social({
                  provider: 'google',
                  callbackURL: 'foxeats://auth/callback',
                })
              }
              className="border-border bg-bg-elevated h-14 flex-row items-center justify-center gap-2 rounded-2xl border active:opacity-80"
            >
              <RNText className="text-[16px]">🇬</RNText>
              <RNText className="text-ink text-[15px] font-semibold">Continuer avec Google</RNText>
            </Pressable>
            <Pressable
              onPress={() =>
                authClient.signIn.social({
                  provider: 'apple',
                  callbackURL: 'foxeats://auth/callback',
                })
              }
              className="bg-ink h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-90"
            >
              <RNText className="text-ink-inverse text-[15px] font-semibold">
                Continuer avec Apple
              </RNText>
            </Pressable>
          </View>

          <RNText className="text-ink-subtle mt-7 text-center text-[11px]">
            En continuant, vous acceptez nos CGU et notre politique de confidentialité.
          </RNText>
        </MotiView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
