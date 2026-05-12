'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';

type Tone = 'brand' | 'accent';

type Props = {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Format de la valeur affichée à droite du label (ex: v => `${v} h` ou v => `${v.toFixed(2)} €`) */
  format?: (value: number) => string;
  /** Texte explicatif optionnel sous le slider */
  hint?: ReactNode;
  /** Couleur dominante du slider */
  tone?: Tone;
  /** Position(s) où afficher un tick (ex: bornes min/max) */
  ticks?: number[];
  /** Icône optionnelle à gauche du label */
  icon?: ReactNode;
  disabled?: boolean;
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
  hint,
  tone = 'brand',
  ticks,
  icon,
  disabled = false,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const toneCls = tone === 'brand' ? 'slider-brand' : 'slider-accent';
  const valueCls = tone === 'brand' ? 'text-brand' : 'text-accent';

  return (
    <div className={`group ${disabled ? 'opacity-50' : ''}`}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-ink flex items-center gap-2 text-[13px] font-semibold">
          {icon as any}
          <span>{label as any}</span>
        </label>
        <span
          className={`font-display text-[15px] font-extrabold tabular-nums tracking-tight ${valueCls}`}
        >
          {format(value)}
        </span>
      </div>

      <div className="relative">
        {/* Track background */}
        <div className="bg-bg-subtle ring-border h-2 rounded-full ring-1 ring-inset" />
        {/* Track filled */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 rounded-full transition-[width] ${
            tone === 'brand'
              ? 'from-brand to-brand-hover bg-gradient-to-r'
              : 'from-accent to-accent-hover bg-gradient-to-r'
          }`}
          style={{ width: `${pct}%` }}
        />
        {/* Ticks */}
        {ticks?.map((t) => {
          const tp = ((t - min) / (max - min)) * 100;
          return (
            <span
              key={t}
              className="bg-ink-subtle/40 pointer-events-none absolute top-1/2 h-1 w-px -translate-y-1/2"
              style={{ left: `${tp}%` }}
            />
          );
        })}
        {/* Thumb (visual) */}
        <span
          className={`bg-bg-elevated pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md transition group-hover:scale-110 ${
            tone === 'brand'
              ? 'border-brand ring-brand/15 border-[3px] ring-4'
              : 'border-accent ring-accent/15 border-[3px] ring-4'
          }`}
          style={{
            left: `${pct}%`,
            width: 22,
            height: 22,
          }}
        />
        {/* Real input (transparent overlay for native UX) */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={`absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2 cursor-grab opacity-0 active:cursor-grabbing ${toneCls}`}
          aria-label={typeof label === 'string' ? label : undefined}
        />
      </div>

      {/* Bornes min/max + hint */}
      <div className="text-ink-subtle mt-2 flex items-center justify-between text-[11px] tabular-nums">
        <span>{format(min)}</span>
        {hint && <span className="text-ink-muted text-[11px]">{hint as any}</span>}
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
