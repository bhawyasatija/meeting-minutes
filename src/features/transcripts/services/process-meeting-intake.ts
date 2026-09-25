// File: src/features/transcripts/services/process-meeting-intake.ts
// Purpose: the actual work of turning an uploaded file into a transcript. Called from the
// Trigger.dev task (trigger/process-meeting-intake.ts), which only wires this up to the
// background-job runner. Kept here, not in trigger/, so it follows the same "only services touch
// the database" rule as the rest of the app and stays testable on its own.
import "server-only";
import { analyzeMeeting } from "@/features/ai";
import { db } from "@/lib/db";
import { extractDocumentText } from "./extract-document-text";
import { saveTranscript } from "./save-transcript";
import { transcribeAudioFile } from "./whisper-transcribe";

export async function processMeetingIntake(meetingId: string, jobId: string): Promise<void> {
  const meeting = await db.meeting.findUniqueOrThrow({
    where: { id: meetingId },
    include: { files: true },
  });
  const file = meeting.files[0];
  if (!file) throw new Error("This meeting has no uploaded file to process.");

  await Promise.all([
    db.meeting.update({ where: { id: meetingId }, data: { status: "TRANSCRIBING" } }),
    db.processingJob.update({
      where: { id: jobId },
      data: { status: "RUNNING", startedAt: new Date() },
    }),
  ]);

  // This try/catch covers transcription only, and only ever marks THIS job (jobId) and the
  // meeting as failed for a transcription failure. AI analysis below is deliberately outside
  // it: analyzeMeeting has its own job row and its own success/failure handling, so a failure
  // there must never overwrite this job's (already-true) SUCCEEDED status.
  try {
    const result =
      meeting.sourceType === "AUDIO"
        ? await transcribeAudioFile(file.url)
        : await extractDocumentText(file.url, meeting.sourceType);

    await saveTranscript(meetingId, result);
    await db.processingJob.update({
      where: { id: jobId },
      data: { status: "SUCCEEDED", finishedAt: new Date() },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed.";
    await Promise.all([
      db.meeting.update({
        where: { id: meetingId },
        data: { status: "FAILED", errorMessage: message },
      }),
      db.processingJob.update({
        where: { id: jobId },
        data: { status: "FAILED", error: message, finishedAt: new Date() },
      }),
    ]);
    throw error; // Trigger.dev records the failed run and can be told to retry it.
  }

  // Transcription succeeded. Hand off to AI analysis (Milestone 9) with its own job row, so the
  // two stages show up separately in ProcessingJob history even though they run in the same
  // background task. analyzeMeeting handles its own meeting-status and job-status updates,
  // including on failure, and rethrows so Trigger.dev still records the run as failed.
  const analysisJob = await db.processingJob.create({
    data: { meetingId, type: "ANALYSE", status: "QUEUED" },
  });
  await analyzeMeeting(meetingId, analysisJob.id);
}
