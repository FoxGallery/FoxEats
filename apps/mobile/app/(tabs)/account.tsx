import { ScrollView, Pressable, View, Text as RNText, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text } from '@foxeats/ui-mobile';
import { authClient, useSession } from '@foxeats/auth/client';
import { ChevronRight, LogOut, MapPin, UserCog, ShieldCheck } from 'lucide-react-native';

export default function AccountScreen() {
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;

  async function onLogout() {
    Alert.alert('Déconnexion', 'Confirmer la déconnexion ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await authClient.signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior="automatic" className="-mx-5 px-5">
        <Text variant="display" className="mt-6 text-[32px]">
          Compte
        </Text>
        {user ? (
          <View className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <RNText className="text-ink text-[15px] font-semibold">
              {user.name ?? 'Utilisateur'}
            </RNText>
            <RNText className="text-ink-muted text-[13px]">{user.email}</RNText>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/(auth)/welcome')}
            className="bg-primary mt-4 rounded-2xl px-5 py-4"
          >
            <RNText className="text-[15px] font-semibold text-white">Se connecter</RNText>
          </Pressable>
        )}

        <View className="mt-8 gap-3">
          <Row
            icon={<MapPin size={18} color="#0B3D91" />}
            label="Mes adresses"
            onPress={() => router.push('/account/addresses')}
          />
          <Row
            icon={<UserCog size={18} color="#0B3D91" />}
            label="Profil & préférences"
            onPress={() => router.push('/account/profile')}
          />
          <Row
            icon={<ShieldCheck size={18} color="#0B3D91" />}
            label="Vie privée & RGPD"
            onPress={() => router.push('/account/privacy')}
          />
          {user && (
            <Row
              icon={<LogOut size={18} color="#C8261A" />}
              label="Se déconnecter"
              onPress={onLogout}
              danger
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-center gap-3">
        {icon}
        <RNText className={`text-[15px] ${danger ? 'text-danger font-medium' : 'text-ink'}`}>
          {label}
        </RNText>
      </View>
      <ChevronRight size={18} color="#9AA1B0" />
    </Pressable>
  );
}
