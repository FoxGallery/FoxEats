import { inngest } from './inngest';
import { sendEmail } from '@foxeats/notifications';

/**
 * Relance panier abandonné — séquence 3 étapes :
 * - 1h après abandon : email rappel doux ("votre panier vous attend")
 * - 24h après : email avec promo -10 % FOXBACK10
 * - 7j après : dernier email "vous nous manquez"
 *
 * Arrêt si event "cart/recovered" reçu entre-temps (le user a finalisé).
 */
export const cartAbandonedFlow = inngest.createFunction(
  {
    id: 'cart-abandoned-flow',
    name: 'Relance panier abandonné',
    triggers: [{ event: 'cart/abandoned' }],
    cancelOn: [{ event: 'cart/recovered', if: 'event.data.userId == async.data.userId' }],
  },
  async ({ event, step }) => {
    const data = event.data as {
      userId: string;
      email: string;
      restaurantId: string;
      restaurantName: string;
      restaurantSlug: string;
      subtotalCents: number;
      itemsCount: number;
    };
    const { email, restaurantName, restaurantSlug, subtotalCents, itemsCount } = data;
    const cartUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app'}/app/r/${restaurantSlug}`;
    const total = (subtotalCents / 100).toFixed(2);

    // 1) 1h après — rappel doux
    await step.sleep('wait-1h', '1h');
    await step.run('send-reminder-1h', async () => {
      return sendEmail({
        to: email,
        subject: `Votre panier vous attend chez ${restaurantName}`,
        html: htmlReminder({
          title: 'Vous oubliez quelque chose ?',
          body: `${itemsCount} article${itemsCount > 1 ? 's' : ''} dans votre panier (${total} €) chez <strong>${restaurantName}</strong>. Reprenez là où vous en étiez.`,
          cta: 'Finaliser ma commande',
          ctaUrl: cartUrl,
        }),
      });
    });

    // 2) 24h après — promo 10 %
    await step.sleep('wait-24h', '23h');
    await step.run('send-promo-24h', async () => {
      return sendEmail({
        to: email,
        subject: '10 % offerts sur votre prochaine commande',
        html: htmlReminder({
          title: '10 % offerts pour vous',
          body: `Utilisez le code <strong>FOXBACK10</strong> à votre prochaine commande. Valable 48h.`,
          cta: 'Commander avec -10 %',
          ctaUrl: `${cartUrl}?promo=FOXBACK10`,
        }),
      });
    });

    // 3) 7j après — dernier email "vous nous manquez"
    await step.sleep('wait-7d', '6d 1h');
    await step.run('send-comeback-7d', async () => {
      return sendEmail({
        to: email,
        subject: 'On vous garde une table',
        html: htmlReminder({
          title: 'Vous nous manquez',
          body: `Plus de 30 restaurants curatés vous attendent sur la Côte d'Azur. Anti-gaspi, livraison 28 min, pourboires 100 % reversés.`,
          cta: 'Redécouvrir FoxEats',
          ctaUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://foxeats.vercel.app/app',
        }),
      });
    });

    return { ok: true } as const;
  },
);

/** Template HTML minimaliste compatible Gmail/Outlook (inline CSS) */
function htmlReminder(opts: { title: string; body: string; cta: string; ctaUrl: string }): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#F2F3F5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F3F5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#FF5A4A 0%,#0F2A56 100%);padding:32px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:800;color:#FFFFFF;letter-spacing:-0.025em;">FoxEats</p>
          <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.9);">La table de la Riviera</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#0A0A0F;line-height:1.2;letter-spacing:-0.025em;">${opts.title}</h1>
          <p style="margin:12px 0 24px;font-size:15px;line-height:1.6;color:#6B6E78;">${opts.body}</p>
          <p style="margin:0;text-align:center;">
            <a href="${opts.ctaUrl}" style="display:inline-block;background:#FF5A4A;color:#FFFFFF;padding:14px 28px;border-radius:16px;font-weight:700;text-decoration:none;font-size:14px;">${opts.cta}</a>
          </p>
        </td></tr>
        <tr><td style="background:#F2F3F5;padding:24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6B6E78;">© ${new Date().getFullYear()} FoxEats · Côte d'Azur</p>
          <p style="margin:6px 0 0;font-size:11px;color:#6B6E78;">
            <a href="https://foxeats.fr/app/profile" style="color:#6B6E78;text-decoration:underline;">Gérer mes préférences</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export const functions = [cartAbandonedFlow];
