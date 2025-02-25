// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Initialize Drizzle with D1
export function createDb(env: any) {
  return drizzle(env.DB, { schema });
}

// For server components and API routes to use
export let db: ReturnType<typeof createDb>;

// Initialize the database in edge runtime
export function initDb(env: any) {
  db = createDb(env);
  return db;
}