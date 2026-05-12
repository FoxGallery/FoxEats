import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;
let _db: DrizzleDb | null = null;

function initDb(): DrizzleDb {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema, casing: 'snake_case' });
}

// Lazy proxy: defers neon() init to first query, so Next.js build-time
// "collect page data" with placeholder envs doesn't crash.
export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    if (!_db) _db = initDb();
    const value = Reflect.get(_db, prop, _db);
    return typeof value === 'function' ? value.bind(_db) : value;
  },
});

export type Database = typeof db;
export { schema };
