import 'dotenv/config';
import { db } from '../index';
import { rivieraSeed } from './riviera';

async function main() {
  console.warn("Seeding FoxEats — Côte d'Azur sample data");
  const result = await rivieraSeed({ db });
  console.warn('Seed done:', result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
