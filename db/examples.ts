// Příklad použití Drizzle ORM s SQLite databází

import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

// ========== PŘÍKLADY POUŽITÍ ==========

// 1. Vložit nový interface
async function insertInterface() {
  const newInterface = await db.insert(schema.interfaces).values({
    filename: 'wg0.conf',
    address: '172.24.4.1/24',
    listenPort: 51820,
    privateKey: 'IMEUtYPjiNW9k2ee0JPbGOaGhChqBDY4kIvwhUORikE=',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  
  return newInterface[0];
}

// 2. Vložit nového peera
async function insertPeer(interfaceId: number) {
  const newPeer = await db.insert(schema.peers).values({
    interfaceId,
    publicKey: '+SUF0I/Pr7XwqTRdG2DX32wgtFQcOQMBKhjp3lhRu3Y=',
    allowedIPs: '172.24.4.2/32',
    description: 'Klient 1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  
  return newPeer[0];
}

// 3. Načíst všechny interfaces s peery
async function getAllInterfacesWithPeers() {
  const interfaces = await db.query.interfaces.findMany({
    with: {
      peers: true,
    },
  });
  
  return interfaces;
}

// 4. Najít interface podle filename
async function findInterfaceByFilename(filename: string) {
  const iface = await db.query.interfaces.findFirst({
    where: eq(schema.interfaces.filename, filename),
    with: {
      peers: true,
    },
  });
  
  return iface;
}

// 5. Aktualizovat peer
async function updatePeer(peerId: number, description: string) {
  await db.update(schema.peers)
    .set({ 
      description,
      updatedAt: new Date(),
    })
    .where(eq(schema.peers.id, peerId));
}

// 6. Smazat interface (automaticky smaže i peery díky CASCADE)
async function deleteInterface(interfaceId: number) {
  await db.delete(schema.interfaces)
    .where(eq(schema.interfaces.id, interfaceId));
}

// 7. Načíst všechny peery pro konkrétní interface
async function getPeersByInterface(interfaceId: number) {
  const peers = await db.query.peers.findMany({
    where: eq(schema.peers.interfaceId, interfaceId),
  });
  
  return peers;
}

export {
  insertInterface,
  insertPeer,
  getAllInterfacesWithPeers,
  findInterfaceByFilename,
  updatePeer,
  deleteInterface,
  getPeersByInterface,
};
