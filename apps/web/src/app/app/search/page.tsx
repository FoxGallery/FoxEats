'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, Star, SearchX } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { restoPhoto } from '@/lib/photos';

export default function SearchPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 220);
    return () => clearTimeout(id);
  }, [q]);

  const results = trpc.restaurants.search.useQuery(
    { q: debounced, limit: 30 },
    { enabled: debounced.length > 0 },
  );

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="border-border bg-bg-elevated text-ink shadow-xs hover:bg-bg-subtle grid h-11 w-11 place-items-center rounded-full border"
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>
        <div className="relative flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Pizza, sushi, socca, niçois…"
            className="border-border bg-bg-elevated text-ink placeholder:text-ink-subtle focus:border-brand focus:ring-brand/15 h-12 w-full rounded-2xl border px-12 text-[15px] outline-none focus:ring-4"
          />
          <SearchIcon
            size={16}
            strokeWidth={2.2}
            className="text-ink-subtle pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      <div className="mt-8">
        {!debounced && (
          <div className="border-border bg-bg-elevated rounded-3xl border border-dashed px-4 py-14 text-center">
            <span className="bg-bg-subtle text-ink-muted mx-auto grid h-14 w-14 place-items-center rounded-2xl">
              <SearchIcon size={22} strokeWidth={2} />
            </span>
            <p className="font-display text-ink mt-4 text-[16px] font-bold">Que cherchez-vous ?</p>
            <p className="text-ink-muted mt-1 text-[13px]">
              Cherchez un plat, un restaurant, une cuisine.
            </p>
          </div>
        )}
        {debounced && results.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        )}
        {results.data?.items.length === 0 && debounced && (
          <div className="border-border bg-bg-elevated rounded-3xl border border-dashed px-4 py-14 text-center">
            <span className="bg-bg-subtle text-ink-muted mx-auto grid h-14 w-14 place-items-center rounded-2xl">
              <SearchX size={22} strokeWidth={2} />
            </span>
            <p className="font-display text-ink mt-4 text-[16px] font-bold">
              Aucun résultat pour «&nbsp;{debounced}&nbsp;»
            </p>
            <p className="text-ink-muted mt-1 text-[13px]">Essayez un autre mot-clé.</p>
          </div>
        )}
        <div className="space-y-3">
          {results.data?.items.map((r) => (
            <Link
              key={r.id}
              href={`/app/r/${r.slug}`}
              className="border-border bg-bg-elevated shadow-xs hover:border-brand/30 hover:shadow-food flex gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.coverUrl ?? restoPhoto(r.slug)}
                alt=""
                className="ring-border h-20 w-20 shrink-0 rounded-xl object-cover ring-1"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-ink truncate text-[15px] font-semibold">
                    {r.name}
                  </h3>
                  <span className="bg-ink text-ink-inverse flex shrink-0 items-center gap-0.5 rounded-lg px-1.5 py-0.5 text-[11px] font-bold">
                    <Star size={9} fill="currentColor" strokeWidth={0} />
                    {Number(r.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                <p className="text-ink-muted mt-0.5 truncate text-[12px]">
                  {(r.cuisines as string[]).slice(0, 3).join(' · ')} · {r.city}
                </p>
                <p className="text-ink-subtle mt-1 text-[11px]">
                  {r.prepTimeMinMinutes}–{r.prepTimeMaxMinutes} min ·{' '}
                  {(r.deliveryFeeCents / 100).toFixed(2)} € livraison
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
