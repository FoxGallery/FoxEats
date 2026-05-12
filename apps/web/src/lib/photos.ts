// Mapping slot → URL publique, synchronisé avec packages/db/src/seed/photo-urls.json
// Régénéré par : node tooling/scripts/curate-photos.mjs
export const PHOTOS: Record<string, string> = {
  'hero-app': '/photos/hero-app.jpg',
  'hero-marketing': '/photos/hero-marketing.jpg',
  'hero-driver': '/photos/hero-driver.jpg',
  'hero-merchant': '/photos/hero-merchant.jpg',
  'city-nice': '/photos/city-nice.jpg',
  'city-cannes': '/photos/city-cannes.jpg',
  'city-monaco': '/photos/city-monaco.jpg',
  'city-antibes': '/photos/city-antibes.jpg',
  'city-menton': '/photos/city-menton.jpg',
  'city-saint-tropez': '/photos/city-saint-tropez.jpg',
  'city-grasse': '/photos/city-grasse.jpg',
  'city-cagnes': '/photos/city-grasse.jpg',
  'dish-pasta-1': '/photos/dish-pasta-1.jpg',
  'dish-pasta-2': '/photos/dish-pasta-2.jpg',
  'dish-pasta-3': '/photos/dish-pasta-3.jpg',
  'dish-pizza-1': '/photos/dish-pizza-1.jpg',
  'dish-pizza-2': '/photos/dish-pizza-2.jpg',
  'dish-burger-1': '/photos/dish-burger-1.jpg',
  'dish-burger-2': '/photos/dish-burger-1.jpg',
  'dish-sushi-1': '/photos/dish-sushi-1.jpg',
  'dish-sushi-2': '/photos/dish-sushi-2.jpg',
  'dish-salad-1': '/photos/dish-salad-1.jpg',
  'dish-salad-2': '/photos/dish-salad-2.jpg',
  'dish-bowl-1': '/photos/dish-bowl-1.jpg',
  'dish-bowl-2': '/photos/dish-bowl-2.jpg',
  'dish-niçoise': '/photos/dish-niçoise.jpg',
  'dish-socca': '/photos/dish-socca.jpg',
  'dish-pissaladière': '/photos/dish-pissaladière.jpg',
  'dish-ratatouille': '/photos/dish-niçoise.jpg',
  'dish-bouillabaisse': '/photos/dish-bouillabaisse.jpg',
  'dish-tarte-citron': '/photos/dish-dessert-1.jpg',
  'dish-tacos': '/photos/dish-tacos.jpg',
  'dish-curry': '/photos/dish-curry.jpg',
  'dish-ramen': '/photos/dish-ramen.jpg',
  'dish-poke': '/photos/dish-poke.jpg',
  'dish-falafel': '/photos/dish-falafel.jpg',
  'dish-steak': '/photos/dish-steak.jpg',
  'dish-dessert-1': '/photos/dish-dessert-1.jpg',
  'dish-dessert-2': '/photos/dish-dessert-2.jpg',
  'dish-cafe': '/photos/dish-cafe.jpg',
  'resto-bistro-1': '/photos/resto-bistro-1.jpg',
  'resto-bistro-2': '/photos/resto-bistro-2.jpg',
  'resto-italian-1': '/photos/resto-italian-1.jpg',
  'resto-italian-2': '/photos/resto-italian-2.jpg',
  'resto-japanese': '/photos/resto-japanese.jpg',
  'resto-pizzeria': '/photos/resto-pizzeria.jpg',
  'resto-burger': '/photos/dish-burger-1.jpg',
  'resto-cafe-1': '/photos/resto-cafe-1.jpg',
  'resto-cafe-2': '/photos/resto-cafe-2.jpg',
  'resto-fine': '/photos/resto-fine.jpg',
};

function hash(input: string, max: number): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h) % max;
}

const DISH_POOL = Object.keys(PHOTOS).filter((k) => k.startsWith('dish-'));
const RESTO_POOL = Object.keys(PHOTOS).filter((k) => k.startsWith('resto-'));

/** Photo plat déterministe basée sur un seed (nom, slug, id) */
export function dishPhoto(seed: string): string {
  const slot = DISH_POOL[hash(seed, DISH_POOL.length)]!;
  return PHOTOS[slot]!;
}

/** Photo couverture resto déterministe basée sur un seed */
export function restoPhoto(seed: string): string {
  const slot = RESTO_POOL[hash(seed, RESTO_POOL.length)]!;
  return PHOTOS[slot]!;
}

/** Lookup direct par slot. Retourne '' si introuvable. */
export function photo(slot: string): string {
  return PHOTOS[slot] ?? '';
}
