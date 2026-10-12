// File: get-meeting-report.test.ts
// Purpose: getMeetingReport is the query that stops one user from loading another user's
// meeting by guessing/editing an id in the URL. The whole point is the `userId` in the
// `where` clause, so these tests assert on the exact query shape, not just "it returns
// something" -- a regression that dropped the userId filter would still "work" by that
// weaker standard.
import { describe, expect, it, vi, beforeEach } from "vitest";

const { findFirst } = vi.hoisted(() => ({ findFirst: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: { meeting: { findFirst } },
}));

import { getMeetingReport } from "./get-meeting-report";

describe("getMeetingReport", () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it("filters by both meetingId and userId together, not meetingId alone", async () => {
    findFirst.mockResolvedValue(null);

    await getMeetingReport("meeting_1", "user_1");

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "meeting_1", userId: "user_1" },
      }),
    );
  });

  it("returns null for a meeting that belongs to someone else, instead of throwing", async () => {
    // A real database call with a mismatched userId finds no row and returns null; this
    // confirms the service passes that straight through rather than, say, retrying without
    // the userId filter.
    findFirst.mockResolvedValue(null);

    const result = await getMeetingReport("someone_elses_meeting", "user_1");

    expect(result).toBeNull();
  });

  it("includes the report's items and action items, ordered by position", async () => {
    findFirst.mockResolvedValue({ id: "meeting_1", report: { items: [], actionItems: [] } });

    await getMeetingReport("meeting_1", "user_1");

    const call = findFirst.mock.calls[0]?.[0];
    expect(call?.include?.report?.include?.items?.orderBy).toEqual({ position: "asc" });
    expect(call?.include?.report?.include?.actionItems?.orderBy).toEqual({ position: "asc" });
  });
});
