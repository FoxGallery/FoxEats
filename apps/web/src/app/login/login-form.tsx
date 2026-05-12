'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@foxeats/auth/client';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending'; provider: 'magic' | 'google' | 'apple' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string };

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmitMagic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ kind: 'error', message: 'Adresse email invalide.' });
      return;
    }
    setStatus({ kind: 'sending', provider: 'magic' });
    const result = await authClient.signIn.magicLink({ email, callbackURL: callbackUrl });
    if (result.error) {
      setStatus({
        kind: 'error',
        message: result.error.message ?? "Impossible d'envoyer le lien. Réessayez.",
      });
      return;
    }
    setStatus({ kind: 'sent' });
    startTransition(() => {
      router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
    });
  }

  async function onSocial(provider: 'google' | 'apple') {
    setStatus({ kind: 'sending', provider });
    const result = await authClient.signIn.social({ provider, callbackURL: callbackUrl });
    if (result.error) {
      setStatus({
        kind: 'error',
        message:
          result.error.message ??
          `Connexion ${provider === 'google' ? 'Google' : 'Apple'} indisponible.`,
      });
    }
  }

  const isSending = status.kind === 'sending';

  return (
    <div className="mt-7 space-y-4">
      <form onSubmit={onSubmitMagic} className="space-y-3" noValidate>
        <label htmlFor="email" className="sr-only">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSending}
          className="text-ink placeholder:text-ink-subtle focus:border-brand focus:ring-brand/15 border-border bg-bg-elevated h-12 w-full rounded-xl border px-4 text-[15px] outline-none transition focus:ring-4 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending}
          className="bg-brand hover:bg-brand-hover flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-medium text-white shadow-md transition active:translate-y-px disabled:opacity-60"
        >
          {status.kind === 'sending' && status.provider === 'magic'
            ? 'Envoi du lien…'
            : 'Recevoir un lien de connexion'}
        </button>
      </form>

      {status.kind === 'error' && (
        <p role="alert" className="text-danger text-sm">
          {status.message}
        </p>
      )}

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="bg-border h-px w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="text-ink-subtle bg-bg-elevated px-3 text-xs uppercase tracking-wider">
            ou
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSocial('google')}
          disabled={isSending}
          className="text-ink border-border bg-bg-elevated hover:bg-bg-subtle flex h-12 items-center justify-center gap-2 rounded-xl border text-[14px] font-medium transition active:translate-y-px disabled:opacity-50"
          aria-label="Se connecter avec Google"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          onClick={() => onSocial('apple')}
          disabled={isSending}
          className="bg-ink flex h-12 items-center justify-center gap-2 rounded-xl text-[14px] font-medium text-white transition hover:opacity-90 active:translate-y-px disabled:opacity-50"
          aria-label="Se connecter avec Apple"
        >
          <AppleIcon />
          Apple
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.464 2.231-1.21 3.02-.804.834-2.118 1.486-3.196 1.398-.137-1.122.413-2.297 1.155-3.024.836-.835 2.27-1.434 3.251-1.394zM20.5 17.5c-.66 1.532-1.395 3.05-2.555 3.07-1.144.02-1.516-.683-2.823-.683-1.306 0-1.721.667-2.807.703-1.123.04-1.975-1.658-2.65-3.181-1.367-3.082-2.406-8.7.997-12.5.875-1.04 2.39-1.683 3.892-1.708 1.106-.02 2.149.747 2.823.747.673 0 1.943-.917 3.27-.78.555.022 2.11.225 3.108 1.683-.082.053-1.86 1.09-1.84 3.252.02 2.58 2.247 3.444 2.27 3.452-.018.056-.355 1.22-1.685 3.945z" />
    </svg>
  );
}
