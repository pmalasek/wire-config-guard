import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import * as schema from './schema';

const sqlite = new Database('./database/wire_config_guard.db', { create: true });
const db = drizzle(sqlite, { schema });

// Vytvoření tabulek ručně
sqlite.run(`
  CREATE TABLE IF NOT EXISTS interfaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    listen_port INTEGER NOT NULL,
    private_key TEXT NOT NULL,
    post_up TEXT,
    post_down TEXT,
    dns TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

sqlite.run(`
  CREATE TABLE IF NOT EXISTS peers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interface_id INTEGER NOT NULL,
    public_key TEXT NOT NULL,
    preshared_key TEXT,
    allowed_ips TEXT NOT NULL,
    endpoint TEXT,
    persistent_keepalive TEXT,
    description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (interface_id) REFERENCES interfaces(id) ON DELETE CASCADE
  )
`);

console.log('✅ Databázové tabulky vytvořeny!');
sqlite.close();
