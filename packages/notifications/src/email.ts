import { Resend } from 'resend';

let _resend: Resend | null = null;

export function resend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is required');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const from = opts.from ?? process.env.RESEND_FROM ?? 'FoxEats <noreply@foxeats.fr>';
  return resend().emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html });
}
