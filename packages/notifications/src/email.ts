import { Resend } from 'resend';
import { render } from '@react-email/render';
import { renderMagicLinkHtml } from './templates/magic-link';
import {
  WelcomeEmail,
  MagicLinkEmail,
  OrderPlacedEmail,
  OrderDeliveredEmail,
  RefundEmail,
  type WelcomeProps,
  type MagicLinkProps,
  type OrderPlacedProps,
  type OrderDeliveredProps,
  type RefundProps,
} from './emails';

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

/** Magic link — utilise React Email avec fallback legacy si render échoue */
export async function sendMagicLinkEmail(opts: {
  to: string;
  url: string;
  locale?: 'fr' | 'en' | 'it';
}) {
  let html: string;
  let text: string;
  try {
    html = await render(MagicLinkEmail({ url: opts.url } as MagicLinkProps));
    text = await render(MagicLinkEmail({ url: opts.url } as MagicLinkProps), { plainText: true });
  } catch {
    const legacy = renderMagicLinkHtml({ url: opts.url, locale: opts.locale });
    html = legacy.html;
    text = legacy.text;
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[magic-link] ${opts.to} → ${opts.url}`);
  }
  return sendEmail({
    to: opts.to,
    subject: 'Votre lien de connexion FoxEats',
    html,
    text,
    headers: { 'X-Entity-Ref-ID': `magic-link-${Date.now()}` },
  });
}

/** Email de bienvenue à l'inscription */
export async function sendWelcomeEmail(opts: { to: string } & WelcomeProps) {
  const html = await render(WelcomeEmail(opts));
  return sendEmail({
    to: opts.to,
    subject: 'Bienvenue chez FoxEats',
    html,
    headers: { 'X-Entity-Ref-ID': `welcome-${Date.now()}` },
  });
}

/** Confirmation de commande passée */
export async function sendOrderPlacedEmail(opts: { to: string } & OrderPlacedProps) {
  const html = await render(OrderPlacedEmail(opts));
  return sendEmail({
    to: opts.to,
    subject: `Commande #${opts.shortCode} confirmée`,
    html,
    headers: { 'X-Entity-Ref-ID': `order-placed-${opts.shortCode}` },
  });
}

/** Commande livrée + invitation à laisser un avis */
export async function sendOrderDeliveredEmail(opts: { to: string } & OrderDeliveredProps) {
  const html = await render(OrderDeliveredEmail(opts));
  return sendEmail({
    to: opts.to,
    subject: `Bon appétit ! Commande #${opts.shortCode} livrée`,
    html,
    headers: { 'X-Entity-Ref-ID': `order-delivered-${opts.shortCode}` },
  });
}

/** Confirmation de remboursement */
export async function sendRefundEmail(opts: { to: string } & RefundProps) {
  const html = await render(RefundEmail(opts));
  return sendEmail({
    to: opts.to,
    subject: `Remboursement émis pour la commande #${opts.shortCode}`,
    html,
    headers: { 'X-Entity-Ref-ID': `refund-${opts.shortCode}` },
  });
}
