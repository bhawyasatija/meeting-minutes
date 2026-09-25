// File: src/features/transcripts/services/queue-meeting-intake.ts
// Purpose: starts processing for a newly-uploaded meeting. Called right after upload
// (src/features/upload/services/file-router.ts). Records a ProcessingJob so its history is
// visible later, then hands the real work to a Trigger.dev background job.
import "server-only";
import { tasks } from "@trigger.dev/sdk";
import { db } from "@/lib/db";

export async function queueMeetingIntake(meetingId: string): Promise<void> {
  const job = await db.processingJob.create({
    data: { meetingId, type: "TRANSCRIBE", status: "QUEUED" },
  });

  // "process-meeting-intake" must match the `id` in trigger/process-meeting-intake.ts exactly.
  const handle = await tasks.trigger("process-meeting-intake", { meetingId, jobId: job.id });

  await Promise.all([
    db.processingJob.update({ where: { id: job.id }, data: { triggerRunId: handle.id } }),
    db.meeting.update({ where: { id: meetingId }, data: { status: "QUEUED" } }),
  ]);
}
