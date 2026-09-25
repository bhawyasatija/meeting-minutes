// File: src/features/transcripts/services/save-transcript.ts
// Purpose: writes a finished transcript (from speech recognition or document text extraction)
// into the database as one Transcript row plus its TranscriptSegment rows, and marks the
// meeting ready for the next stage. Called by process-meeting-intake.ts once text is ready.
import "server-only";
import type { TranscriptSource } from "@prisma/client";
import { db } from "@/lib/db";

export interface TranscriptSegmentInput {
  startMs: number;
  endMs: number;
  text: string;
}

export interface TranscriptResult {
  text: string;
  source: TranscriptSource;
  segments: TranscriptSegmentInput[];
}

function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export async function saveTranscript(meetingId: string, result: TranscriptResult): Promise<void> {
  await db.$transaction(async (tx) => {
    const transcript = await tx.transcript.create({
      data: {
        meetingId,
        rawText: result.text,
        source: result.source,
        wordCount: countWords(result.text),
      },
    });

    if (result.segments.length > 0) {
      await tx.transcriptSegment.createMany({
        data: result.segments.map((segment, position) => ({
          transcriptId: transcript.id,
          position,
          startMs: segment.startMs,
          endMs: segment.endMs,
          text: segment.text,
        })),
      });
    }

    // Ready for AI analysis (Milestone 9). Nothing acts on this status yet, which is expected
    // until that milestone is built.
    await tx.meeting.update({ where: { id: meetingId }, data: { status: "ANALYSING" } });
  });
}
