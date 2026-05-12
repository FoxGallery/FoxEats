'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'foxeats-cookie-consent-v1';

type Consent = { necessary: true; analytics: boolean; marketing: boolean; ts: number };

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      if (!stored) {
        setTimeout(() => setOpen(true), 600);
      }
    } catch {
      // SSR / safari private — do nothing
    }
  }, []);

  function save(consent: Consent) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(consent));
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function acceptAll() {
    save({ necessary: true, analytics: true, marketing: true, ts: Date.now() });
  }
  function refuseAll() {
    save({ necessary: true, analytics: false, marketing: false, ts: Date.now() });
  }
  function savePrefs() {
    save({ necessary: true, analytics, marketing, ts: Date.now() });
  }

  if (!open) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-6 sm:max-w-md">
      <div className="rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-neutral-200">
        <h2 className="font-display text-ink text-base font-bold">Cookies & confidentialité</h2>
        <p className="text-ink-muted mt-1.5 text-[13px] leading-relaxed">
          Nous utilisons des cookies pour faire fonctionner le site (nécessaires) et, avec votre
          accord, pour analyser le trafic et personnaliser certaines fonctionnalités. Vous pouvez
          modifier votre choix à tout moment.{' '}
          <Link href="/legal/cookies" className="text-primary underline-offset-2 hover:underline">
            En savoir plus
          </Link>
          .
        </p>

        {showDetails && (
          <div className="mt-3 space-y-2 rounded-lg bg-neutral-50 p-3 text-[12px]">
            <ToggleRow
              label="Nécessaires"
              desc="Authentification, panier, sécurité."
              checked
              disabled
            />
            <ToggleRow
              label="Analyse"
              desc="Mesure d'audience anonymisée (Vercel Analytics, PostHog)."
              checked={analytics}
              onChange={setAnalytics}
            />
            <ToggleRow
              label="Marketing"
              desc="Personnalisation des offres et publicités."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refuseAll}
            className="text-ink h-9 rounded-lg border border-neutral-200 px-3 text-[12px] font-medium hover:bg-neutral-50"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={() => setShowDetails((d) => !d)}
            className="text-ink h-9 rounded-lg border border-neutral-200 px-3 text-[12px] font-medium hover:bg-neutral-50"
          >
            {showDetails ? 'Masquer' : 'Personnaliser'}
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={savePrefs}
              className="bg-ink h-9 flex-1 rounded-lg px-3 text-[12px] font-semibold text-white"
            >
              Enregistrer mes choix
            </button>
          ) : (
            <button
              type="button"
              onClick={acceptAll}
              className="bg-primary h-9 flex-1 rounded-lg px-3 text-[12px] font-semibold text-white"
            >
              Tout accepter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3">
      <span className="flex-1">
        <span className="text-ink text-[13px] font-medium">{label}</span>
        <span className="text-ink-muted block text-[11px]">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="text-primary focus:ring-primary mt-1 h-4 w-4 rounded border-neutral-300"
      />
    </label>
  );
}
