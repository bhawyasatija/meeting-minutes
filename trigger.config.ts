// File: trigger.config.ts
// Purpose: tells the Trigger.dev CLI and cloud where to find background jobs (trigger/) and
// which Trigger.dev project they belong to. The project ref is not a secret; get it from your
// Trigger.dev dashboard after creating a project, and paste it in below.
import { defineConfig } from "@trigger.dev/sdk";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
  project: "proj_nfatkufqqxsqehayxfml",
  dirs: ["./trigger"],
  maxDuration: 600, // seconds; covers a 90-minute recording split into chunks (Milestone 8)
  build: {
    extensions: [
      // `trigger deploy` bundles the Prisma Client that already exists in node_modules at
      // deploy time rather than reinstalling on its own (Debian-based) Linux build machine, so
      // without this a client generated locally on macOS gets shipped as-is and fails at
      // runtime with "could not locate the Query Engine for runtime debian-openssl-3.0.x".
      // This extension re-runs `prisma generate` during the Trigger Cloud build itself, so the
      // deployed bundle always contains an engine matching Trigger's actual runtime, no matter
      // what platform `trigger deploy` was run from. `migrate` is deliberately left off: this
      // fixes the engine mismatch only and does not change how/when migrations are applied
      // (still `pnpm db:deploy`, run by hand, same as before).
      prismaExtension({
        mode: "legacy",
        schema: "prisma/schema.prisma",
      }),
    ],
  },
});
