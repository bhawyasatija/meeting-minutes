// File: src/features/meetings/services/get-meeting-report.ts
// Purpose: the one query the report page runs. `where: { id, userId }` (not just `id`) is what
// stops one user from ever loading another user's meeting by guessing/changing the URL — a
// mismatch returns null, same as "doesn't exist", and the page 404s either way.
import "server-only";
import { db } from "@/lib/db";

export async function getMeetingReport(meetingId: string, userId: string) {
  return db.meeting.findFirst({
    where: { id: meetingId, userId },
    include: {
      report: {
        include: {
          items: { orderBy: { position: "asc" } },
          actionItems: { orderBy: { position: "asc" } },
        },
      },
    },
  });
}

export type MeetingReport = NonNullable<Awaited<ReturnType<typeof getMeetingReport>>>;
