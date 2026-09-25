# ADR 0005: Speech recognition (Milestone 8)

File: docs/adr/0005-speech-recognition.md. Purpose: records why this milestone is built the way it is.

## Decisions

1. **OpenAI Whisper (`whisper-1`)**, as planned, called from a Trigger.dev background job
   (`trigger/process-meeting-intake.ts`) so uploading never blocks on transcription.
2. **Chunking for large files.** Whisper accepts at most 25MB per request; our upload limit is
   100MB. `src/features/transcripts/services/whisper-transcribe.ts` measures the recording's
   length with `music-metadata` (a pure-JavaScript metadata reader, no binary needed), and if the
   file is over the safe chunk size, splits it with ffmpeg into pieces (stream-copied, no
   re-encoding, so it's fast) before transcribing each one and stitching the text and timestamps
   back into a single transcript. `ffmpeg-static` ships the ffmpeg binary as a plain npm package,
   so nothing needs installing on the Mac or wherever the background job runs. (`ffprobe-static`
   was tried first for the duration check but dropped: its bundled binaries made it a slow,
   flaky install; `music-metadata` reads duration from the file itself with no binary at all.)
3. **Scope addition: document text extraction.** TXT/PDF/DOCX uploads don't need speech
   recognition, but Milestone 9 (AI analysis) needs _something_ to read for them too. This
   milestone extracts their plain text into the same `Transcript` table
   (`extract-document-text.ts`), keeping Milestone 9 focused purely on the AI step.
4. **One task branches by source type**, not two, since queueing, status updates and job
   tracking (`ProcessingJob`) are identical either way — only what actually produces the text
   differs.
5. **`ProcessingJob` is written for real**, not just designed and left empty: a row is created
   when queueing, moved to `RUNNING` when the job starts, and `SUCCEEDED`/`FAILED` when it ends,
   with Trigger.dev's own run id saved (`triggerRunId`) so a run can be found in their dashboard.
6. **Meeting status** now moves automatically: `UPLOADED` → `QUEUED` → `TRANSCRIBING` →
   `ANALYSING` (success) or `FAILED` (with `errorMessage` set). `ANALYSING` is intentionally the
   resting state until Milestone 9 exists — it is accurate ("this is what happens next"), not a
   placeholder.
7. **No schema changes.** `Transcript`, `TranscriptSegment` and `ProcessingJob`, designed in
   Milestone 2, already fit exactly.
8. **Local development needs a second process.** Trigger.dev's CLI (`pnpm trigger:dev`) runs
   alongside `pnpm dev` and actually executes the background jobs on your machine while
   developing; without it, uploads will sit at "Queued" forever locally. In production
   (Milestone 15) Trigger.dev runs the jobs on its own infrastructure instead.

## Consequences

- `next build` and CI need `TRIGGER_SECRET_KEY` and `OPENAI_API_KEY` set (placeholder values are
  fine for a build that never calls either service).
- `trigger.config.ts`'s `project` value is not a secret and must be replaced with the real
  project ref from the Trigger.dev dashboard; it does not come from an environment variable, to
  match Trigger.dev's own convention.
- Real OpenAI API usage costs money per minute of audio transcribed once a real key is used.

**Superseded 2026-09-25**: the provider was swapped from OpenAI to Groq (still Whisper, a
different host) — see `docs/adr/0007-groq-transcription-swap.md`. `OPENAI_API_KEY` above is now
`GROQ_API_KEY`; the "costs money" line above no longer applies (Groq's free tier requires no
payment). Everything else in this ADR (chunking, one task branching by source type, `ProcessingJob`
tracking, Meeting status flow) is unchanged.
