// Uptime check used by monitoring. Returns only "ok"; never add internal details here.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" });
}
