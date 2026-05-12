'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'pill' | 'segmented';
type Tone = 'ink' | 'brand' | 'accent' | 'neutral';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: Variant;
  tone?: Tone;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Chip({
  active = false,
  variant = 'pill',
  tone = 'ink',
  leading,
  trailing,
  children,
  className = '',
  ...props
}: Props) {
  const base =
    'inline-flex shrink-0 select-none items-center gap-1.5 whitespace-nowrap rounded-full border text-[13px] font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.98]';

  const size = variant === 'segmented' ? 'h-9 px-4' : 'h-9 px-4';

  const tones: Record<Tone, { active: string; idle: string }> = {
    ink: {
      active: 'bg-ink text-ink-inverse border-ink',
      idle: 'bg-bg-elevated text-ink border-border hover:border-ink/30',
    },
    brand: {
      active: 'bg-brand text-white border-brand shadow-[0_6px_16px_-4px_rgb(255,90,74,0.5)]',
      idle: 'bg-bg-elevated text-ink border-border hover:border-brand/30',
    },
    accent: {
      active: 'bg-accent text-white border-accent',
      idle: 'bg-bg-elevated text-ink border-border hover:border-accent/30',
    },
    neutral: {
      active: 'bg-bg-subtle text-ink border-border',
      idle: 'bg-bg-elevated text-ink-muted border-border hover:text-ink',
    },
  };
  const t = tones[tone];

  return (
    <button
      type="button"
      {...props}
      className={`${base} ${size} ${active ? t.active : t.idle} ${className}`}
    >
      {leading as any}
      <span>{children as any}</span>
      {trailing as any}
    </button>
  );
}
