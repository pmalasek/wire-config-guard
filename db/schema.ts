import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tabulka pro WireGuard rozhraní (konfigurace)
export const interfaces = sqliteTable('peers', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    public_key: text('public_key').notNull(),
    private_key: text('private_key').notNull(),
    peer_name: text('peer_name').notNull(),
    description: text('description'),
    ip_address: text('ip_address').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
