// File: src/features/history/components/history-filters.tsx
// Purpose: a plain GET form — no fetch, no client state for the results themselves. Typing a
// search term and pressing Enter, or picking a status, just reloads /history?q=...&status=...
// and the server component re-queries. The only client-side bit is auto-submitting on status
// change, so picking a status doesn't need a separate "Apply" click.
"use client";

import { Search } from "lucide-react";
// Imported from the defining file, not the feature's barrel index — the index also re-exports
// MeetingReport, which pulls in server-only DB code that must never reach this Client Component's
// bundle.
import { MEETING_STATUS_LABEL } from "@/features/meetings/components/meeting-status-badge";

const STATUS_OPTIONS = Object.entries(MEETING_STATUS_LABEL) as [string, string][];

export function HistoryFilters({
  defaultQuery,
  defaultStatus,
}: {
  defaultQuery: string;
  defaultStatus: string;
}) {
  return (
    <form action="/history" method="get" className="flex flex-wrap gap-2">
      <div className="relative flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Search by title…"
          aria-label="Search meetings by title"
          className="h-11 w-full rounded-md border border-border bg-transparent pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9"
        />
      </div>
      <select
        name="status"
        defaultValue={defaultStatus}
        aria-label="Filter by status"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-11 rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
