import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { restaurants } from './restaurants';

export const promoTypeEnum = pgEnum('promo_type', [
  'percent_off',
  'amount_off',
  'free_delivery',
  'first_order',
  'referral',
  'foxpass_perk',
]);

export const promos = pgTable(
  'promos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    type: promoTypeEnum('type').notNull(),
    valueCents: integer('value_cents'),
    valuePercent: integer('value_percent'),
    minOrderCents: integer('min_order_cents'),
    maxUsages: integer('max_usages'),
    usagesCount: integer('usages_count').notNull().default(0),
    perUserLimit: integer('per_user_limit').notNull().default(1),
    restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }),
    cityScope: text('city_scope'),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull().defaultNow(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('promos_code_idx').on(t.code)],
);
