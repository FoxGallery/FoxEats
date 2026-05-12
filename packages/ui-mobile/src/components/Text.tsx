import { Text as RNText, type TextProps } from 'react-native';
import clsx from 'clsx';

type Variant = 'display' | 'title' | 'body' | 'caption';

const stylesByVariant: Record<Variant, string> = {
  display: 'font-display text-4xl text-ink',
  title: 'font-sans text-xl font-semibold text-ink',
  body: 'font-sans text-base text-ink',
  caption: 'font-sans text-sm text-ink-muted',
};

export function Text({
  variant = 'body',
  className,
  ...rest
}: TextProps & { variant?: Variant; className?: string }) {
  return <RNText className={clsx(stylesByVariant[variant], className)} {...rest} />;
}
