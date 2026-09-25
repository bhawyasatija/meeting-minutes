// File: src/features/ai/services/analyze-meeting.ts
// Purpose: the orchestrator for Milestone 9. Reads a meeting's transcript, asks the AI provider
// for structured minutes, and writes the result into Report/ReportItem/ActionItem/Participant.
// Called from the Trigger.dev task (trigger/process-meeting-intake.ts) once transcription has
// produced a Transcript row, the same way processMeetingIntake is for transcription itself.
import "server-only";
import type { ReportItemType } from "@prisma/client";
import { db } from "@/lib/db";
import { aiConfig } from "@/config/ai";
import { groqProvider } from "./groq-provider";
import type { AnalysisActionItem, AnalysisResult } from "./types";

/** Converts the model's "Not stated" sentinel to a real null, matching the database's own
 * "null means not stated" convention (see schema.prisma's comments on these columns). */
function orNull(value: string): string | null {
  return value === aiConfig.notStated ? null : value;
}

function parseDeadline(iso: string | null): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

const SECTIONS: { key: keyof AnalysisResult; type: ReportItemType }[] = [
  { key: "agenda", type: "AGENDA" },
  { key: "discussion", type: "DISCUSSION" },
  { key: "decisions", type: "DECISION" },
  { key: "risks", type: "RISK" },
  { key: "openQuestions", type: "OPEN_QUESTION" },
  { key: "nextSteps", type: "NEXT_STEP" },
];

export async function analyzeMeeting(meetingId: string, jobId: string): Promise<void> {
  const meeting = await db.meeting.findUniqueOrThrow({
    where: { id: meetingId },
    include: { transcript: true },
  });
  if (!meeting.transcript) {
    throw new Error("This meeting has no transcript to analyze yet.");
  }

  await db.processingJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  try {
    const result = await groqProvider.analyzeTranscript(
      meeting.transcript.rawText,
      meeting.meetingDate,
    );

    await db.$transaction(async (tx) => {
      // Participants first, so action items below can link to one by name.
      const participants = await Promise.all(
        result.participants.map((p) =>
          tx.participant.upsert({
            where: { meetingId_name: { meetingId, name: p.name } },
            create: { meetingId, name: p.name, role: orNull(p.role) },
            update: { role: orNull(p.role) },
          }),
        ),
      );
      const participantIdByName = new Map(participants.map((p) => [p.name, p.id]));

      const report = await tx.report.create({
        data: {
          meetingId,
          title: result.title,
          executiveSummary: result.executiveSummary,
          conclusion: orNull(result.conclusion),
          model: aiConfig.model,
          promptVersion: aiConfig.promptVersion,
        },
      });

      for (const section of SECTIONS) {
        const items = result[section.key] as string[];
        if (items.length === 0) continue;
        await tx.reportItem.createMany({
          data: items.map((text, position) => ({
            reportId: report.id,
            type: section.type,
            position,
            text,
          })),
        });
      }

      if (result.actionItems.length > 0) {
        await tx.actionItem.createMany({
          data: result.actionItems.map((item: AnalysisActionItem, position) => ({
            reportId: report.id,
            participantId: participantIdByName.get(item.ownerName) ?? null,
            task: item.task,
            ownerName: orNull(item.ownerName),
            deadline: parseDeadline(item.deadlineIso),
            deadlineNote: orNull(item.deadlineNote),
            priority: item.priority,
            position,
          })),
        });
      }

      await tx.meeting.update({ where: { id: meetingId }, data: { status: "COMPLETED" } });
      await tx.processingJob.update({
        where: { id: jobId },
        data: { status: "SUCCEEDED", finishedAt: new Date() },
      });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      await tx.usageRecord.upsert({
        where: { userId_day: { userId: meeting.userId, day: startOfDay } },
        create: {
          userId: meeting.userId,
          day: startOfDay,
          tokensIn: result.usage.tokensIn,
          tokensOut: result.usage.tokensOut,
        },
        update: {
          tokensIn: { increment: result.usage.tokensIn },
          tokensOut: { increment: result.usage.tokensOut },
        },
      });

      await tx.activityEvent.create({
        data: { userId: meeting.userId, meetingId, type: "COMPLETED" },
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI analysis failed.";
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
}
