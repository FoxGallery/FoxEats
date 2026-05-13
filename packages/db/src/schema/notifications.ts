import { pgTable, text, timestamp, uuid, boolean, pgEnum, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notifKindEnum = pgEnum('notif_kind', [
  'order_placed',
  'order_accepted',
  'order_preparing',
  'order_ready',
  'order_in_delivery',
  'order_delivered',
  'order_cancelled',
  'order_refunded',
  'promo_available',
  'review_request',
  'system',
]);

/**
 * Centre de notifications in-app (web + mobile)
 * Une notif est créée à chaque event utilisateur, sert le badge bell + drawer.
 */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: notifKindEnum('kind').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    /** Deeplink vers la ressource (ex: /app/orders/{id}) */
    href: text('href'),
    /** Données structurées contextuelles (orderId, restaurantId, etc.) */
    data: jsonb('data').$type<Record<string, unknown>>(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('notif_user_idx').on(t.userId),
    index('notif_user_read_idx').on(t.userId, t.readAt),
    index('notif_user_created_idx').on(t.userId, t.createdAt),
  ],
);

/**
 * Préférences notifications par canal et par catégorie.
 * 3 canaux : in-app (toujours actif), email (par défaut on), push (par défaut on)
 */
export const notifPrefs = pgTable('notif_prefs', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Email
  emailOrderUpdates: boolean('email_order_updates').notNull().default(true),
  emailPromotions: boolean('email_promotions').notNull().default(true),
  emailNewsletter: boolean('email_newsletter').notNull().default(false),
  // Push
  pushOrderUpdates: boolean('push_order_updates').notNull().default(true),
  pushPromotions: boolean('push_promotions').notNull().default(false),
  // Système
  systemTransactional: boolean('system_transactional').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
