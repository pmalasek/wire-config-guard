# Drizzle ORM s SQLite - Dokumentace

## 📦 Nainstalované balíčky

- `drizzle-orm` - ORM pro TypeScript/JavaScript
- `drizzle-kit` - CLI nástroj pro migrace (pro studio)
- Bun nativní SQLite driver

## 🗂️ Struktura

```
db/
├── schema.ts      # Definice databázových tabulek
├── index.ts       # Databázový klient
├── migrate.ts     # Migrační skript
└── examples.ts    # Příklady použití
```

## 🚀 Dostupné skripty

```bash
# Vytvoření/aktualizace databázových tabulek
bun run db:migrate

# Spuštění Drizzle Studio (webové rozhraní pro správu DB)
bun run db:studio
```

## 📊 Databázové schéma

### Tabulka `interfaces`
- **id** - Auto-increment primární klíč
- **filename** - Název konfiguračního souboru (unikátní)
- **address** - IP adresa interfacu
- **listenPort** - Port pro naslouchání
- **privateKey** - Privátní klíč
- **postUp** - Post-up příkazy (volitelné)
- **postDown** - Post-down příkazy (volitelné)
- **dns** - DNS servery (volitelné)
- **createdAt** - Datum vytvoření
- **updatedAt** - Datum poslední aktualizace

### Tabulka `peers`
- **id** - Auto-increment primární klíč
- **interfaceId** - Foreign key na interfaces (CASCADE DELETE)
- **publicKey** - Veřejný klíč peera
- **presharedKey** - Pre-shared key (volitelné)
- **allowedIPs** - Povolené IP adresy
- **endpoint** - Endpoint peera (volitelné)
- **persistentKeepalive** - Keepalive nastavení (volitelné)
- **description** - Popis klienta (volitelné)
- **createdAt** - Datum vytvoření
- **updatedAt** - Datum poslední aktualizace

## 💡 Příklady použití

### Import
```typescript
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
```

### Vložení interface
```typescript
const newInterface = await db.insert(schema.interfaces).values({
  filename: 'wg0.conf',
  address: '172.24.4.1/24',
  listenPort: 51820,
  privateKey: 'xxx',
  createdAt: new Date(),
  updatedAt: new Date(),
}).returning();
```

### Vložení peera
```typescript
const newPeer = await db.insert(schema.peers).values({
  interfaceId: 1,
  publicKey: 'yyy',
  allowedIPs: '172.24.4.2/32',
  description: 'Klient 1',
  createdAt: new Date(),
  updatedAt: new Date(),
}).returning();
```

### Načtení s relacemi
```typescript
// Všechny interfaces s jejich peery
const interfaces = await db.query.interfaces.findMany({
  with: {
    peers: true,
  },
});

// Najít podle filename
const iface = await db.query.interfaces.findFirst({
  where: eq(schema.interfaces.filename, 'wg0.conf'),
  with: {
    peers: true,
  },
});
```

### Aktualizace
```typescript
await db.update(schema.peers)
  .set({ 
    description: 'Nový popis',
    updatedAt: new Date(),
  })
  .where(eq(schema.peers.id, peerId));
```

### Mazání
```typescript
// Smaže interface i všechny jeho peery (CASCADE)
await db.delete(schema.interfaces)
  .where(eq(schema.interfaces.id, interfaceId));
```

## 🔗 Relace

Schéma obsahuje relace mezi tabulkami:
- **interfaces.peers** - One-to-Many: Interface má více peerů
- **peers.interface** - Many-to-One: Peer patří k jednomu interfacu

Díky relacím můžete snadno načítat související data pomocí `with`:

```typescript
const result = await db.query.interfaces.findMany({
  with: { peers: true }
});
```

## 📖 Další zdroje

- [Drizzle ORM Dokumentace](https://orm.drizzle.team/)
- [Bun SQLite](https://bun.sh/docs/api/sqlite)
