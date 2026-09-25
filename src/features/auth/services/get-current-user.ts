// File: src/features/auth/services/get-current-user.ts
// Purpose: returns OUR database row for the signed-in person (not just their Clerk ID).
// Every feature uses this to get `user.id`, which it then uses to filter its own queries.
import "server-only";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { UnauthorizedError } from "@/lib/errors";
import { snapshotFromClerkUser, upsertUser } from "./user-sync";

/**
 * Throws UnauthorizedError when nobody is signed in.
 * The first time someone signs in, their row does not exist yet, so we create it here.
 * (That is why the app works on localhost without the Clerk webhook.)
 * `cache` means several callers during one page render share a single database lookup.
 */
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) throw new UnauthorizedError();

  const existing = await db.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) throw new UnauthorizedError();
  return upsertUser(snapshotFromClerkUser(clerkUser));
});
