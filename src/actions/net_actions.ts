'use server';

export async function generateIPs(addressRange: string | string[], usedIps: string[] = []): Promise<string[]> {
    // Pokud je addressRange pole, zpracuj všechny rozsahy
    if (Array.isArray(addressRange)) {
        const allIps: string[] = [];
        const usedIpsSet = new Set(usedIps);
        
        for (const range of addressRange) {
            const ips = await generateIPsFromRange(range, usedIpsSet);
            allIps.push(...ips);
        }
        
        // Odstranění duplicit (pokud se rozsahy překrývají)
        return Array.from(new Set(allIps));
    }
    
    // Pokud je to jeden rozsah
    const usedIpsSet = new Set(usedIps);
    return generateIPsFromRange(addressRange, usedIpsSet);
}

function generateIPsFromRange(addressRange: string, usedIpsSet: Set<string>): string[] {
    // Rozdělení IP adresy a prefixu
    const [ip, prefixStr] = addressRange.split('/');
    const prefix = parseInt(prefixStr);

    if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) {
        throw new Error('Neplatný formát CIDR: ' + addressRange);
    }

    // Převod IP adresy na číslo
    const ipParts = ip.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(part => isNaN(part) || part < 0 || part > 255)) {
        throw new Error('Neplatná IP adresa: ' + ip);
    }

    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

    // Výpočet masky a rozsahu
    const mask = ~((1 << (32 - prefix)) - 1);
    const networkNum = ipNum & mask;
    const broadcastNum = networkNum | ~mask;

    // Generování všech IP adres v rozsahu (kromě síťové a broadcast adresy a použitých)
    const ips: string[] = [];
    for (let i = networkNum + 1; i < broadcastNum; i++) {
        const octet1 = (i >>> 24) & 0xFF;
        const octet2 = (i >>> 16) & 0xFF;
        const octet3 = (i >>> 8) & 0xFF;
        const octet4 = i & 0xFF;
        const ipAddr = `${octet1}.${octet2}.${octet3}.${octet4}`;
        
        // Přidat pouze pokud není v seznamu použitých
        if (!usedIpsSet.has(ipAddr)) {
            ips.push(ipAddr);
        }
    }

    return ips;
}