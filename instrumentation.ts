// Definice typu pro TypeScript
declare global {
  var mojePromenna: string | undefined;
  // nebo složitější objekt
  var config: {
    initialized: boolean;
    data: any;
  } | undefined;
}

export async function register() {
    console.log("*".repeat(80));
    console.log("*".repeat(80));
    console.log('Registering instrumentation hook...');
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Tento kód se spustí pouze na serveru při startu
        console.log('🚀 Server se spouští...');

        // Zde můžete volat vaše inicializační funkce
        // Například:
        // await initializeDatabase();
        // await loadConfiguration();
    }
    console.log("*".repeat(80));
    console.log("*".repeat(80));
    globalThis.mojePromenna = "hodnota_xxx";
}
