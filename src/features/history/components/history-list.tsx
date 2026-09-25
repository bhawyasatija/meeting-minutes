// File: src/features/history/components/history-list.tsx
// Purpose: renders search results (or an empty state — different copy for "no meetings at all"
// vs. "no meetings match this search", since those call for different next actions).
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MeetingListItem, type MeetingListItemData } from "@/features/meetings";

export function HistoryList({
  meetings,
  isFiltered,
}: {
  meetings: MeetingListItemData[];
  isFiltered: boolean;
}) {
  if (meetings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            {isFiltered
              ? "No meetings match your search."
              : "No meetings yet — upload a recording or document to get started."}
          </p>
          {!isFiltered && (
            <Button asChild size="sm">
              <Link href="/upload">Upload a meeting</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <ul className="divide-y divide-border">
          {meetings.map((meeting) => (
            <MeetingListItem key={meeting.id} meeting={meeting} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
