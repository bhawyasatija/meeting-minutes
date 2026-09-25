import { auth } from "@clerk/nextjs/server";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Returns the signed-in user's Clerk ID, or throws UnauthorizedError.
 * Every Server Action and API route calls this first (step 1 of the entry-point checklist).
 * When you need our own database row (its `id` filters all data queries), use getCurrentUser().
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();
  return userId;
}
