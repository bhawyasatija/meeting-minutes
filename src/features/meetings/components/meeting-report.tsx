// File: src/features/meetings/components/meeting-report.tsx
// Purpose: the report page's actual content. An async Server Component (no client state needed —
// nothing here is interactive yet), so it can fetch the meeting directly and 404 if it doesn't
// belong to the signed-in user. Milestone 10 scope: read-only view. Editing comes later.
import type { ReportItemType } from "@prisma/client";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveRefresh } from "@/components/shared/live-refresh";
import { getMeetingReport } from "../services/get-meeting-report";
import { ActionItemsSection } from "./action-items-section";
import { ReportFailedState, ReportProcessingState } from "./report-unavailable-state";
import { ReportHeader } from "./report-header";
import { ReportListSection } from "./report-list-section";

const SECTIONS: { type: ReportItemType; title: string }[] = [
  { type: "AGENDA", title: "Agenda" },
  { type: "DISCUSSION", title: "Discussion" },
  { type: "DECISION", title: "Decisions" },
  { type: "RISK", title: "Risks" },
  { type: "OPEN_QUESTION", title: "Open questions" },
  { type: "NEXT_STEP", title: "Next steps" },
];

export async function MeetingReport({ meetingId }: { meetingId: string }) {
  const user = await getCurrentUser();
  const meeting = await getMeetingReport(meetingId, user.id);
  if (!meeting) notFound();

  const { report } = meeting;
  const stillProcessing = meeting.status !== "FAILED" && !report;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <LiveRefresh active={stillProcessing} />
      <ReportHeader meeting={meeting} />

      {meeting.status === "FAILED" ? (
        <ReportFailedState errorMessage={meeting.errorMessage} />
      ) : !report ? (
        <ReportProcessingState status={meeting.status} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Executive summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-serif text-base leading-relaxed">{report.executiveSummary}</p>
              {report.conclusion && (
                <p className="border-t border-border pt-3 font-serif text-sm leading-relaxed text-muted-foreground">
                  <span className="font-sans text-xs font-medium tracking-wide text-foreground uppercase">
                    Conclusion —{" "}
                  </span>
                  {report.conclusion}
                </p>
              )}
            </CardContent>
          </Card>

          {SECTIONS.map(({ type, title }) => (
            <ReportListSection
              key={type}
              title={title}
              items={report.items.filter((item) => item.type === type)}
            />
          ))}

          <ActionItemsSection items={report.actionItems} />
        </>
      )}
    </div>
  );
}
