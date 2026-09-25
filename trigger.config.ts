// File: trigger.config.ts
// Purpose: tells the Trigger.dev CLI and cloud where to find background jobs (trigger/) and
// which Trigger.dev project they belong to. The project ref is not a secret; get it from your
// Trigger.dev dashboard after creating a project, and paste it in below.
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_nfatkufqqxsqehayxfml",
  dirs: ["./trigger"],
  maxDuration: 600, // seconds; covers a 90-minute recording split into chunks (Milestone 8)
});
