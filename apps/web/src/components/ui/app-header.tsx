'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title?: string;
  back?: boolean | string;
  trailing?: ReactNode;
  sticky?: boolean;
  transparent?: boolean;
};

export function AppHeader({
  title,
  back = false,
  trailing,
  sticky = true,
  transparent = false,
}: Props) {
  const router = useRouter();
  return (
    <header
      className={`${sticky ? 'sticky top-0 z-40' : ''} ${
        transparent ? '' : 'glass border-border border-b'
      } flex h-14 items-center justify-between gap-3 px-4`}
    >
      <div className="flex h-10 w-10 items-center justify-start">
        {back &&
          (typeof back === 'string' ? (
            <Link
              href={back}
              aria-label="Retour"
              className="hover:bg-bg-subtle grid h-10 w-10 place-items-center rounded-full"
            >
              <ArrowLeft size={20} className="text-ink" strokeWidth={2.2} />
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Retour"
              onClick={() => router.back()}
              className="hover:bg-bg-subtle grid h-10 w-10 place-items-center rounded-full"
            >
              <ArrowLeft size={20} className="text-ink" strokeWidth={2.2} />
            </button>
          ))}
      </div>
      <h1 className="font-display text-ink flex-1 text-center text-[17px] font-semibold tracking-tight">
        {title}
      </h1>
      <div className="flex h-10 w-10 items-center justify-end">{trailing as any}</div>
    </header>
  );
}
