// File: src/features/upload/services/file-router.ts
// Purpose: defines what UploadThing will accept, who is allowed to upload, and what happens once
// a file finishes storing. This is the server-side definition; src/app/api/uploadthing/route.ts
// exposes it, and src/features/upload/lib/uploadthing-client.ts gives the browser a typed hook for it.
import "server-only";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/features/auth";
import { queueMeetingIntake } from "@/features/transcripts";
import { checkUploadAllowed } from "./check-upload-limits";
import { createMeetingFromUpload } from "./create-meeting-from-upload";

const f = createUploadthing();

// Runs before an upload starts (in the browser's request, so Clerk's cookies are present).
// Throwing here stops the upload before any bytes are sent.
async function authorizeUpload() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) throw new UploadThingError("You need to be signed in to upload.");
  await checkUploadAllowed(user.id);
  // TEMPORARY (upload-flow debugging): confirms the presigned-URL step has a real userId.
  console.warn("[upload] authorizeUpload ok, userId =", user.id);
  return { userId: user.id };
}

function sourceTypeForMime(mimeType: string): "TXT" | "PDF" | "DOCX" {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "text/plain") return "TXT";
  return "DOCX";
}

// UploadThing only accepts a fixed set of size tiers (1MB, 2MB, 4MB, 8MB, 16MB, 32MB, ...), not an
// arbitrary number. We use the smallest tier at or above our product limits (src/config/limits.ts:
// 100MB audio, 10MB documents), so the real, user-facing limit stays the one shown in the upload UI.
export const meetingFileRouter = {
  // A recording of the meeting. Transcribed by speech recognition (Milestone 8).
  meetingRecording: f({
    audio: { maxFileSize: "128MB", maxFileCount: 1 },
  })
    .middleware(authorizeUpload)
    .onUploadComplete(async ({ metadata, file }) => {
      // TEMPORARY (upload-flow debugging): if this line never appears in the terminal running
      // `pnpm dev`, UploadThing never called this handler at all — see route.ts's isDev fix.
      console.warn(
        "[upload] onUploadComplete (meetingRecording) fired, userId =",
        metadata.userId,
        "file =",
        file.name,
      );
      try {
        const meeting = await createMeetingFromUpload(metadata.userId, "AUDIO", file);
        console.warn("[upload] Meeting created:", meeting.id);
        await queueMeetingIntake(meeting.id);
        console.warn("[upload] queueMeetingIntake done for", meeting.id);
        return { meetingId: meeting.id };
      } catch (error) {
        console.error("[upload] onUploadComplete (meetingRecording) threw:", error);
        throw error;
      }
    }),

  // A written transcript or notes: read directly, no speech recognition needed.
  meetingDocument: f({
    "text/plain": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/pdf": { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(authorizeUpload)
    .onUploadComplete(async ({ metadata, file }) => {
      // TEMPORARY (upload-flow debugging): see the matching comment on meetingRecording above.
      console.warn(
        "[upload] onUploadComplete (meetingDocument) fired, userId =",
        metadata.userId,
        "file =",
        file.name,
      );
      try {
        const meeting = await createMeetingFromUpload(
          metadata.userId,
          sourceTypeForMime(file.type),
          file,
        );
        console.warn("[upload] Meeting created:", meeting.id);
        await queueMeetingIntake(meeting.id);
        console.warn("[upload] queueMeetingIntake done for", meeting.id);
        return { meetingId: meeting.id };
      } catch (error) {
        console.error("[upload] onUploadComplete (meetingDocument) threw:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type MeetingFileRouter = typeof meetingFileRouter;
