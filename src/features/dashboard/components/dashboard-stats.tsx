// File: src/features/dashboard/components/dashboard-stats.tsx
// Purpose: a quick "where do I stand" row — total/completed/in-progress meetings, plus today's
// usage against the configured limits (src/config/limits.ts), so quota errors on /upload aren't
// a surprise.
import { Card, CardContent } from "@/components/ui/card";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStats({
  totalMeetings,
  completedMeetings,
  inProgressMeetings,
  meetingsTodayCount,
  meetingsPerDayLimit,
}: {
  totalMeetings: number;
  completedMeetings: number;
  inProgressMeetings: number;
  meetingsTodayCount: number;
  meetingsPerDayLimit: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Total meetings" value={String(totalMeetings)} />
      <Stat label="Completed" value={String(completedMeetings)} />
      <Stat label="In progress" value={String(inProgressMeetings)} />
      <Stat label="Today's meetings" value={`${meetingsTodayCount} / ${meetingsPerDayLimit}`} />
    </div>
  );
}
