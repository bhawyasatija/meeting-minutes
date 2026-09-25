// File: src/components/shared/live-refresh.tsx
// Purpose: while something is still processing (a meeting being transcribed/analyzed), the pages
// that show its status are Server Components that only fetch once on load — so without this,
// the person has to manually reload to see "Queued" turn into a finished report. This is a tiny
// client component with no visible UI: while `active` is true it calls router.refresh() every
// few seconds, which re-runs the page's server-side data fetch and re-renders with fresh data.
// Once nothing is left in progress, the parent stops passing active=true and polling stops.
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 4000;

export function LiveRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active, router]);

  return null;
}
