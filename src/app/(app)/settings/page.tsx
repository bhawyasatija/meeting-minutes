import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth";
import { getUsageSummary, AccountSection, ThemeSection, UsageSection } from "@/features/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const usage = await getUsageSummary(user.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Your account, appearance, and current usage.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountSection user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage &amp; limits</CardTitle>
        </CardHeader>
        <CardContent>
          <UsageSection
            uploadsThisHour={usage.uploadsThisHour}
            uploadsPerHourLimit={usage.uploadsPerHourLimit}
            meetingsToday={usage.meetingsToday}
            meetingsPerDayLimit={usage.meetingsPerDayLimit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
