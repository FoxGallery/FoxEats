import { z } from 'zod';

// --- Identifiants ---
export const idSchema = z.string().uuid();
export const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// --- Géographie ---
export const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const addressSchema = z.object({
  label: z.string().max(60).optional(),
  street: z.string().min(2).max(200),
  city: z.string().min(2).max(80),
  postalCode: z.string().regex(/^\d{5}$/),
  country: z.string().length(2).default('FR'),
  coords: latLngSchema,
  instructions: z.string().max(500).optional(),
});

// --- Utilisateur ---
export const userRoleSchema = z.enum(['customer', 'courier', 'merchant', 'admin']);
export const localeSchema = z.enum(['fr', 'en', 'it']);

// --- Restaurant ---
export const restaurantStatusSchema = z.enum(['draft', 'pending', 'active', 'paused', 'rejected']);
export const cuisineSchema = z.enum([
  'french',
  'italian',
  'japanese',
  'chinese',
  'indian',
  'mexican',
  'american',
  'mediterranean',
  'niçoise',
  'pizza',
  'burger',
  'sushi',
  'healthy',
  'vegan',
  'vegetarian',
  'dessert',
  'bakery',
  'breakfast',
  'seafood',
  'middle-eastern',
  'african',
  'lebanese',
  'thai',
  'vietnamese',
  'korean',
  'other',
]);

// --- Menu ---
export const menuItemOptionSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(80),
  priceDelta: z.number().int(),
  required: z.boolean().default(false),
});

// --- Commande ---
export const orderStatusSchema = z.enum([
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

export const paymentMethodSchema = z.enum([
  'card',
  'apple_pay',
  'google_pay',
  'sepa',
  'cash_on_delivery',
  'foxcoins',
]);

// --- Préférences ---
export const dietaryFlagSchema = z.enum([
  'halal',
  'kosher',
  'vegetarian',
  'vegan',
  'gluten-free',
  'lactose-free',
  'nut-free',
  'pork-free',
]);

// --- Pagination ---
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type LatLng = z.infer<typeof latLngSchema>;
export type Address = z.infer<typeof addressSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type Locale = z.infer<typeof localeSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type Cuisine = z.infer<typeof cuisineSchema>;
export type DietaryFlag = z.infer<typeof dietaryFlagSchema>;
