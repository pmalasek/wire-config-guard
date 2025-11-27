'use server';

import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

interface Peer {
    publicKey: string;
    presharedKey: string;
    endpoint: string;
    allowedIps: string;
    latestHandshake: number;
    transferRx: number;
    transferTx: number;
    persistentKeepalive: string;
    active: boolean;
}

interface ConfigPeer {
    publicKey: string;
    presharedKey?: string;
    allowedIPs: string;
    endpoint?: string;
    persistentKeepalive?: string;
}

interface ConfigInterface {
    address: string;
    listenPort: number;
    privateKey: string;
    postUp?: string;
    postDown?: string;
    dns?: string;
}

interface WireGuardConfig {
    filename: string;
    interface: ConfigInterface;
    peers: ConfigPeer[];
}

interface WireGuardInterface {
    name: string;
    privateKey: string;
    publicKey: string;
    listenPort: number;
    fwmark: string;
    peers: Peer[];
}

function parseWireGuardConfig(filename: string, content: string): WireGuardConfig {
    const config: WireGuardConfig = {
        filename,
        interface: {
            address: '',
            listenPort: 0,
            privateKey: ''
        },
        peers: []
    };

    const lines = content.split('\n');
    let currentSection: 'interface' | 'peer' | null = null;
    let currentPeer: ConfigPeer | null = null;

    for (let line of lines) {
        // Odstranit komentáře a prázdné řádky
        line = line.split('#')[0].trim();
        if (!line) continue;

        // Detekce sekcí
        if (line === '[Interface]') {
            currentSection = 'interface';
            continue;
        } else if (line === '[Peer]') {
            currentSection = 'peer';
            // Uložit předchozího peera pokud existuje
            if (currentPeer) {
                config.peers.push(currentPeer);
            }
            // Začít nového peera
            currentPeer = {
                publicKey: '',
                allowedIPs: ''
            };
            continue;
        }

        // Parsovat klíč = hodnota
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) continue;

        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();

        if (currentSection === 'interface') {
            switch (key) {
                case 'Address':
                    config.interface.address = value;
                    break;
                case 'ListenPort':
                    config.interface.listenPort = parseInt(value);
                    break;
                case 'PrivateKey':
                    config.interface.privateKey = value;
                    break;
                case 'PostUp':
                    config.interface.postUp = value;
                    break;
                case 'PostDown':
                    config.interface.postDown = value;
                    break;
                case 'DNS':
                    config.interface.dns = value;
                    break;
            }
        } else if (currentSection === 'peer' && currentPeer) {
            switch (key) {
                case 'PublicKey':
                    currentPeer.publicKey = value;
                    break;
                case 'PresharedKey':
                    currentPeer.presharedKey = value;
                    break;
                case 'AllowedIPs':
                    currentPeer.allowedIPs = value;
                    break;
                case 'Endpoint':
                    currentPeer.endpoint = value;
                    break;
                case 'PersistentKeepalive':
                    currentPeer.persistentKeepalive = value;
                    break;
            }
        }
    }

    // Uložit posledního peera
    if (currentPeer) {
        config.peers.push(currentPeer);
    }

    return config;
}

/**
 * Načte informace o aktivních WireGuard připojeních
 * Spouští příkaz 'wg show all dump' a parsuje výstup
 * @returns Objekt s polem interfaces obsahujícím všechny WireGuard rozhraní a jejich peery
 * @throws Error při selhání příkazu wg
 */
