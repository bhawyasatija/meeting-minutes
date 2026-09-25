// File: src/features/meetings/components/report-list-section.tsx
// Purpose: one card for a list-type section (agenda, discussion, decisions, risks, open
// questions, next steps). Renders nothing when the section is empty — the AI is explicitly
// instructed to leave a section empty rather than invent content (see aiConfig / the provider
// prompt), so an empty section is a normal, correct result, not something to apologize for.
import type { ReportItem } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportListSection({ title, items }: { title: string; items: ReportItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-2.5">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
              <span className="font-serif text-[15px] leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
