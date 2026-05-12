import { pgTable, text, timestamp, uuid, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { users } from './users';

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
    stripeChargeId: text('stripe_charge_id'),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('eur'),
    method: text('method').notNull(),
    status: text('status').notNull(),
    failureReason: text('failure_reason'),
    receiptUrl: text('receipt_url'),
    refundedCents: integer('refunded_cents').notNull().default(0),
    rawPayload: jsonb('raw_payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('payments_order_idx').on(t.orderId), index('payments_user_idx').on(t.userId)],
);

export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    beneficiaryUserId: uuid('beneficiary_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    stripeTransferId: text('stripe_transfer_id').unique(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('eur'),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('payouts_beneficiary_idx').on(t.beneficiaryUserId)],
);
