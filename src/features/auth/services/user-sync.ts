// File: src/features/auth/services/user-sync.ts
// Purpose: copies a Clerk account into our own User table, or removes it. Used by both the
// "first visit" sync (get-current-user.ts) and the Clerk webhook route, so the rules live in one place.
import "server-only";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";

/** The few Clerk fields we keep. Anything else about a person stays in Clerk. */
export interface ClerkUserSnapshot {
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
}

/**
 * Creates the user row, or updates it if it already exists. Safe to call many times, even at the
 * same moment from two requests (this is a single atomic database upsert, so no duplicates).
 * The settings row is created later, the first time the person saves a setting (Milestone 11).
 */
export async function upsertUser(snapshot: ClerkUserSnapshot): Promise<User> {
  const { clerkId, email, name, imageUrl } = snapshot;
  return db.user.upsert({
    where: { clerkId },
    create: { clerkId, email, name, imageUrl },
    update: { email, name, imageUrl },
  });
}

/**
 * Deletes the user and, through database cascades, all of their meetings, files records,
 * transcripts, reports and usage. Called when the person deletes their Clerk account.
 * Does nothing if the user was never saved.
 */
export async function deleteUserByClerkId(clerkId: string): Promise<void> {
  await db.user.deleteMany({ where: { clerkId } });
}

/** Shape shared by Clerk's server-side `User` object (only the fields we read). */
interface ClerkUserLike {
  id: string;
  primaryEmailAddress: { emailAddress: string } | null;
  fullName: string | null;
  imageUrl: string;
}

export function snapshotFromClerkUser(user: ClerkUserLike): ClerkUserSnapshot {
  return {
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    name: user.fullName,
    imageUrl: user.imageUrl,
  };
}
