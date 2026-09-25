// File: src/features/settings/services/get-usage-summary.ts
// Purpose: read-only version of the counts check-upload-limits.ts enforces, so Settings can show
// "you're at 3/10 uploads this hour" instead of the user only finding out by hitting a 429.
import "server-only";
import { db } from "@/lib/db";
import { limits } from "@/config/limits";

export async function getUsageSummary(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [uploadsThisHour, meetingsToday] = await Promise.all([
    db.meetingFile.count({ where: { meeting: { userId }, createdAt: { gte: hourAgo } } }),
    db.meeting.count({ where: { userId, createdAt: { gte: startOfDay } } }),
  ]);

  return {
    uploadsThisHour,
    uploadsPerHourLimit: limits.uploadsPerHour,
    meetingsToday,
    meetingsPerDayLimit: limits.meetingsPerDay,
  };
}
