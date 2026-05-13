import { pgTable, text, timestamp, uuid, pgEnum, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { orders } from './orders';

export const supportThreadStatusEnum = pgEnum('support_thread_status', [
  'open',
  'pending', // attente client
  'resolved',
  'closed',
]);

export const supportSenderEnum = pgEnum('support_sender', ['customer', 'agent', 'system']);

/**
 * Un fil de support = une conversation entre un user et l'équipe FoxEats.
 * Peut être lié à une commande (litige) ou autonome (question générale).
 */
export const supportThreads = pgTable(
  'support_threads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    subject: text('subject').notNull(),
    status: supportThreadStatusEnum('status').notNull().default('open'),
    assignedAgentId: uuid('assigned_agent_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp('closed_at', { withTimezone: true }),
  },
  (t) => [
    index('support_user_idx').on(t.userId),
    index('support_status_idx').on(t.status),
    index('support_last_msg_idx').on(t.lastMessageAt),
  ],
);

export const supportMessages = pgTable(
  'support_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    threadId: uuid('thread_id')
      .notNull()
      .references(() => supportThreads.id, { onDelete: 'cascade' }),
    senderType: supportSenderEnum('sender_type').notNull(),
    /** Null si senderType = 'system' */
    senderUserId: uuid('sender_user_id').references(() => users.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    /** Métadonnées (attachments URLs, action references, etc.) */
    meta: jsonb('meta').$type<Record<string, unknown>>(),
    readByCustomerAt: timestamp('read_by_customer_at', { withTimezone: true }),
    readByAgentAt: timestamp('read_by_agent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('support_msg_thread_idx').on(t.threadId),
    index('support_msg_created_idx').on(t.createdAt),
  ],
);
