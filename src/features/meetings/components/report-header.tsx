// File: src/features/meetings/components/report-header.tsx
// Purpose: meeting title, date, status, and a way back to the dashboard. Shown regardless of
// whether the report itself exists yet, so it doubles as the header for the processing/failed
// states below.
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Meeting } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<Meeting["status"], string> = {
  UPLOADED: "Uploaded",
  QUEUED: "Queued",
  TRANSCRIBING: "Transcribing",
  ANALYSING: "Analyzing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  PENDING_DELETION: "Pending deletion",
};

const STATUS_VARIANT: Record<Meeting["status"], "default" | "outline" | "success" | "destructive"> =
  {
    UPLOADED: "outline",
    QUEUED: "outline",
    TRANSCRIBING: "default",
    ANALYSING: "default",
    COMPLETED: "success",
    FAILED: "destructive",
    PENDING_DELETION: "outline",
  };

export function ReportHeader({ meeting }: { meeting: Meeting }) {
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to Dashboard
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{meeting.title}</h1>
          <p className="text-sm text-muted-foreground">
            {meeting.meetingDate.toLocaleDateString("en", { dateStyle: "medium" })}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[meeting.status]}>{STATUS_LABEL[meeting.status]}</Badge>
      </div>
    </div>
  );
}
