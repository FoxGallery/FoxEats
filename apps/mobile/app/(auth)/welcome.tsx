import {
  View,
  ImageBackground,
  Pressable,
  Text as RNText,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Text } from '@foxeats/ui-mobile';

export default function WelcomeScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();

  return (
    <View className="bg-surface flex-1">
      <LinearGradient
        colors={['#0B3D91', '#1A4BA8', '#FF6B5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View className="flex-1 justify-end px-6 pb-12" style={{ paddingTop: height * 0.18 }}>
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700 }}
        >
          <RNText className="font-display text-[64px] leading-[1.02] tracking-tight text-white">
            FoxEats
          </RNText>
          <Text variant="body" className="mt-3 text-[17px] leading-[1.45] text-white/85">
            La table de la Côte d&apos;Azur,{'\n'}à votre porte en quelques minutes.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700, delay: 200 }}
          className="mt-10 gap-3"
        >
          <Pressable
            onPress={() => router.push('/(auth)/email')}
            className="h-14 items-center justify-center rounded-2xl bg-white shadow-xl"
          >
            <RNText className="text-[16px] font-semibold text-[#0B3D91]">Commencer</RNText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            className="h-12 items-center justify-center"
          >
            <RNText className="text-[14px] text-white/85 underline">Continuer en invité</RNText>
          </Pressable>
        </MotiView>
      </View>
    </View>
  );
}
