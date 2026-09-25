import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth";
import { getRecentMeetings, RecentMeetings } from "@/features/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

// Temporary: proves login and the database work together, plus a lightweight recent-meetings
// list so a completed meeting's report is reachable. The real dashboard is Milestone 11.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const meetings = await getRecentMeetings(user.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          You are signed in as {user.email ?? "your account"}, and your account is saved in the
          database (since {user.createdAt.toLocaleDateString("en", { dateStyle: "medium" })}). The
          full dashboard is built in Milestone 11.
        </p>
      </div>
      <RecentMeetings meetings={meetings} />
    </div>
  );
}
