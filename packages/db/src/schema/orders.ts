import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
  pgEnum,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { restaurants } from './restaurants';

export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'placed',
  'accepted_by_restaurant',
  'rejected_by_restaurant',
  'preparing',
  'ready_for_pickup',
  'courier_assigned',
  'picked_up',
  'in_delivery',
  'delivered',
  'cancelled',
  'refunded',
]);

export const orderTypeEnum = pgEnum('order_type', [
  'delivery',
  'pickup',
  'group',
  'scheduled',
  'anti_waste',
]);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shortCode: text('short_code').notNull().unique(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'restrict' }),
    courierId: uuid('courier_id').references(() => users.id, { onDelete: 'set null' }),
    type: orderTypeEnum('type').notNull().default('delivery'),
    status: orderStatusEnum('status').notNull().default('pending_payment'),
    items: jsonb('items').$type<OrderItem[]>().notNull(),
    subtotalCents: integer('subtotal_cents').notNull(),
    deliveryFeeCents: integer('delivery_fee_cents').notNull(),
    serviceFeeCents: integer('service_fee_cents').notNull(),
    discountCents: integer('discount_cents').notNull().default(0),
    foxCoinsUsedCents: integer('fox_coins_used_cents').notNull().default(0),
    tipCents: integer('tip_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),
    paymentMethod: text('payment_method').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    deliveryAddress: jsonb('delivery_address').$type<DeliveryAddress>(),
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
    placedAt: timestamp('placed_at', { withTimezone: true }),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    pickedUpAt: timestamp('picked_up_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),
    customerNotes: text('customer_notes'),
    leaveAtDoor: boolean('leave_at_door').notNull().default(false),
    deliveryProofPhotoUrl: text('delivery_proof_photo_url'),
    deliveryProofSignatureUrl: text('delivery_proof_signature_url'),
    deliveryProofRecordedAt: timestamp('delivery_proof_recorded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('orders_customer_idx').on(t.customerId),
    index('orders_restaurant_idx').on(t.restaurantId),
    index('orders_courier_idx').on(t.courierId),
    index('orders_status_idx').on(t.status),
    index('orders_short_code_idx').on(t.shortCode),
  ],
);

export type OrderItem = {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  options: { id: string; name: string; priceDeltaCents: number }[];
  notes?: string;
};

export type DeliveryAddress = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
  instructions?: string;
};

export const orderEvents = pgTable(
  'order_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    fromStatus: orderStatusEnum('from_status'),
    toStatus: orderStatusEnum('to_status').notNull(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('order_events_order_idx').on(t.orderId)],
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, { fields: [orders.customerId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [orders.restaurantId], references: [restaurants.id] }),
  courier: one(users, { fields: [orders.courierId], references: [users.id] }),
  events: many(orderEvents),
}));
