// File: trigger/process-meeting-intake.ts
// Purpose: the Trigger.dev background job itself. Kept thin on purpose — it only wires the
// job runner up to the real work, which lives in src/features/transcripts (see that file's
// own comment). The `id` below must match the string used in queue-meeting-intake.ts exactly,
// since that's how Trigger.dev finds this task at runtime.
import { task } from "@trigger.dev/sdk";
import { processMeetingIntake } from "@/features/transcripts";

export const processMeetingIntakeTask = task({
  id: "process-meeting-intake",
  run: async (payload: { meetingId: string; jobId: string }) => {
    await processMeetingIntake(payload.meetingId, payload.jobId);
  },
});
