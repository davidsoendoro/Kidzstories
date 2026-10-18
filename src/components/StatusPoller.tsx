"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Polls a status endpoint and refreshes the page once the job leaves the pending state. */
export function StatusPoller({ url, pending = "generating", intervalMs = 2500 }: { url: string; pending?: string; intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const ct = res.headers.get("content-type") ?? "";
        const data = ct.includes("application/json") ? await res.json() : { status: "ready" };
        if (data.status !== pending) {
          router.refresh();
          return;
        }
      } catch {
        // transient network error - keep polling
      }
      if (!stopped) setTimeout(tick, intervalMs);
    };
    const t = setTimeout(tick, intervalMs);
    return () => { stopped = true; clearTimeout(t); };
  }, [url, pending, intervalMs, router]);
  return null;
}
