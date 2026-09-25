// File: src/features/settings/components/usage-section.tsx
// Purpose: shows the same limits check-upload-limits.ts enforces (src/config/limits.ts), so
// they're documented somewhere a person can actually read them, not just discovered via a 429.
import { limits } from "@/config/limits";

function mb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

export function UsageSection({
  uploadsThisHour,
  uploadsPerHourLimit,
  meetingsToday,
  meetingsPerDayLimit,
}: {
  uploadsThisHour: number;
  uploadsPerHourLimit: number;
  meetingsToday: number;
  meetingsPerDayLimit: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Uploads this hour</p>
          <p className="text-sm font-medium">
            {uploadsThisHour} / {uploadsPerHourLimit}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Meetings today</p>
          <p className="text-sm font-medium">
            {meetingsToday} / {meetingsPerDayLimit}
          </p>
        </div>
      </div>
      <div className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <p>
          Recordings: up to {mb(limits.audio.maxBytes)}MB / {limits.audio.maxMinutes} min (
          {limits.audio.extensions.join(", ").toUpperCase()})
        </p>
        <p>
          Documents: up to {mb(limits.document.maxBytes)}MB (
          {limits.document.extensions.join(", ").toUpperCase()})
        </p>
      </div>
    </div>
  );
}
