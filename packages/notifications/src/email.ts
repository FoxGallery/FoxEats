import { Resend } from 'resend';
import { renderMagicLinkHtml } from './templates/magic-link';

let _resend: Resend | null = null;

function resendOrNull(): Resend | null {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) return null;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const DEFAULT_FROM = 'FoxEats <onboarding@resend.dev>';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  headers?: Record<string, string>;
}) {
  const from = opts.from ?? process.env.RESEND_FROM ?? DEFAULT_FROM;
  const client = resendOrNull();
  if (!client) {
    console.warn(
      `[mail:dev] No RESEND_API_KEY — would send "${opts.subject}" to ${opts.to} from ${from}`,
    );
    return { id: 'dev-noop', skipped: true } as const;
  }
  return client.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    headers: opts.headers,
  });
}

export async function sendMagicLinkEmail(opts: {
  to: string;
  url: string;
  locale?: 'fr' | 'en' | 'it';
}) {
  const { html, text, subject } = renderMagicLinkHtml({ url: opts.url, locale: opts.locale });
  // En dev: log toujours le lien pour pouvoir copier-coller même si Resend est branché.
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[magic-link] ${opts.to} → ${opts.url}`);
  }
  return sendEmail({
    to: opts.to,
    subject,
    html,
    text,
    headers: { 'X-Entity-Ref-ID': `magic-link-${Date.now()}` },
  });
}
