import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
  uuid,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const restaurantStatusEnum = pgEnum('restaurant_status', [
  'draft',
  'pending',
  'active',
  'paused',
  'rejected',
]);

export const restaurants = pgTable(
  'restaurants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    cuisines: jsonb('cuisines').$type<string[]>().notNull().default([]),
    coverUrl: text('cover_url'),
    logoUrl: text('logo_url'),
    photos: jsonb('photos').$type<string[]>().notNull().default([]),
    status: restaurantStatusEnum('status').notNull().default('draft'),
    rating: text('rating'),
    ratingCount: integer('rating_count').notNull().default(0),
    priceRange: integer('price_range').notNull().default(2),
    deliveryFeeCents: integer('delivery_fee_cents').notNull().default(299),
    deliveryMinCents: integer('delivery_min_cents').notNull().default(1000),
    prepTimeMinMinutes: integer('prep_time_min_minutes').notNull().default(20),
    prepTimeMaxMinutes: integer('prep_time_max_minutes').notNull().default(35),
    street: text('street').notNull(),
    city: text('city').notNull(),
    postalCode: text('postal_code').notNull(),
    country: text('country').notNull().default('FR'),
    lat: text('lat').notNull(),
    lng: text('lng').notNull(),
    phone: text('phone'),
    siret: text('siret'),
    stripeAccountId: text('stripe_account_id'),
    isHalal: boolean('is_halal').notNull().default(false),
    isVegetarianFriendly: boolean('is_vegetarian_friendly').notNull().default(false),
    isVeganFriendly: boolean('is_vegan_friendly').notNull().default(false),
    isLocalSpecialty: boolean('is_local_specialty').notNull().default(false),
    isAntiWasteEnabled: boolean('is_anti_waste_enabled').notNull().default(false),
    openingHours: jsonb('opening_hours').$type<Record<string, { open: string; close: string }[]>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('restaurants_slug_idx').on(t.slug),
    index('restaurants_city_idx').on(t.city),
    index('restaurants_status_idx').on(t.status),
    index('restaurants_owner_idx').on(t.ownerId),
  ],
);

export const restaurantsRelations = relations(restaurants, ({ one }) => ({
  owner: one(users, { fields: [restaurants.ownerId], references: [users.id] }),
}));
