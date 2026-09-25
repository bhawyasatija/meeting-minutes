// File: src/features/meetings/components/action-items-section.tsx
// Purpose: the one section people scan first. Owner and deadline both fall back to "Not stated" /
// the free-text deadline note (see ActionItem's own schema comments) — never left blank, never
// guessed. Priority uses the design system's highlighter-yellow token (globals.css) only for
// HIGH, matching "highlighter yellow only for action items" from the Milestone 3 design decisions.
import { CalendarDays, User } from "lucide-react";
import type { ActionItem } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRIORITY_VARIANT = {
  HIGH: "highlight",
  MEDIUM: "default",
  LOW: "outline",
} as const;

function formatDeadline(item: ActionItem): { text: string; exact: boolean } | null {
  if (item.deadline) {
    return { text: item.deadline.toLocaleDateString("en", { dateStyle: "medium" }), exact: true };
  }
  if (item.deadlineNote) {
    return { text: item.deadlineNote, exact: false };
  }
  return null;
}

export function ActionItemsSection({ items }: { items: ActionItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Action items</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No action items were identified.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const deadline = formatDeadline(item);
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 space-y-1.5">
                    <p className="font-serif text-[15px] leading-snug">{item.task}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3.5" aria-hidden />
                        {item.ownerName ?? "Not stated"}
                      </span>
                      {deadline && (
                        <span
                          className={
                            deadline.exact
                              ? "inline-flex items-center gap-1 font-mono"
                              : "inline-flex items-center gap-1"
                          }
                        >
                          <CalendarDays className="size-3.5" aria-hidden />
                          {deadline.text}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={PRIORITY_VARIANT[item.priority]} className="shrink-0">
                    {item.priority}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
