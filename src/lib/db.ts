// File: src/lib/db.ts
// Purpose: the one place the database connection is created. Only "service" files
// (src/features/*/services/*) may import `db`; pages and components call services instead.
import "server-only";
import { PrismaClient } from "@prisma/client";

// In development Next.js reloads code often. Without this cache every reload would open a
// new connection and the database would run out of connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
