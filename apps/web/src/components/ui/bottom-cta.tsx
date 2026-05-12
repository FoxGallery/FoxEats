'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  label: ReactNode;
  trailing?: ReactNode;
  tone?: 'brand' | 'ink' | 'success';
};

export function BottomCta({ href, onClick, disabled, label, trailing, tone = 'brand' }: Props) {
  const tones = {
    brand: 'bg-brand text-white shadow-[0_8px_24px_-4px_rgb(255,90,74,0.45)] hover:bg-brand-hover',
    ink: 'bg-ink text-ink-inverse hover:opacity-90',
    success: 'bg-success text-white',
  };
  const cls = `flex h-14 w-full items-center justify-between rounded-2xl px-6 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone]}`;

  const inner = (
    <>
      <span className="flex items-center gap-2">{label as any}</span>
      {trailing as any}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/** Wrapper sticky bottom safe-area pour mobile + desktop */
export function StickyBottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="pointer-events-auto mx-auto max-w-3xl px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
        <div className="from-bg via-bg/95 rounded-3xl bg-gradient-to-t to-transparent pt-3">
          {children as any}
        </div>
      </div>
    </div>
  );
}
