import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const dbPath = process.env.DB_PATH || './database/wire_config_guard.db';
const sqlite = new Database(dbPath, { create: true });
export const db = drizzle(sqlite, { schema });

export { schema };
