// Temporary body for pages whose real content arrives in a later milestone.
export function ComingSoon({ title, milestone }: { title: string; milestone: number }) {
  return (
    <div className="max-w-2xl space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">This page is built in Milestone {milestone}.</p>
    </div>
  );
}
