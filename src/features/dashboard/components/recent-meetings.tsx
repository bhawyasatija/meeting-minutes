// File: src/features/dashboard/components/recent-meetings.tsx
// Purpose: the dashboard's "what's new" card — 6 most recent meetings, with a link to the full
// searchable list on /history. Row rendering itself lives in the meetings feature
// (MeetingListItem) so this file and history's list never drift apart visually.
import Link from "next/link";
import { MeetingListItem, type MeetingListItemData } from "@/features/meetings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentMeetings({ meetings }: { meetings: MeetingListItemData[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent meetings</CardTitle>
        {meetings.length > 0 && (
          <Link href="/history" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No meetings yet — upload a recording or document to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {meetings.map((meeting) => (
              <MeetingListItem key={meeting.id} meeting={meeting} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
