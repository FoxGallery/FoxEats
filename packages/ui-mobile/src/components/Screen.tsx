import { SafeAreaView, View, type ViewProps } from 'react-native';
import clsx from 'clsx';

export function Screen({ className, children, ...rest }: ViewProps & { className?: string }) {
  return (
    <SafeAreaView className="bg-surface flex-1">
      <View className={clsx('flex-1 px-5', className)} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
