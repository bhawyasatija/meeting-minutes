// File: src/features/upload/services/create-meeting-from-upload.ts
// Purpose: turns one successfully-stored file into a Meeting + MeetingFile row, owned by the
// person who uploaded it. Called from the UploadThing file router's onUploadComplete.
import "server-only";
import type { SourceType } from "@prisma/client";
import { db } from "@/lib/db";

export interface UploadedFileInfo {
  key: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

function titleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./]+$/, "").trim();
  return withoutExtension.length > 0 ? withoutExtension : "Untitled meeting";
}

export async function createMeetingFromUpload(
  userId: string,
  sourceType: SourceType,
  file: UploadedFileInfo,
) {
  return db.meeting.create({
    data: {
      userId,
      title: titleFromFileName(file.name),
      sourceType,
      status: "UPLOADED",
      files: {
        create: {
          storageKey: file.key,
          url: file.url,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        },
      },
      activityEvents: {
        create: { type: "UPLOADED", user: { connect: { id: userId } } },
      },
    },
  });
}
