import { pgTable, text, timestamp, uuid, integer, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { restaurants } from './restaurants';
import { orders } from './orders';

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' })
      .unique(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    courierId: uuid('courier_id').references(() => users.id, { onDelete: 'set null' }),
    restaurantRating: integer('restaurant_rating').notNull(),
    courierRating: integer('courier_rating'),
    comment: text('comment'),
    response: text('response'),
    isPublic: boolean('is_public').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('reviews_restaurant_idx').on(t.restaurantId),
    index('reviews_customer_idx').on(t.customerId),
  ],
);
