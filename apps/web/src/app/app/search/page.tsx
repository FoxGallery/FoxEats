'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

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
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="bg-bg-elevated ring-border grid h-10 w-10 place-items-center rounded-full shadow-sm ring-1"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="20" y1="12" x2="4" y2="12" />
            <polyline points="10 18 4 12 10 6" />
          </svg>
        </button>
        <div className="relative flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Pizza, sushi, socca…"
            className="focus:border-primary focus:ring-primary/15 border-border bg-bg-elevated h-12 w-full rounded-2xl border px-12 text-[15px] outline-none focus:ring-4"
          />
          <span className="text-ink-subtle pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
      </div>

      <div className="mt-6">
        {!debounced && (
          <p className="text-ink-muted text-center text-[14px]">
            Tapez pour rechercher un plat, un restaurant ou une cuisine.
          </p>
        )}
        {debounced && results.isLoading && (
          <p className="text-ink-muted text-center text-[14px]">Recherche…</p>
        )}
        {results.data?.items.length === 0 && debounced && (
          <p className="text-ink-muted border-border rounded-xl border border-dashed px-4 py-8 text-center text-sm">
            Aucun résultat pour{' '}
            <span className="text-ink font-semibold">«&nbsp;{debounced}&nbsp;»</span>.
          </p>
        )}
        <div className="space-y-3">
          {results.data?.items.map((r) => (
            <Link
              key={r.id}
              href={`/app/r/${r.slug}`}
              className="bg-bg-elevated ring-border flex gap-3 rounded-2xl p-3 shadow-sm ring-1 transition hover:shadow-md"
            >
              {r.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.coverUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-ink truncate font-semibold">{r.name}</h3>
                  <span className="text-accent text-[12px] font-semibold">
                    ★ {Number(r.rating ?? 0).toFixed(1)}
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
