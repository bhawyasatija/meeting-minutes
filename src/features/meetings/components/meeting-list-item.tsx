// File: src/features/meetings/components/meeting-list-item.tsx
// Purpose: one row for a meeting in a list — used by the dashboard's recent-meetings card and
// the history page's full list, so both stay visually identical and only need fixing in one place.
import { FileAudio, FileText } from "lucide-react";
import Link from "next/link";
import type { SourceType } from "@prisma/client";
import { MeetingStatusBadge } from "./meeting-status-badge";

const SOURCE_ICON: Record<SourceType, typeof FileAudio> = {
  AUDIO: FileAudio,
  PASTED_TEXT: FileText,
  TXT: FileText,
  PDF: FileText,
  DOCX: FileText,
};

export interface MeetingListItemData {
  id: string;
  title: string;
  status:
    | "UPLOADED"
    | "QUEUED"
    | "TRANSCRIBING"
    | "ANALYSING"
    | "COMPLETED"
    | "FAILED"
    | "PENDING_DELETION";
  sourceType: SourceType;
  createdAt: Date;
}

export function MeetingListItem({ meeting }: { meeting: MeetingListItemData }) {
  const Icon = SOURCE_ICON[meeting.sourceType];

  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{meeting.title}</p>
          <p className="text-xs text-muted-foreground">
            {meeting.createdAt.toLocaleDateString("en", { dateStyle: "medium" })}
          </p>
        </div>
      </div>
      {meeting.status === "COMPLETED" ? (
        <Link
          href={`/meetings/${meeting.id}`}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          View report
        </Link>
      ) : (
        <MeetingStatusBadge status={meeting.status} />
      )}
    </li>
  );
}