export async function activeConnections() {
    try {
        const { stdout: _res } = await execAsync('wg show all dump');

        const _result: { interfaces: WireGuardInterface[] } = { interfaces: [] };
        const interfacesMap = new Map<string, WireGuardInterface>();

        const lines = _res.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const columns = line.split('\t');

            if (columns.length === 5) {
                // Interface line: interface, private-key, public-key, listen-port, fwmark
                const [name, privateKey, publicKey, listenPort, fwmark] = columns;
                interfacesMap.set(name, {
                    name,
                    privateKey,
                    publicKey,
                    listenPort: parseInt(listenPort),
                    fwmark,
                    peers: []
                });
            } else if (columns.length === 9) {
                // Peer line: interface, public-key, preshared-key, endpoint, allowed-ips, latest-handshake, transfer-rx, transfer-tx, persistent-keepalive
                const [interfaceName, publicKey, presharedKey, endpoint, allowedIps, latestHandshake, transferRx, transferTx, persistentKeepalive] = columns;

                const iface = interfacesMap.get(interfaceName);
                if (iface) {
                    const now = Math.floor(Date.now() / 1000);
                    const handshakeTimestamp = parseInt(latestHandshake);
                    const timeSinceHandshake = now - handshakeTimestamp;

                    iface.peers.push({
                        publicKey,
                        presharedKey,
                        endpoint,
                        allowedIps,
                        latestHandshake: handshakeTimestamp,
                        transferRx: parseInt(transferRx),
                        transferTx: parseInt(transferTx),
                        persistentKeepalive,
                        active: handshakeTimestamp > 0 && timeSinceHandshake <= 180
                    });
                }
            }
        }

        _result.interfaces = Array.from(interfacesMap.values());

        return _result;
    } catch (error) {
        console.error('Error executing wg show all dump:', error);
        throw error;
    }
}

export async function activeInterfaces() {
    const activeConns = await activeConnections();
    const result = [];
    for (const iface of activeConns.interfaces) {
        result.push({
            "name": iface.name,
            "privateKey": iface.privateKey,
            "publicKey": iface.publicKey,
            "listenPort": iface.listenPort,
            "fwmark": iface.fwmark,
            "peers": []
        })
    }
    return result;
}
/**
 * Načte všechny WireGuard konfigurace ze složky /etc/wireguard
 * Prochází všechny .conf soubory a parsuje jejich obsah
 * @returns Pole WireGuardConfig objektů s načtenými konfiguracemi
 * @throws Error při problémech se čtením souborů nebo přístupem ke složce
 */
export async function loadWgConfiguration(): Promise<WireGuardConfig[]> {
    const configDir = '/etc/wireguard';
    const configs: WireGuardConfig[] = [];

    try {
        // Najít všechny .conf soubory
        const files = await readdir(configDir);
        const confFiles = files.filter(f => f.endsWith('.conf'));

        // Zpracovat každý soubor
        for (const filename of confFiles) {
            const filePath = join(configDir, filename);
            const content = await readFile(filePath, 'utf-8');

            const config = parseWireGuardConfig(filename, content);
            configs.push(config);
        }

        return configs;
    } catch (error) {
        console.error('Error loading WireGuard configurations:', error);
        throw error;
    }
}

/**
 * Generuje privátní a veřejný klíč pro WireGuard klienta
 * Používá příkazy wg genkey a wg pubkey
 * @returns Objekt s privateKey a publicKey v base64 formátu
 */
export async function generatePeerKeys(): Promise<{ publicKey: string; privateKey: string }> {
    try {
        // Vygenerujeme privátní klíč pomocí wg genkey
        const { stdout: privateKey } = await execAsync('wg genkey');
        const trimmedPrivateKey = privateKey.trim();

        // Z privátního klíče vygenerujeme veřejný klíč pomocí wg pubkey
        const { stdout: publicKey } = await execAsync(`echo "${trimmedPrivateKey}" | wg pubkey`);
        const trimmedPublicKey = publicKey.trim();

        return {
            privateKey: trimmedPrivateKey,
            publicKey: trimmedPublicKey
        };
    } catch (error) {
        console.error('Error generating WireGuard keys:', error);
        throw new Error('Failed to generate WireGuard keys. Make sure wireguard-tools are installed.');
    }
}

export async function restartWgServer() {
    try {
        await execAsync('wg-quick down wg0');
        await execAsync('wg-quick up wg0');
    } catch (error) {
        console.error('Error restarting WireGuard server:', error);
        throw new Error('Failed to restart WireGuard server. Make sure you have the necessary permissions.');
    }
}

export async function getServerCredentials() {
    return {
        privateKey: process.env.WG_SERVER_PRIVATE_KEY || '',
        publicKey: process.env.WG_SERVER_PUBLIC_KEY || '',
        address: process.env.WG_SERVER_ADDRESS || '',
        listenPort: parseInt(process.env.WG_SERVER_LISTEN_PORT || '51820', 10)
    }
}