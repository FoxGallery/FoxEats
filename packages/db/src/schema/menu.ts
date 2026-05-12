import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { restaurants } from './restaurants';

export const menuCategories = pgTable(
  'menu_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('menu_categories_restaurant_idx').on(t.restaurantId)],
);

export const menuItems = pgTable(
  'menu_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurants.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => menuCategories.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    priceCents: integer('price_cents').notNull(),
    photoUrl: text('photo_url'),
    isAvailable: boolean('is_available').notNull().default(true),
    isPopular: boolean('is_popular').notNull().default(false),
    isSpicy: boolean('is_spicy').notNull().default(false),
    isVegetarian: boolean('is_vegetarian').notNull().default(false),
    isVegan: boolean('is_vegan').notNull().default(false),
    isGlutenFree: boolean('is_gluten_free').notNull().default(false),
    isLocalSpecialty: boolean('is_local_specialty').notNull().default(false),
    allergens: jsonb('allergens').$type<string[]>().notNull().default([]),
    options: jsonb('options').$type<MenuItemOption[]>().notNull().default([]),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('menu_items_restaurant_idx').on(t.restaurantId),
    index('menu_items_category_idx').on(t.categoryId),
  ],
);

export type MenuItemOption = {
  id: string;
  groupName: string;
  required: boolean;
  multiple: boolean;
  choices: { id: string; name: string; priceDeltaCents: number }[];
};

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuCategories.restaurantId],
    references: [restaurants.id],
  }),
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  restaurant: one(restaurants, { fields: [menuItems.restaurantId], references: [restaurants.id] }),
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
}));
