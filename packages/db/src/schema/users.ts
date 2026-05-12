import { pgTable, text, timestamp, boolean, pgEnum, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['customer', 'courier', 'merchant', 'admin']);
export const localeEnum = pgEnum('locale', ['fr', 'en', 'it']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('email_verified', { withTimezone: true }),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    phone: text('phone'),
    locale: localeEnum('locale').notNull().default('fr'),
    role: userRoleEnum('role').notNull().default('customer'),
    dietaryFlags: jsonb('dietary_flags').$type<string[]>().default([]),
    foxCoinsBalance: text('fox_coins_balance').notNull().default('0'),
    foxPassActiveUntil: timestamp('fox_pass_active_until', { withTimezone: true }),
    marketingConsent: boolean('marketing_consent').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('users_email_idx').on(t.email), index('users_role_idx').on(t.role)],
);

export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    label: text('label'),
    street: text('street').notNull(),
    city: text('city').notNull(),
    postalCode: text('postal_code').notNull(),
    country: text('country').notNull().default('FR'),
    lat: text('lat').notNull(),
    lng: text('lng').notNull(),
    instructions: text('instructions'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('addresses_user_idx').on(t.userId)],
);

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  providerId: text('provider_id').notNull(),
  accountId: text('account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  scope: text('scope'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));
