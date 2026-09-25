// File: src/features/history/services/search-meetings.ts
// Purpose: the query behind /history. Filters are read from the URL (GET form, no client JS
// needed to fetch), so the page is a plain server-rendered list — bookmarkable/shareable search
// results come for free. Capped at 50 for now; there's no real pagination yet since this is a
// personal-scale tool, not a case anyone's likely to hit soon.
import "server-only";
import type { MeetingStatus } from "@prisma/client";
import { db } from "@/lib/db";

const RESULTS_LIMIT = 50;

export interface SearchMeetingsFilters {
  query?: string;
  status?: MeetingStatus;
}

export async function searchMeetings(userId: string, filters: SearchMeetingsFilters) {
  return db.meeting.findMany({
    where: {
      userId,
      ...(filters.query ? { title: { contains: filters.query, mode: "insensitive" } } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: RESULTS_LIMIT,
    select: { id: true, title: true, status: true, sourceType: true, createdAt: true },
  });
}

export { RESULTS_LIMIT };
