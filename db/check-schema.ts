import { Database } from 'bun:sqlite';

const db = new Database('./database/wire_config_guard.db');
const tables = db.query('SELECT sql FROM sqlite_master WHERE type="table"').all();

console.log('\n📊 Struktura databáze:\n');
tables.forEach((table: any) => {
  console.log(table.sql);
  console.log('\n');
});

db.close();
