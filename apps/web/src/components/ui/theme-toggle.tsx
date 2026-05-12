'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const OPTIONS = [
  { id: 'light' as const, icon: Sun, label: 'Clair' },
  { id: 'system' as const, icon: Monitor, label: 'Système' },
  { id: 'dark' as const, icon: Moon, label: 'Sombre' },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Basculer le thème"
        className="border-border bg-bg-elevated text-ink hover:bg-bg-subtle grid h-9 w-9 place-items-center rounded-full border"
      >
        <Sun
          size={16}
          className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          strokeWidth={2.2}
        />
        <Moon
          size={16}
          className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          strokeWidth={2.2}
        />
      </button>
    );
  }

  return (
    <div className="border-border bg-bg-elevated inline-flex items-center gap-0.5 rounded-full border p-0.5">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            aria-label={opt.label}
            aria-pressed={active}
            className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition ${
              active ? 'bg-ink text-ink-inverse' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Icon size={14} strokeWidth={2.2} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
