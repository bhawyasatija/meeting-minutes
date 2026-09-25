// File: src/features/dashboard/components/recent-meetings.tsx
// Purpose: the dashboard's placeholder meeting list. Completed meetings link straight to their
// report; anything still in flight or failed shows a status badge instead of a dead link.
import { FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getRecentMeetings } from "../services/get-recent-meetings";

const STATUS_LABEL: Record<string, string> = {
  UPLOADED: "Uploaded",
  QUEUED: "Queued",
  TRANSCRIBING: "Transcribing",
  ANALYSING: "Analyzing",
  FAILED: "Failed",
  PENDING_DELETION: "Pending deletion",
};

type RecentMeeting = Awaited<ReturnType<typeof getRecentMeetings>>[number];

export function RecentMeetings({ meetings }: { meetings: RecentMeeting[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent meetings</CardTitle>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No meetings yet — upload a recording or document to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
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
                  <Badge variant={meeting.status === "FAILED" ? "destructive" : "outline"}>
                    {STATUS_LABEL[meeting.status] ?? meeting.status}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
