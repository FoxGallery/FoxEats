'use client';

import { useEffect, useRef, useState } from 'react';
import { geocode, type GeocodeResult } from '@foxeats/maps/geocode';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: GeocodeResult) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, disabled }: Props) {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value || value.length < 3) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const items = await geocode(value, ctrl.signal);
        setResults(items);
        setOpen(true);
      } catch {
        if (!ctrl.signal.aborted) setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder ?? 'Adresse, ville…'}
        disabled={disabled}
        className="text-ink placeholder:text-ink-subtle focus:border-primary focus:ring-primary/15 h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-[15px] outline-none focus:ring-4 disabled:opacity-50"
        autoComplete="off"
      />
      {loading && (
        <span className="text-ink-subtle absolute right-3 top-1/2 -translate-y-1/2 text-xs">…</span>
      )}
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg"
        >
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(r);
                  onChange(r.label);
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-neutral-50"
              >
                <span className="text-ink text-[14px]">{r.street}</span>
                <span className="text-ink-muted text-[12px]">
                  {r.postalCode} {r.city}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
