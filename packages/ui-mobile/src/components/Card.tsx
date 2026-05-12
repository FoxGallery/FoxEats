import { View, type ViewProps } from 'react-native';
import clsx from 'clsx';

export function Card({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={clsx('rounded-lg bg-white p-4 shadow-md', className)} {...rest} />;
}
