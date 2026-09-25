// File: src/features/dashboard/services/get-recent-meetings.ts
// Purpose: a lightweight, userId-scoped list for the temporary dashboard placeholder, so there's
// an obvious way to reach a meeting's report. The real dashboard (search, filters, stats) is
// Milestone 11 — this is deliberately just enough to link out, not a rebuild.
import "server-only";
import { db } from "@/lib/db";

export async function getRecentMeetings(userId: string, take = 8) {
  return db.meeting.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, title: true, status: true, createdAt: true },
  });
}
