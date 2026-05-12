import { pgTable, text, timestamp, boolean, uuid, integer, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const courierStatusEnum = pgEnum('courier_status', ['offline', 'online', 'on_delivery', 'paused']);
export const vehicleTypeEnum = pgEnum('vehicle_type', ['bike', 'ebike', 'scooter', 'motorbike', 'car', 'walk']);

export const couriers = pgTable(
  'couriers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    status: courierStatusEnum('status').notNull().default('offline'),
    vehicle: vehicleTypeEnum('vehicle').notNull().default('bike'),
    siret: text('siret'),
    iban: text('iban'),
    kycStatus: text('kyc_status').notNull().default('pending'),
    rating: text('rating'),
    ratingCount: integer('rating_count').notNull().default(0),
    completedDeliveries: integer('completed_deliveries').notNull().default(0),
    cancellationRate: text('cancellation_rate').notNull().default('0'),
    lastLat: text('last_lat'),
    lastLng: text('last_lng'),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    documents: jsonb('documents').$type<Record<string, { url: string; verifiedAt?: string }>>().default({}),
    isAvailableForRiviera: boolean('is_available_for_riviera').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('couriers_status_idx').on(t.status), index('couriers_last_seen_idx').on(t.lastSeenAt)],
);

export const courierLocations = pgTable(
  'courier_locations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courierId: uuid('courier_id')
      .notNull()
      .references(() => couriers.id, { onDelete: 'cascade' }),
    lat: text('lat').notNull(),
    lng: text('lng').notNull(),
    accuracy: text('accuracy'),
    heading: text('heading'),
    speed: text('speed'),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('courier_locations_courier_idx').on(t.courierId, t.recordedAt)],
);

export const couriersRelations = relations(couriers, ({ one, many }) => ({
  user: one(users, { fields: [couriers.userId], references: [users.id] }),
  locations: many(courierLocations),
}));
