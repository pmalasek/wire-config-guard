'use client';
import { activeConnections, generatePeerKeys, loadWgConfiguration } from "../../../actions/wg_actions";
import { generateIPs } from "@/actions/net_actions";
import React from "react";
import axios from "axios";

export default function Home() {
  const [activeCons, setActiveCons] = React.useState<string>("");
  // const data = await activeConnections();
  // const configs = await loadWgConfiguration();
  // const ips2 = await generateIPs([process.env.IP_ADDRESS_RANGE || "192.168.16.0/20"]);
  // const {privateKey, publicKey} = await generatePeerKeys();
  //const excludedIps = ["172.24.4.0","172.24.4.2","172.24.4.3","172.24.4.4","172.24.4.5","172.24.4.6","172.24.4.7","172.24.4.8","172.24.4.9"];
  //const ips2 = await generateIPs(["172.24.4.0/24","192.168.1.0/24"], ["172.24.4.11", "192.168.1.0", ...excludedIps]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <button
          onClick={async () => {
            const result = await axios.get('/api/wg');
            setActiveCons(JSON.stringify(result.data, null, 2));
          }}
          className="mb-32 rounded-full bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-600"
        >
          Zobrazit aktivní připojení WireGuard
        </button>
        <button
          onClick={async () => {
            const result = await axios.get('/api/wg/active');
            setActiveCons(JSON.stringify(result.data, null, 2));
          }}
          className="mb-32 rounded-full bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-600"
        >
          Zobrazit aktivní připojení WireGuard
        </button>
        {/* <pre>{privateKey} - {publicKey}</pre> */}
        {/* <pre>Moje Proměnná : {globalThis.mojePromenna}</pre> */}
        <pre>{activeCons}</pre>
      </main>
    </div>
  );
}
