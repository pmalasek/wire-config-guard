import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

const dbPath = process.env.DB_PATH || './database/wire_config_guard.db';
const sqlite = new Database(dbPath, { create: true });
const db = drizzle(sqlite);

async function runMigrations() {
  console.log('🔄 Spouštění migrací ze složky drizzle/...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrace úspěšně provedeny!');
  } catch (error) {
    console.error('❌ Chyba při migraci:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

runMigrations().catch((err) => {
  console.error('Migrace selhala:', err);
  process.exit(1);
});
