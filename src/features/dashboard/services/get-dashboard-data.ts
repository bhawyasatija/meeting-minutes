// File: src/features/dashboard/services/get-dashboard-data.ts
// Purpose: everything the dashboard needs, in one query batch. Counts + today's usage give the
// user a sense of where they stand against their limits; the meeting list is capped at 6 since
// the full list lives on /history.
import "server-only";
import { db } from "@/lib/db";
import { limits } from "@/config/limits";

export async function getDashboardData(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [
    totalMeetings,
    completedMeetings,
    inProgressMeetings,
    meetingsToday,
    uploadsThisHour,
    recentMeetings,
  ] = await Promise.all([
    db.meeting.count({ where: { userId } }),
    db.meeting.count({ where: { userId, status: "COMPLETED" } }),
    db.meeting.count({
      where: { userId, status: { in: ["UPLOADED", "QUEUED", "TRANSCRIBING", "ANALYSING"] } },
    }),
    db.meeting.count({ where: { userId, createdAt: { gte: startOfDay } } }),
    db.meetingFile.count({ where: { meeting: { userId }, createdAt: { gte: hourAgo } } }),
    db.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, status: true, sourceType: true, createdAt: true },
    }),
  ]);

  return {
    totalMeetings,
    completedMeetings,
    inProgressMeetings,
    meetingsTodayCount: meetingsToday,
    meetingsPerDayLimit: limits.meetingsPerDay,
    uploadsThisHourCount: uploadsThisHour,
    uploadsPerHourLimit: limits.uploadsPerHour,
    recentMeetings,
  };
}
