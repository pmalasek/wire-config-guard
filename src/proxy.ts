import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy funkce (dříve middleware v Next.js 15)
 * Spouští se před každým requestem a umožňuje upravit odpověď
 */
export function proxy(request: NextRequest) {
    // Zde můžeš přidat svou logiku
    // Např. autentizace, redirecty, modifikace headers, atd.
    
    // Výpis URL pro debugging
    console.log('Proxy:', request.nextUrl.pathname);
    
    // Pokračovat normálně
    return NextResponse.next();
}

/**
 * Konfigurace - určuje na kterých cestách se proxy spustí
 * Matcher určuje, pro které cesty se má proxy vykonat
 */
export const config = {
    matcher: [
        /*
         * Spustí se pro všechny cesty kromě:
         * - api (API routes)
         * - _next/static (statické soubory)
         * - _next/image (optimalizace obrázků)
         * - favicon.ico, sitemap.xml, robots.txt (metadata soubory)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
