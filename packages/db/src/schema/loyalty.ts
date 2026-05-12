import { pgTable, text, timestamp, uuid, integer, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { orders } from './orders';

export const foxCoinsLedgerKindEnum = pgEnum('foxcoins_kind', [
  'earn_order',
  'earn_referral',
  'earn_promo',
  'spend_order',
  'expire',
  'adjust',
]);

export const foxCoinsLedger = pgTable(
  'foxcoins_ledger',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: foxCoinsLedgerKindEnum('kind').notNull(),
    amountCents: integer('amount_cents').notNull(),
    relatedOrderId: uuid('related_order_id').references(() => orders.id, { onDelete: 'set null' }),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('foxcoins_ledger_user_idx').on(t.userId)],
);

export const foxPassSubscriptions = pgTable(
  'foxpass_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    status: text('status').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelAtPeriodEnd: text('cancel_at_period_end'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('foxpass_subs_user_idx').on(t.userId)],
);
