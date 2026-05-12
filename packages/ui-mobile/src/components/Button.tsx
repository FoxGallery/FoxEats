import { Pressable, Text, type PressableProps } from 'react-native';
import clsx from 'clsx';

type Variant = 'primary' | 'accent' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  size?: Size;
};

const containerByVariant: Record<Variant, string> = {
  primary: 'bg-primary active:bg-primary-600',
  accent: 'bg-accent active:bg-accent-500',
  ghost: 'bg-transparent active:bg-neutral-100',
  outline: 'bg-transparent border border-neutral-200',
};

const textByVariant: Record<Variant, string> = {
  primary: 'text-white',
  accent: 'text-white',
  ghost: 'text-ink',
  outline: 'text-ink',
};

const containerBySize: Record<Size, string> = {
  sm: 'h-10 px-4 rounded-md',
  md: 'h-12 px-5 rounded-lg',
  lg: 'h-14 px-7 rounded-xl',
};

const textBySize: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonProps & { className?: string }) {
  return (
    <Pressable
      className={clsx(
        'items-center justify-center',
        containerByVariant[variant],
        containerBySize[size],
        className,
      )}
      {...rest}
    >
      <Text className={clsx('font-medium', textByVariant[variant], textBySize[size])}>{label}</Text>
    </Pressable>
  );
}
