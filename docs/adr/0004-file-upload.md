# ADR 0004: File upload (Milestone 7)

File: docs/adr/0004-file-upload.md. Purpose: records why upload is built the way it is.

## Decisions

1. **UploadThing**, as planned in Milestone 2. The browser uploads straight to UploadThing's storage;
   our server never handles the file bytes, only metadata, which keeps the app fast and simple.
2. **Two typed endpoints**, `meetingRecording` (audio, up to the Milestone 2 limit) and `meetingDocument`
   (txt/pdf/docx). Splitting them lets each enforce its own size limit and map to the right `SourceType`.
3. **Authorization happens in the file router's `middleware`**, which runs on the browser's authenticated
   request (Clerk cookies are present there), not in the `/api/uploadthing` route itself. That route is
   public in `src/middleware.ts` because UploadThing's own completion callback calls it server-to-server,
   with no Clerk session — this is standard for UploadThing and does not weaken security, since every
   upload still had to pass `middleware` first.
4. **Upload limits are checked with two direct database counts** (uploads this hour, meetings today),
   not Upstash Redis. Milestone 2 reserved Redis for rate-limiting _unauthenticated_ endpoints; every
   upload here is by a signed-in user, so a database count is simpler and accurate enough. Redis stays
   on the plan for Milestone 8+ if an unauthenticated endpoint needs it.
5. **One upload creates one Meeting.** A meeting with several files is a later milestone; Milestone 7 keeps
   the simplest version that lets speech recognition (Milestone 8) start work on something real.
6. **No schema change.** `Meeting` and `MeetingFile`, designed in Milestone 2, already fit exactly.
7. **The upload UI is hand-built** with the existing design tokens and `Button` component, instead of
   UploadThing's stock dropzone component, to keep it visually consistent with the rest of the app.

## Consequences

- `UPLOADTHING_TOKEN` must be set (see `.env.example`); `src/lib/env.ts` now requires it.
- `next build` and CI need `UPLOADTHING_TOKEN` set (a placeholder value is fine for a build that doesn't upload).
