import type { Metadata } from "next";
import type { MeetingStatus } from "@prisma/client";
import { getCurrentUser } from "@/features/auth";
import { searchMeetings, HistoryFilters, HistoryList, RESULTS_LIMIT } from "@/features/history";
import { MEETING_STATUS_LABEL } from "@/features/meetings";
import { LiveRefresh } from "@/components/shared/live-refresh";

const IN_PROGRESS_STATUSES = ["UPLOADED", "QUEUED", "TRANSCRIBING", "ANALYSING"];

export const metadata: Metadata = { title: "History" };

const VALID_STATUSES = new Set(Object.keys(MEETING_STATUS_LABEL));

function parseStatus(value: string | undefined): MeetingStatus | undefined {
  return value && VALID_STATUSES.has(value) ? (value as MeetingStatus) : undefined;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const user = await getCurrentUser();
  const parsedStatus = parseStatus(status);
  const meetings = await searchMeetings(user.id, { query: q, status: parsedStatus });

  const hasInProgress = meetings.some((m) => IN_PROGRESS_STATUSES.includes(m.status));

  return (
    <div className="max-w-3xl space-y-6">
      <LiveRefresh active={hasInProgress} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground">
          Every meeting you&apos;ve uploaded, searchable by title.
        </p>
      </div>

      <HistoryFilters defaultQuery={q ?? ""} defaultStatus={parsedStatus ?? ""} />

      <HistoryList meetings={meetings} isFiltered={Boolean(q || parsedStatus)} />

      {meetings.length === RESULTS_LIMIT && (
        <p className="text-xs text-muted-foreground">
          Showing the most recent {RESULTS_LIMIT} results — narrow your search to see more specific
          meetings.
        </p>
      )}
    </div>
  );
}
