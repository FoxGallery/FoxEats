import { notifications } from '@foxeats/db/schema';
import type { db } from '@foxeats/db/client';

export type NotifKind =
  | 'order_placed'
  | 'order_accepted'
  | 'order_preparing'
  | 'order_ready'
  | 'order_in_delivery'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_refunded'
  | 'promo_available'
  | 'review_request'
  | 'system';

/**
 * Crée une notification in-app pour un user. Toujours non-bloquant — on log si erreur.
 * Le composant NotifBell poll la liste et le compteur côté client (refetchInterval 30s).
 */
export async function pushNotification(
  database: typeof db,
  opts: {
    userId: string;
    kind: NotifKind;
    title: string;
    body?: string;
    href?: string;
    data?: Record<string, unknown>;
  },
) {
  try {
    await database.insert(notifications).values({
      userId: opts.userId,
      kind: opts.kind,
      title: opts.title,
      body: opts.body ?? null,
      href: opts.href ?? null,
      data: opts.data ?? null,
    });
  } catch (err) {
    console.warn('[notify] push failed', err);
  }
}

/** Templates messages — strings pré-rédigés pour cohérence */
export const notifyTemplates = {
  orderAccepted: (shortCode: string, restaurantName: string) => ({
    title: 'Commande acceptée',
    body: `${restaurantName} a accepté votre commande #${shortCode}. Préparation en cours.`,
  }),
  orderPreparing: (shortCode: string) => ({
    title: 'En préparation',
    body: `Votre commande #${shortCode} est en cours de préparation.`,
  }),
  orderReady: (shortCode: string) => ({
    title: 'Prête à partir',
    body: `Votre commande #${shortCode} est prête. Un livreur arrive bientôt.`,
  }),
  orderInDelivery: (shortCode: string, etaMin?: number) => ({
    title: 'En livraison',
    body: etaMin
      ? `Votre commande #${shortCode} est en route. Arrivée estimée dans ~${etaMin} min.`
      : `Votre commande #${shortCode} est en route.`,
  }),
  orderDelivered: (shortCode: string, restaurantName: string) => ({
    title: 'Livrée — Bon appétit !',
    body: `Votre commande #${shortCode} de ${restaurantName} a été livrée.`,
  }),
  orderCancelled: (shortCode: string, reason?: string) => ({
    title: 'Commande annulée',
    body: reason
      ? `Votre commande #${shortCode} a été annulée. Motif : ${reason}`
      : `Votre commande #${shortCode} a été annulée.`,
  }),
  orderRefunded: (shortCode: string, refundCents: number) => ({
    title: 'Remboursement émis',
    body: `Un remboursement de ${(refundCents / 100).toFixed(2)} € a été émis pour la commande #${shortCode}.`,
  }),
  reviewRequest: (restaurantName: string) => ({
    title: 'Donnez votre avis',
    body: `Comment était votre commande chez ${restaurantName} ? Aidez les autres clients.`,
  }),
} as const;
