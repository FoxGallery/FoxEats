import { eq } from 'drizzle-orm';
import type { db as DbType } from '../client';
import { users, restaurants, menuCategories, menuItems } from '../schema';
import { RIVIERA_RESTAURANTS, type SeedRestaurant } from './riviera-data';

const SEED_MERCHANT_EMAIL = 'seed-merchant@foxeats.invalid';

export async function rivieraSeed(ctx: { db: typeof DbType }) {
  const { db } = ctx;

  // 1. Owner partagé pour tous les restos seedés (rôle merchant).
  let merchant = (
    await db.select().from(users).where(eq(users.email, SEED_MERCHANT_EMAIL)).limit(1)
  )[0];
  if (!merchant) {
    [merchant] = await db
      .insert(users)
      .values({
        email: SEED_MERCHANT_EMAIL,
        name: 'FoxEats Seed Merchant',
        role: 'merchant',
        emailVerified: new Date(),
      })
      .returning();
  }
  if (!merchant) throw new Error('Failed to create seed merchant');

  let restaurantsInserted = 0;
  let itemsInserted = 0;

  for (const data of RIVIERA_RESTAURANTS) {
    // Idempotence: skip si déjà seedé (par slug).
    const existing = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.slug, data.slug))
      .limit(1);
    if (existing.length > 0) continue;

    const photos = buildPhotos(data);
    const [resto] = await db
      .insert(restaurants)
      .values({
        ownerId: merchant.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        cuisines: data.cuisines,
        status: 'active',
        rating: data.rating,
        ratingCount: data.ratingCount,
        priceRange: data.priceRange,
        deliveryFeeCents: data.deliveryFeeCents,
        deliveryMinCents: data.deliveryMinCents,
        prepTimeMinMinutes: data.prepTimeMinMinutes,
        prepTimeMaxMinutes: data.prepTimeMaxMinutes,
        street: data.street,
        city: data.city,
        postalCode: data.postalCode,
        country: 'FR',
        lat: String(data.lat),
        lng: String(data.lng),
        coverUrl: photos[0],
        logoUrl: null,
        photos,
        isHalal: data.isHalal ?? false,
        isVegetarianFriendly: data.isVegetarianFriendly ?? false,
        isVeganFriendly: data.isVeganFriendly ?? false,
        isLocalSpecialty: data.isLocalSpecialty ?? false,
        isAntiWasteEnabled: data.isAntiWasteEnabled ?? false,
        openingHours: defaultOpeningHours(data),
      })
      .returning();
    if (!resto) continue;
    restaurantsInserted++;

    let categorySort = 0;
    for (const cat of data.categories) {
      const [category] = await db
        .insert(menuCategories)
        .values({
          restaurantId: resto.id,
          name: cat.name,
          sortOrder: categorySort++,
          isActive: true,
        })
        .returning();
      if (!category) continue;

      let itemSort = 0;
      for (const item of cat.items) {
        await db.insert(menuItems).values({
          restaurantId: resto.id,
          categoryId: category.id,
          name: item.name,
          description: item.description ?? null,
          priceCents: item.priceCents,
          photoUrl: itemPhoto(data, item),
          isAvailable: true,
          isPopular: item.isPopular ?? false,
          isSpicy: item.isSpicy ?? false,
          isVegetarian: item.isVegetarian ?? false,
          isVegan: item.isVegan ?? false,
          isGlutenFree: item.isGlutenFree ?? false,
          isLocalSpecialty: item.isLocalSpecialty ?? false,
          allergens: item.allergens ?? [],
          options: [],
          sortOrder: itemSort++,
        });
        itemsInserted++;
      }
    }
  }

  console.warn(
    `[seed:riviera] ${restaurantsInserted} restos · ${itemsInserted} plats · merchant=${merchant.email}`,
  );
  return { restaurantsInserted, itemsInserted };
}

function buildPhotos(r: SeedRestaurant): string[] {
  const w = 1200;
  const h = 800;
  return [
    `https://picsum.photos/seed/${r.coverPicsumSeed}/${w}/${h}`,
    `https://picsum.photos/seed/${r.coverPicsumSeed}-2/${w}/${h}`,
    `https://picsum.photos/seed/${r.coverPicsumSeed}-3/${w}/${h}`,
  ];
}

function itemPhoto(r: SeedRestaurant, itemName: { name: string }): string {
  const slug = itemName.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://picsum.photos/seed/${r.slug}-${slug}/600/600`;
}

function defaultOpeningHours(r: SeedRestaurant) {
  // Schéma minimal pour M2: même horaire chaque jour, M6 raffinera.
  const isBakery = r.cuisines.includes('bakery');
  const isAntiWaste = r.isAntiWasteEnabled ?? false;
  if (isAntiWaste) {
    return {
      monday: [{ open: '19:00', close: '21:00' }],
      tuesday: [{ open: '19:00', close: '21:00' }],
      wednesday: [{ open: '19:00', close: '21:00' }],
      thursday: [{ open: '19:00', close: '21:00' }],
      friday: [{ open: '19:00', close: '21:00' }],
      saturday: [{ open: '19:00', close: '21:00' }],
      sunday: [],
    };
  }
  if (isBakery) {
    const range = [
      { open: '07:00', close: '13:00' },
      { open: '16:00', close: '19:30' },
    ];
    return {
      monday: range,
      tuesday: range,
      wednesday: range,
      thursday: range,
      friday: range,
      saturday: range,
      sunday: [{ open: '07:00', close: '13:00' }],
    };
  }
  const range = [
    { open: '11:30', close: '14:30' },
    { open: '18:30', close: '22:30' },
  ];
  return {
    monday: range,
    tuesday: range,
    wednesday: range,
    thursday: range,
    friday: [
      { open: '11:30', close: '14:30' },
      { open: '18:30', close: '23:00' },
    ],
    saturday: [
      { open: '11:30', close: '14:30' },
      { open: '18:30', close: '23:00' },
    ],
    sunday: r.cuisines.includes('niçoise') ? range : [],
  };
}
