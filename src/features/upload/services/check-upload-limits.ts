// File: src/features/upload/services/check-upload-limits.ts
// Purpose: enforces the per-hour and per-day limits agreed in Milestone 2 (src/config/limits.ts).
// Runs inside the UploadThing file router's `middleware`, before a file is accepted, so a person
// over quota is stopped before we generate an upload URL, not after the file has already gone up.
import "server-only";
import { db } from "@/lib/db";
import { limits } from "@/config/limits";
import { AppError } from "@/lib/errors";

export class QuotaExceededError extends AppError {
  constructor(message: string) {
    super(message, "QUOTA_EXCEEDED", 429);
  }
}

export async function checkUploadAllowed(userId: string): Promise<void> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [uploadsThisHour, meetingsToday] = await Promise.all([
    db.meetingFile.count({ where: { meeting: { userId }, createdAt: { gte: hourAgo } } }),
    db.meeting.count({ where: { userId, createdAt: { gte: startOfDay } } }),
  ]);

  if (uploadsThisHour >= limits.uploadsPerHour) {
    throw new QuotaExceededError(
      `You can upload up to ${limits.uploadsPerHour} files per hour. Please try again later.`,
    );
  }
  if (meetingsToday >= limits.meetingsPerDay) {
    throw new QuotaExceededError(
      `You can add up to ${limits.meetingsPerDay} meetings per day. Please try again tomorrow.`,
    );
  }
}
