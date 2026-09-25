// File: src/app/api/uploadthing/route.ts
// Purpose: the public endpoint UploadThing's servers and the browser both call. Public in
// src/middleware.ts because UploadThing's own callback has no Clerk session; the real
// authorization happens inside file-router.ts's middleware, which runs on the browser's request.
import { createRouteHandler } from "uploadthing/next";
import { meetingFileRouter } from "@/features/upload";

export const { GET, POST } = createRouteHandler({
  router: meetingFileRouter,
  // Without this, UploadThing's SDK has no way to know it's running locally, and silently skips
  // the background "simulate the callback" step it otherwise does in dev. Its real webhook (the
  // one that calls onUploadComplete) is a request FROM UploadThing's cloud TO a public URL, which
  // can never reach localhost — so without this flag, uploads "succeed" client-side (the file
  // really is stored) but onUploadComplete, and therefore createMeetingFromUpload, never runs and
  // nothing is written to the database. Stays false in production, where the real webhook is used.
  config: { isDev: process.env.NODE_ENV !== "production" },
});
