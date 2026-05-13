import { ScrollView, Pressable, View, Text as RNText, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@foxeats/ui-mobile';
import { authClient, useSession } from '@foxeats/auth/client';
import {
  ChevronRight,
  LogOut,
  MapPin,
  UserCog,
  ShieldCheck,
  Bell,
  Languages,
  HelpCircle,
  FileText,
  ArrowRight,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

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
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="-mx-5 px-5"
        showsVerticalScrollIndicator={false}
      >
        <RNText className="font-display text-ink mt-2 text-[28px] font-extrabold tracking-tight">
          Compte
        </RNText>
        <RNText className="text-ink-muted mt-0.5 text-[13px]">
          Vos infos, préférences et confidentialité.
        </RNText>

        {/* User card */}
        {user ? (
          <View className="bg-bg-elevated border-border mt-5 flex-row items-center gap-3 rounded-3xl border p-4">
            <View className="bg-brand-soft h-14 w-14 items-center justify-center rounded-2xl">
              <RNText className="font-display text-brand text-[20px] font-extrabold">
                {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
              </RNText>
            </View>
            <View className="flex-1">
              <RNText className="font-display text-ink text-[16px] font-bold">
                {user.name ?? 'Utilisateur'}
              </RNText>
              <RNText className="text-ink-muted text-[13px]" numberOfLines={1}>
                {user.email}
              </RNText>
            </View>
            <ChevronRight size={18} color="#8A909B" strokeWidth={2.2} />
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/(auth)/welcome')}
            className="bg-brand mt-5 flex-row items-center justify-between rounded-3xl px-5 py-4"
          >
            <View>
              <RNText className="font-display text-[16px] font-bold text-white">
                Se connecter
              </RNText>
              <RNText className="mt-0.5 text-[12px] text-white/85">
                Accédez à vos commandes et adresses
              </RNText>
            </View>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
          </Pressable>
        )}

        {/* Sections list */}
        <SectionHeading label="Profil" />
        <View className="bg-bg-elevated border-border overflow-hidden rounded-2xl border">
          <Row
            icon={MapPin}
            label="Mes adresses"
            sub="Domicile, bureau, favoris"
            onPress={() => router.push('/account/addresses')}
          />
          <Divider />
          <Row
            icon={UserCog}
            label="Profil & préférences"
            sub="Langue, régimes alimentaires"
            onPress={() => router.push('/account/profile')}
          />
          <Divider />
          <Row icon={Bell} label="Notifications" sub="Push, email" onPress={() => {}} />
        </View>

        <SectionHeading label="Compte" />
        <View className="bg-bg-elevated border-border overflow-hidden rounded-2xl border">
          <Row
            icon={ShieldCheck}
            label="Vie privée & RGPD"
            sub="Données, suppression"
            onPress={() => router.push('/account/privacy')}
          />
          <Divider />
          <Row
            icon={Languages}
            label="Langue"
            sub="Français"
            onPress={() => router.push('/account/profile')}
          />
        </View>

        <SectionHeading label="Aide" />
        <View className="bg-bg-elevated border-border overflow-hidden rounded-2xl border">
          <Row icon={HelpCircle} label="Centre d'aide" onPress={() => {}} />
          <Divider />
          <Row icon={FileText} label="Conditions & confidentialité" onPress={() => {}} />
        </View>

        {user && (
          <Pressable
            onPress={onLogout}
            className="border-danger/30 bg-danger/[0.03] mt-6 flex-row items-center justify-center gap-2 rounded-2xl border p-4 active:opacity-70"
          >
            <LogOut size={16} color="#E11D2B" strokeWidth={2.4} />
            <RNText className="text-danger text-[14px] font-semibold">Se déconnecter</RNText>
          </Pressable>
        )}

        <RNText className="text-ink-subtle mt-8 pb-24 text-center text-[11px]">
          FoxEats · v1.0.0 · Côte d&apos;Azur
        </RNText>
      </ScrollView>
    </Screen>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <RNText className="text-ink-subtle mb-2 mt-7 text-[11px] font-bold uppercase tracking-widest">
      {label}
    </RNText>
  );
}

function Divider() {
  return <View className="bg-border ml-14 h-px" />;
}

function Row({
  icon: Icon,
  label,
  sub,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
    >
      <View className="bg-bg-subtle h-9 w-9 items-center justify-center rounded-xl">
        <Icon size={17} color="#0E1116" strokeWidth={2.2} />
      </View>
      <View className="flex-1">
        <RNText className="text-ink text-[14px] font-semibold">{label}</RNText>
        {sub && <RNText className="text-ink-subtle mt-0.5 text-[12px]">{sub}</RNText>}
      </View>
      <ChevronRight size={16} color="#8A909B" strokeWidth={2.2} />
    </Pressable>
  );
}
