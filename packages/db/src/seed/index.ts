import 'dotenv/config';
import { db, restaurants, menuCategories, menuItems, users } from '../index';
import { rivieraSeed } from './riviera';

async function main() {
  console.warn('Seeding FoxEats — Côte d\'Azur sample data');
  // Placeholder. M0 issue "Seed Côte d'Azur" implémentera réellement.
  await rivieraSeed({ db, restaurants, menuCategories, menuItems, users });
  console.warn('Seed done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
