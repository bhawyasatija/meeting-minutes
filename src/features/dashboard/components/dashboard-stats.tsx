// File: src/features/dashboard/components/dashboard-stats.tsx
// Purpose: a quick "where do I stand" row — total/completed/in-progress meetings, plus today's
// usage against the configured limits (src/config/limits.ts), so quota errors on /upload aren't
// a surprise.
import { Card, CardContent } from "@/components/ui/card";

// A short stagger (60ms per card) so the row reveals left-to-right instead of popping in at once.
function Stat({ label, value, delayMs }: { label: string; value: string; delayMs: number }) {
  return (
    <Card
      className="animate-fade-up transition-shadow hover:shadow-md"
      style={{ animationDelay: `${delayMs}ms` }}
    >
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
      <Stat label="Total meetings" value={String(totalMeetings)} delayMs={0} />
      <Stat label="Completed" value={String(completedMeetings)} delayMs={60} />
      <Stat label="In progress" value={String(inProgressMeetings)} delayMs={120} />
      <Stat
        label="Today's meetings"
        value={`${meetingsTodayCount} / ${meetingsPerDayLimit}`}
        delayMs={180}
      />
    </div>
  );
}
