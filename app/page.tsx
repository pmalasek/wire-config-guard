import Image from "next/image";
import { activeConnections, loadWgConfiguration } from "./actions/wg_actions";
import { generateIPs } from "./actions/net_actions";

export default async function Home() {
  const data = await activeConnections();
  const configs = await loadWgConfiguration();
  const ips2 = await generateIPs([process.env.IP_ADDRESS_RANGE || "192.168.16.0/20"]);
  //const excludedIps = ["172.24.4.0","172.24.4.2","172.24.4.3","172.24.4.4","172.24.4.5","172.24.4.6","172.24.4.7","172.24.4.8","172.24.4.9"];
  //const ips2 = await generateIPs(["172.24.4.0/24","192.168.1.0/24"], ["172.24.4.11", "192.168.1.0", ...excludedIps]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <pre>{ips2.length} - {JSON.stringify(ips2, null, 2)}</pre>
      </main>
    </div>
  );
}
