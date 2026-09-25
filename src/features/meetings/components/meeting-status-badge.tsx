// File: src/features/meetings/components/meeting-status-badge.tsx
// Purpose: one place for "what does this status mean and what color is it" — used on the report
// page, the dashboard's recent list, and the history list. Previously duplicated in two places;
// consolidated here so a status only ever needs to be explained once.
import type { Meeting } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export const MEETING_STATUS_LABEL: Record<Meeting["status"], string> = {
  UPLOADED: "Uploaded",
  QUEUED: "Queued",
  TRANSCRIBING: "Transcribing",
  ANALYSING: "Analyzing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  PENDING_DELETION: "Pending deletion",
};

const MEETING_STATUS_VARIANT: Record<
  Meeting["status"],
  "default" | "outline" | "success" | "destructive"
> = {
  UPLOADED: "outline",
  QUEUED: "outline",
  TRANSCRIBING: "default",
  ANALYSING: "default",
  COMPLETED: "success",
  FAILED: "destructive",
  PENDING_DELETION: "outline",
};

// These statuses are the ones LiveRefresh (src/components/shared/live-refresh.tsx) is actively
// polling behind the scenes, so the badge gets a small pulsing dot to say "this is still moving"
// rather than just sitting there looking the same as a stalled state would.
const LIVE_STATUSES: ReadonlySet<Meeting["status"]> = new Set([
  "UPLOADED",
  "QUEUED",
  "TRANSCRIBING",
  "ANALYSING",
]);

export function MeetingStatusBadge({ status }: { status: Meeting["status"] }) {
  return (
    <Badge variant={MEETING_STATUS_VARIANT[status]}>
      {LIVE_STATUSES.has(status) && (
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {MEETING_STATUS_LABEL[status]}
    </Badge>
  );
}
