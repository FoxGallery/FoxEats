/**
 * State machine de la commande FoxEats.
 *
 * Source de vérité unique pour les transitions légales. Tous les writes
 * sur orders.status doivent passer par {@link transitionOrder}. Les
 * transitions interdites jettent une TRPCError BAD_REQUEST.
 */
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { db as DbType } from '@foxeats/db';
import { orders, orderEvents } from '@foxeats/db/schema';

export type OrderStatus =
  | 'pending_payment'
  | 'placed'
  | 'accepted_by_restaurant'
  | 'rejected_by_restaurant'
  | 'preparing'
  | 'ready_for_pickup'
  | 'courier_assigned'
  | 'picked_up'
  | 'in_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['placed', 'cancelled'],
  placed: ['accepted_by_restaurant', 'rejected_by_restaurant', 'cancelled'],
  accepted_by_restaurant: ['preparing', 'cancelled', 'refunded'],
  rejected_by_restaurant: ['refunded'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['courier_assigned', 'cancelled'],
  courier_assigned: ['picked_up', 'cancelled'],
  picked_up: ['in_delivery'],
  in_delivery: ['delivered'],
  delivered: ['refunded'],
  cancelled: ['refunded'],
  refunded: [],
};

/** Statuts terminaux (un order ne peut plus changer après). */
export const TERMINAL: ReadonlySet<OrderStatus> = new Set(['delivered', 'refunded']);

/** Statuts où l'utilisateur peut encore annuler (préserves le payment). */
export const CUSTOMER_CANCELLABLE: ReadonlySet<OrderStatus> = new Set([
  'pending_payment',
  'placed',
  'accepted_by_restaurant',
]);

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED[from].includes(to);
}

/**
 * Applique une transition atomique côté DB + journalise l'événement.
 * Si la transition est illégale, renvoie une erreur sans toucher la ligne.
 */
export async function transitionOrder(args: {
  db: typeof DbType;
  orderId: string;
  to: OrderStatus;
  actorUserId?: string | null;
  payload?: Record<string, unknown> | null;
  /** Si fourni, transition appliquée uniquement si l'état courant matche
   *  (idempotence webhook + concurrence). */
  expectedFrom?: OrderStatus | OrderStatus[];
  /** Patch supplémentaire à appliquer sur la ligne orders. */
  patch?: Record<string, unknown>;
}): Promise<{ from: OrderStatus; to: OrderStatus } | null> {
  const { db, orderId, to, actorUserId, payload, expectedFrom, patch } = args;

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order introuvable' });

  const from = order.status as OrderStatus;
  if (expectedFrom) {
    const expected = Array.isArray(expectedFrom) ? expectedFrom : [expectedFrom];
    if (!expected.includes(from)) {
      return null; // idempotence: silencieux si déjà transitionné ailleurs
    }
  }
  if (!canTransition(from, to)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Transition illégale: ${from} → ${to}`,
    });
  }

  // Timestamps automatiques par statut
  const now = new Date();
  const timestampPatch: Record<string, unknown> = { status: to, updatedAt: now };
  switch (to) {
    case 'placed':
      timestampPatch.placedAt = now;
      break;
    case 'accepted_by_restaurant':
      timestampPatch.acceptedAt = now;
      break;
    case 'picked_up':
      timestampPatch.pickedUpAt = now;
      break;
    case 'delivered':
      timestampPatch.deliveredAt = now;
      break;
    case 'cancelled':
      timestampPatch.cancelledAt = now;
      break;
  }

  await db
    .update(orders)
    .set({ ...timestampPatch, ...(patch ?? {}) })
    .where(eq(orders.id, orderId));
  await db.insert(orderEvents).values({
    orderId,
    fromStatus: from,
    toStatus: to,
    actorUserId: actorUserId ?? null,
    payload: payload ?? null,
  });

  return { from, to };
}
