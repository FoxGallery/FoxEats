/**
 * Template email magic link FoxEats — HTML inline CSS, DA-A Méditerranée moderne.
 * Compatible Gmail/Outlook/Apple Mail (table-based, inline styles).
 */

type Locale = 'fr' | 'en' | 'it';

type Strings = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  cta: string;
  validity: string;
  ignore: string;
  signature: string;
  fallbackLabel: string;
};

const COPIES: Record<Locale, Strings> = {
  fr: {
    subject: 'Votre lien de connexion FoxEats',
    preheader: 'Cliquez pour vous connecter à votre compte FoxEats — valide 15 minutes.',
    heading: 'Connexion à FoxEats',
    intro:
      'Bonjour, voici votre lien sécurisé pour vous connecter à FoxEats. Il est valide 15 minutes et utilisable une seule fois.',
    cta: 'Se connecter',
    validity: 'Ce lien expire dans 15 minutes.',
    ignore:
      "Vous n'avez pas demandé cette connexion ? Ignorez simplement cet email, aucun compte n'a été modifié.",
    signature: "À très vite sur la Côte d'Azur,\nL'équipe FoxEats",
    fallbackLabel: 'Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :',
  },
  en: {
    subject: 'Your FoxEats sign-in link',
    preheader: 'Click to sign in to your FoxEats account — valid for 15 minutes.',
    heading: 'Sign in to FoxEats',
    intro:
      'Hi there. Here is your secure link to sign in to FoxEats. It is valid for 15 minutes and can be used once.',
    cta: 'Sign in',
    validity: 'This link expires in 15 minutes.',
    ignore: 'Did not request this sign-in? Just ignore this email, no account changes were made.',
    signature: 'See you on the Riviera,\nThe FoxEats team',
    fallbackLabel: 'If the button does not work, copy this link into your browser:',
  },
  it: {
    subject: 'Il tuo link di accesso a FoxEats',
    preheader: 'Clicca per accedere al tuo account FoxEats — valido 15 minuti.',
    heading: 'Accedi a FoxEats',
    intro:
      'Ciao, ecco il tuo link sicuro per accedere a FoxEats. È valido 15 minuti e usabile una sola volta.',
    cta: 'Accedi',
    validity: 'Questo link scade tra 15 minuti.',
    ignore:
      'Non hai richiesto questo accesso? Ignora questa email, nessuna modifica è stata apportata.',
    signature: 'A presto sulla Costa Azzurra,\nIl team FoxEats',
    fallbackLabel: 'Se il pulsante non funziona, copia questo link nel tuo browser:',
  },
};

const COLORS = {
  primary: '#0B3D91',
  primaryDark: '#072558',
  accent: '#FF6B5C',
  surface: '#FFF8EE',
  ink: '#0A1733',
  muted: '#5B6478',
};

export function renderMagicLinkHtml(opts: { url: string; locale?: Locale }): {
  html: string;
  text: string;
  subject: string;
  preheader: string;
} {
  const locale: Locale = opts.locale ?? 'fr';
  const c = COPIES[locale];
  const safeUrl = String(opts.url);

  const text = [
    c.heading,
    '',
    c.intro,
    '',
    `${c.cta}: ${safeUrl}`,
    '',
    c.validity,
    c.ignore,
    '',
    c.signature.replace(/\n/g, '\n'),
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escape(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.surface};font-family:Inter,Helvetica,Arial,sans-serif;color:${COLORS.ink};">
<div style="display:none;font-size:1px;color:${COLORS.surface};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
${escape(c.preheader)}
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.surface};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 16px -4px rgba(10,23,51,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 140%);padding:48px 32px 56px 32px;text-align:left;">
            <div style="font-family:'Cabinet Grotesk',Inter,Helvetica,Arial,sans-serif;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.02em;">FoxEats</div>
            <div style="margin-top:8px;color:#ffffffcc;font-size:14px;">Côte d&apos;Azur</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px 16px 32px;">
            <h1 style="margin:0 0 16px 0;font-family:'Cabinet Grotesk',Inter,Helvetica,Arial,sans-serif;font-size:28px;line-height:1.15;letter-spacing:-0.02em;color:${COLORS.ink};font-weight:700;">${escape(c.heading)}</h1>
            <p style="margin:0 0 24px 0;font-size:16px;line-height:1.55;color:${COLORS.ink};">${escape(c.intro)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 8px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${COLORS.primary}" style="border-radius:12px;">
                  <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">${escape(c.cta)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px 32px;">
            <p style="margin:0 0 8px 0;font-size:13px;color:${COLORS.muted};line-height:1.5;">${escape(c.fallbackLabel)}</p>
            <p style="margin:0;font-size:12px;color:${COLORS.muted};word-break:break-all;"><a href="${safeUrl}" style="color:${COLORS.muted};text-decoration:underline;">${safeUrl}</a></p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 32px 32px;border-top:1px solid #eeeff2;margin-top:24px;">
            <p style="margin:24px 0 8px 0;font-size:13px;color:${COLORS.muted};line-height:1.5;">${escape(c.validity)}</p>
            <p style="margin:0 0 16px 0;font-size:13px;color:${COLORS.muted};line-height:1.5;">${escape(c.ignore)}</p>
            <p style="margin:0;font-size:14px;color:${COLORS.ink};white-space:pre-line;">${escape(c.signature)}</p>
          </td>
        </tr>
      </table>
      <p style="max-width:560px;margin:24px auto 0 auto;font-size:11px;color:${COLORS.muted};line-height:1.5;text-align:center;">© FoxEats · Côte d&apos;Azur · <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app'}" style="color:${COLORS.muted};text-decoration:underline;">foxeats.vercel.app</a></p>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { html, text, subject: c.subject, preheader: c.preheader };
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
