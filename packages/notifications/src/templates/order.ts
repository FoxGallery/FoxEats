/**
 * Templates email transactionnels liés à une commande (FoxEats — DA-A).
 * HTML inline-CSS table-based, compatible Gmail/Outlook/Apple Mail.
 */

const COLORS = {
  primary: '#0B3D91',
  accent: '#FF6B5C',
  surface: '#FFF8EE',
  ink: '#0A1733',
  muted: '#5B6478',
  success: '#1A8F4E',
};

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type OrderEmailContext = {
  shortCode: string;
  restaurantName: string;
  customerName?: string | null;
  totalCents: number;
  trackingUrl: string;
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>;
  breakdown: {
    subtotalCents: number;
    serviceFeeCents: number;
    deliveryFeeCents: number;
    tipCents: number;
    discountCents: number;
  };
};

const fmt = (cents: number) => (cents / 100).toFixed(2).replace('.', ',') + ' €';

function shell(opts: { title: string; preheader: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.surface};font-family:Inter,Helvetica,Arial,sans-serif;color:${COLORS.ink};">
<div style="display:none;font-size:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.surface};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 16px -4px rgba(10,23,51,0.1);">
      <tr><td style="background:linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 140%);padding:32px;color:#fff;">
        <div style="font-family:'Cabinet Grotesk',Inter,sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.02em;">FoxEats</div>
        <div style="margin-top:4px;color:#ffffffcc;font-size:13px;">Côte d'Azur</div>
      </td></tr>
      ${opts.body}
    </table>
    <p style="max-width:560px;margin:24px auto 0;font-size:11px;color:${COLORS.muted};line-height:1.5;text-align:center;">© FoxEats · Côte d'Azur</p>
  </td></tr>
</table></body></html>`;
}

export function orderPlacedEmail(ctx: OrderEmailContext) {
  const subject = `Commande confirmée chez ${ctx.restaurantName} (#${ctx.shortCode})`;
  const body = `
<tr><td style="padding:32px 32px 8px;">
  <h1 style="margin:0;font-family:'Cabinet Grotesk',Inter,sans-serif;font-size:26px;font-weight:700;color:${COLORS.ink};letter-spacing:-0.02em;">Merci ${escape(ctx.customerName ?? '')} ! 🎉</h1>
  <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:${COLORS.ink};">
    Votre commande chez <strong>${escape(ctx.restaurantName)}</strong> est confirmée.<br/>
    Numéro de commande : <strong>#${escape(ctx.shortCode)}</strong>
  </p>
</td></tr>
<tr><td style="padding:8px 32px;">
  <a href="${ctx.trackingUrl}" target="_blank" rel="noopener noreferrer"
    style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#fff;background:${COLORS.primary};border-radius:12px;text-decoration:none;">
    Suivre ma commande
  </a>
</td></tr>
<tr><td style="padding:24px 32px 32px;">
  <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.05em;">Récapitulatif</h2>
  ${ctx.items
    .map(
      (it) =>
        `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;">
           <span>${it.quantity}× ${escape(it.name)}</span>
           <span style="font-weight:500;">${fmt(it.unitPriceCents * it.quantity)}</span>
         </div>`,
    )
    .join('')}
  <hr style="border:0;border-top:1px solid #eeeff2;margin:12px 0;" />
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:${COLORS.muted};">
    <tr><td>Sous-total</td><td align="right">${fmt(ctx.breakdown.subtotalCents)}</td></tr>
    <tr><td>Frais de service</td><td align="right">${fmt(ctx.breakdown.serviceFeeCents)}</td></tr>
    <tr><td>Livraison</td><td align="right">${fmt(ctx.breakdown.deliveryFeeCents)}</td></tr>
    ${ctx.breakdown.tipCents > 0 ? `<tr><td>Pourboire</td><td align="right">${fmt(ctx.breakdown.tipCents)}</td></tr>` : ''}
    ${ctx.breakdown.discountCents > 0 ? `<tr><td style="color:${COLORS.success};">Remise</td><td align="right" style="color:${COLORS.success};">-${fmt(ctx.breakdown.discountCents)}</td></tr>` : ''}
    <tr><td style="padding-top:8px;font-size:15px;font-weight:700;color:${COLORS.ink};">Total</td>
        <td align="right" style="padding-top:8px;font-size:15px;font-weight:700;color:${COLORS.ink};">${fmt(ctx.totalCents)}</td></tr>
  </table>
</td></tr>`;
  return {
    subject,
    preheader: `Suivez votre commande #${ctx.shortCode} chez ${ctx.restaurantName}.`,
    html: shell({ title: subject, preheader: `Commande #${ctx.shortCode} confirmée.`, body }),
  };
}

export function orderDeliveredEmail(ctx: OrderEmailContext) {
  const subject = `Bon appétit ! Commande #${ctx.shortCode} livrée`;
  const body = `
<tr><td style="padding:32px 32px 8px;">
  <h1 style="margin:0;font-family:'Cabinet Grotesk',Inter,sans-serif;font-size:26px;font-weight:700;color:${COLORS.ink};letter-spacing:-0.02em;">Bon appétit ! 🍽️</h1>
  <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:${COLORS.ink};">
    Votre commande chez <strong>${escape(ctx.restaurantName)}</strong> a été livrée.<br/>
    Un grand merci pour votre confiance !
  </p>
</td></tr>
<tr><td style="padding:8px 32px;">
  <a href="${ctx.trackingUrl}" target="_blank" rel="noopener noreferrer"
    style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#fff;background:${COLORS.accent};border-radius:12px;text-decoration:none;">
    Noter la commande
  </a>
</td></tr>
<tr><td style="padding:24px 32px 32px;">
  <p style="margin:0;font-size:13px;color:${COLORS.muted};">
    Le reçu officiel est consultable sur la page de la commande pendant 7 jours.
  </p>
</td></tr>`;
  return {
    subject,
    preheader: `Commande #${ctx.shortCode} livrée — bon appétit !`,
    html: shell({ title: subject, preheader: `Livré !`, body }),
  };
}

export function orderCancelledEmail(ctx: OrderEmailContext & { reason?: string }) {
  const subject = `Commande annulée — #${ctx.shortCode}`;
  const body = `
<tr><td style="padding:32px;">
  <h1 style="margin:0;font-family:'Cabinet Grotesk',Inter,sans-serif;font-size:24px;font-weight:700;color:${COLORS.ink};">Commande annulée</h1>
  <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:${COLORS.ink};">
    La commande <strong>#${escape(ctx.shortCode)}</strong> chez ${escape(ctx.restaurantName)} a été annulée.
    ${ctx.reason ? `<br/>Raison : ${escape(ctx.reason)}.` : ''}
    Le remboursement a été initié et apparaîtra sur votre compte sous 5 à 10 jours ouvrés.
  </p>
</td></tr>`;
  return {
    subject,
    preheader: `Commande #${ctx.shortCode} annulée.`,
    html: shell({ title: subject, preheader: `Annulée.`, body }),
  };
}

/**
 * Reçu HTML imprimable post-livraison (rendu identique à l'email order
 * placed mais avec mention "Reçu" et la TVA détaillée).
 */
export function receiptHtml(ctx: OrderEmailContext & { vatCents: number; deliveredAt?: Date }) {
  const dateStr = (ctx.deliveredAt ?? new Date()).toLocaleString('fr-FR');
  const body = `
<tr><td style="padding:32px;">
  <h1 style="margin:0;font-family:'Cabinet Grotesk',Inter,sans-serif;font-size:24px;font-weight:700;color:${COLORS.ink};">Reçu de commande</h1>
  <p style="margin:6px 0 16px;font-size:13px;color:${COLORS.muted};">
    Commande #${escape(ctx.shortCode)} · ${escape(dateStr)}<br/>
    ${escape(ctx.restaurantName)}
  </p>
  ${ctx.items
    .map(
      (it) =>
        `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid #eeeff2;">
           <span>${it.quantity}× ${escape(it.name)}</span>
           <span style="font-weight:500;">${fmt(it.unitPriceCents * it.quantity)}</span>
         </div>`,
    )
    .join('')}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;font-size:13px;color:${COLORS.muted};">
    <tr><td>Sous-total</td><td align="right">${fmt(ctx.breakdown.subtotalCents)}</td></tr>
    <tr><td>Frais de service</td><td align="right">${fmt(ctx.breakdown.serviceFeeCents)}</td></tr>
    <tr><td>Livraison</td><td align="right">${fmt(ctx.breakdown.deliveryFeeCents)}</td></tr>
    ${ctx.breakdown.tipCents > 0 ? `<tr><td>Pourboire</td><td align="right">${fmt(ctx.breakdown.tipCents)}</td></tr>` : ''}
    ${ctx.breakdown.discountCents > 0 ? `<tr><td>Remise</td><td align="right">-${fmt(ctx.breakdown.discountCents)}</td></tr>` : ''}
    <tr><td>Dont TVA 10%</td><td align="right">${fmt(ctx.vatCents)}</td></tr>
    <tr><td style="padding-top:8px;font-size:15px;font-weight:700;color:${COLORS.ink};">Total TTC</td>
        <td align="right" style="padding-top:8px;font-size:15px;font-weight:700;color:${COLORS.ink};">${fmt(ctx.totalCents)}</td></tr>
  </table>
  <p style="margin:24px 0 0;font-size:11px;color:${COLORS.muted};">
    FoxEats SAS · Côte d'Azur · TVA non encore applicable jusqu'au seuil franchise.
  </p>
</td></tr>`;
  return shell({
    title: `Reçu #${ctx.shortCode}`,
    preheader: `Reçu commande #${ctx.shortCode}`,
    body,
  });
}
