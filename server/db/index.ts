import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ Warning: DATABASE_URL is not set in environment.');
}

export const pool = new pg.Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
