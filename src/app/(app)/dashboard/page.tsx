import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { getDashboardData, DashboardStats, RecentMeetings } from "@/features/dashboard";
import { Button } from "@/components/ui/button";
import { LiveRefresh } from "@/components/shared/live-refresh";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user.id);

  return (
    <div className="max-w-3xl space-y-6">
      <LiveRefresh active={data.inProgressMeetings > 0} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your meetings.
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Plus /> New meeting
          </Link>
        </Button>
      </div>

      <DashboardStats
        totalMeetings={data.totalMeetings}
        completedMeetings={data.completedMeetings}
        inProgressMeetings={data.inProgressMeetings}
        meetingsTodayCount={data.meetingsTodayCount}
        meetingsPerDayLimit={data.meetingsPerDayLimit}
      />

      <RecentMeetings meetings={data.recentMeetings} />
    </div>
  );
}
