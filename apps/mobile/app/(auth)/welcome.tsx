import { View, Pressable, Text as RNText, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ArrowRight, Sparkles, MapPin, Clock, Star } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  return (
    <View className="bg-bg flex-1">
      {/* Hero gradient brand → accent (iso /partners /couriers) */}
      <LinearGradient
        colors={['#FF5A4A', '#E84838', '#0F2A56']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Decorative radial overlay */}
      <View
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 360,
          height: 360,
          borderRadius: 9999,
          backgroundColor: 'rgba(255,255,255,0.18)',
          opacity: 0.6,
        }}
      />

      <View className="flex-1 justify-between px-6 pb-12" style={{ paddingTop: height * 0.14 }}>
        {/* Top : badge + logo */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1">
            <Sparkles size={11} color="#FFFFFF" strokeWidth={2.4} />
            <RNText className="text-[11px] font-bold uppercase tracking-widest text-white">
              Côte d&apos;Azur
            </RNText>
          </View>
        </MotiView>

        {/* Middle : title + tagline */}
        <View>
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 700, delay: 100 }}
          >
            <RNText className="font-display text-[68px] font-extrabold leading-[0.95] tracking-tight text-white">
              FoxEats
            </RNText>
            <RNText className="font-display mt-2 text-[24px] font-bold leading-tight text-white/90">
              La table de la Riviera,{'\n'}à votre porte.
            </RNText>
            <RNText className="mt-4 text-[14px] leading-relaxed text-white/85">
              Restaurateurs sélectionnés. Livreurs justement rémunérés. Anti-gaspi inclus.
            </RNText>
          </MotiView>

          {/* Stats inline iso hero web */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 250 }}
            className="mt-8 flex-row items-center gap-4"
          >
            <Stat icon={Clock} value="28 min" label="livraison" />
            <View className="h-10 w-px bg-white/25" />
            <Stat icon={Star} value="4,8 ★" label="note" />
            <View className="h-10 w-px bg-white/25" />
            <Stat icon={MapPin} value="8" label="villes" />
          </MotiView>
        </View>

        {/* Bottom : CTAs */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700, delay: 400 }}
          className="gap-3"
        >
          <Pressable
            onPress={() => router.push('/(auth)/email')}
            className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-white shadow-xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
            }}
          >
            <RNText className="text-ink text-[16px] font-bold">Commencer</RNText>
            <ArrowRight size={16} color="#0E1116" strokeWidth={2.6} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            className="h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10"
          >
            <RNText className="text-[14px] font-semibold text-white">Continuer en invité</RNText>
          </Pressable>
        </MotiView>
      </View>
    </View>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Star; value: string; label: string }) {
  return (
    <View>
      <View className="flex-row items-center gap-1">
        <Icon size={11} color="#FFFFFF" strokeWidth={2.4} />
        <RNText className="font-display text-[18px] font-extrabold leading-none text-white">
          {value}
        </RNText>
      </View>
      <RNText className="mt-1 text-[10px] text-white/80">{label}</RNText>
    </View>
  );
}
