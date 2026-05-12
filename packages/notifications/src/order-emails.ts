import { sendEmail } from './email';
import {
  orderPlacedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  type OrderEmailContext,
} from './templates/order';

export async function sendOrderPlaced(to: string, ctx: OrderEmailContext) {
  const t = orderPlacedEmail(ctx);
  return sendEmail({ to, subject: t.subject, html: t.html });
}

export async function sendOrderDelivered(to: string, ctx: OrderEmailContext) {
  const t = orderDeliveredEmail(ctx);
  return sendEmail({ to, subject: t.subject, html: t.html });
}

export async function sendOrderCancelled(to: string, ctx: OrderEmailContext & { reason?: string }) {
  const t = orderCancelledEmail(ctx);
  return sendEmail({ to, subject: t.subject, html: t.html });
}
