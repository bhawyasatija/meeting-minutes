// File: check-upload-limits.test.ts
// Purpose: checkUploadAllowed is the one thing standing between a signed-in user and
// unlimited uploads (src/config/limits.ts: 10/hour, 5 meetings/day). These tests cover the
// three outcomes that actually matter: both counts under limit, the hourly cap tripped, and
// the daily cap tripped -- without touching a real database.
import { describe, expect, it, vi, beforeEach } from "vitest";
import { limits } from "@/config/limits";
import { checkUploadAllowed, QuotaExceededError } from "./check-upload-limits";

// vi.mock's factory is hoisted above these imports, so the mocks it returns must be created
// with vi.hoisted (a plain `const meetingFileCount = vi.fn()` here would not exist yet when
// the factory below actually runs).
const { meetingFileCount, meetingCount } = vi.hoisted(() => ({
  meetingFileCount: vi.fn(),
  meetingCount: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    meetingFile: { count: meetingFileCount },
    meeting: { count: meetingCount },
  },
}));

describe("checkUploadAllowed", () => {
  beforeEach(() => {
    meetingFileCount.mockReset();
    meetingCount.mockReset();
  });

  it("allows the upload when both counts are under their limits", async () => {
    meetingFileCount.mockResolvedValue(limits.uploadsPerHour - 1);
    meetingCount.mockResolvedValue(limits.meetingsPerDay - 1);

    await expect(checkUploadAllowed("user_1")).resolves.toBeUndefined();
  });

  it("rejects once the hourly upload count reaches the limit", async () => {
    meetingFileCount.mockResolvedValue(limits.uploadsPerHour);
    meetingCount.mockResolvedValue(0);

    await expect(checkUploadAllowed("user_1")).rejects.toThrow(QuotaExceededError);
    await expect(checkUploadAllowed("user_1")).rejects.toThrow(/per hour/);
  });

  it("rejects once the daily meeting count reaches the limit, even with hourly uploads free", async () => {
    meetingFileCount.mockResolvedValue(0);
    meetingCount.mockResolvedValue(limits.meetingsPerDay);

    await expect(checkUploadAllowed("user_1")).rejects.toThrow(QuotaExceededError);
    await expect(checkUploadAllowed("user_1")).rejects.toThrow(/per day/);
  });

  it("scopes both counts to the given userId", async () => {
    meetingFileCount.mockResolvedValue(0);
    meetingCount.mockResolvedValue(0);

    await checkUploadAllowed("user_42");

    expect(meetingFileCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ meeting: { userId: "user_42" } }),
      }),
    );
    expect(meetingCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user_42" }),
      }),
    );
  });
});
