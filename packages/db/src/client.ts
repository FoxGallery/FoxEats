import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema, casing: 'snake_case' });
export type Database = typeof db;
export { schema };
