import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Tabulka pro WireGuard rozhraní (konfigurace)
export const interfaces = sqliteTable('interfaces', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull().unique(),
  address: text('address').notNull(),
  listenPort: integer('listen_port').notNull(),
  privateKey: text('private_key').notNull(),
  postUp: text('post_up'),
  postDown: text('post_down'),
  dns: text('dns'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Tabulka pro peery (klienty)
export const peers = sqliteTable('peers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  interfaceId: integer('interface_id').notNull().references(() => interfaces.id, { onDelete: 'cascade' }),
  publicKey: text('public_key').notNull(),
  presharedKey: text('preshared_key'),
  allowedIPs: text('allowed_ips').notNull(),
  endpoint: text('endpoint'),
  persistentKeepalive: text('persistent_keepalive'),
  description: text('description'), // Volitelný popis klienta
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relace
export const interfacesRelations = relations(interfaces, ({ many }) => ({
  peers: many(peers),
}));

export const peersRelations = relations(peers, ({ one }) => ({
  interface: one(interfaces, {
    fields: [peers.interfaceId],
    references: [interfaces.id],
  }),
}));

// Export typů
export type Interface = typeof interfaces.$inferSelect;
export type NewInterface = typeof interfaces.$inferInsert;
export type Peer = typeof peers.$inferSelect;
export type NewPeer = typeof peers.$inferInsert;
