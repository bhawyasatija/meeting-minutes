// File: src/features/meetings/components/report-unavailable-state.tsx
// Purpose: what to show instead of a report when there isn't one yet (still processing) or
// there never will be one (processing failed) — so the page never looks broken or empty.
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Meeting } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";

const PROCESSING_LABEL: Record<Meeting["status"], string> = {
  UPLOADED: "Your file has been received and is queued to start.",
  QUEUED: "Your meeting is queued for processing.",
  TRANSCRIBING: "Transcribing the recording…",
  ANALYSING: "Generating your meeting minutes…",
  COMPLETED: "Generating your meeting minutes…",
  FAILED: "Generating your meeting minutes…",
  PENDING_DELETION: "This meeting is scheduled for deletion.",
};

export function ReportProcessingState({ status }: { status: Meeting["status"] }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{PROCESSING_LABEL[status]}</p>
        <p className="text-xs text-muted-foreground">
          Refresh this page in a minute to check progress.
        </p>
      </CardContent>
    </Card>
  );
}

export function ReportFailedState({ errorMessage }: { errorMessage: string | null }) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <AlertTriangle className="size-6 text-destructive" aria-hidden />
        <p className="text-sm font-medium">This meeting could not be processed.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {errorMessage ??
            "Something went wrong while generating the report. Please try uploading again."}
        </p>
      </CardContent>
    </Card>
  );
}
