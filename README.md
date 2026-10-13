# MOM — Meeting Intelligence Platform

A full-stack application that turns meeting recordings, pasted transcripts and documents into structured meeting minutes: an executive summary, agenda/discussion/decision/risk items, and action items with owners, deadlines and priority. Transcription and AI analysis run as asynchronous background jobs, and the dashboard updates live while a meeting is processing.

The product is named **Minutes** in the UI; this repository is `meeting-minutes`.

## Status

**Working end to end:** upload (audio, pasted text, `.txt`, `.pdf`, `.docx`) → transcription → AI analysis → report, with a dashboard, meeting history and settings pages.

**Not built yet:** public share links and PDF/branded export (the `ShareLink` model and the `src/features/sharing` and `src/features/pdf` folders are placeholders), and editing a generated report in place. There is no integration with other applications in this repository.

## How it works

```
Browser ──► Next.js 15 (App Router, server components/actions)
             │  Clerk auth · Prisma · UploadThing uploads
             ▼
        PostgreSQL (Neon) ◄──── Trigger.dev task: process-meeting-intake
                                   1. fetch file / transcript
                                   2. transcribe audio (Whisper on Groq, chunked via ffmpeg)
                                   3. analyse transcript (gpt-oss-120b on Groq, strict JSON schema)
                                   4. persist Report, ReportItems, ActionItems
```

- A meeting moves through `UPLOADED → QUEUED → TRANSCRIBING → ANALYSING → COMPLETED` (or `FAILED`); the UI polls and refreshes without a manual reload.
- Every row a user owns is reached through `User → Meeting`, and queries filter by `userId`.
- The AI response is requested as structured output (`json_schema`, strict mode) and validated before it is stored; a malformed response is a failed job rather than a half-written report.
- Environment variables are validated at startup (`src/lib/env.ts`).
- Architecture decisions are recorded in [`docs/adr/`](docs/adr), including why transcription and analysis moved to Groq-hosted models (ADR 0007, 0009).

## Tech stack

- **App:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Auth:** Clerk
- **Data:** PostgreSQL with Prisma (models include `Meeting`, `Transcript`, `Report`, `ReportItem`, `ActionItem`, `ProcessingJob`)
- **Background jobs:** Trigger.dev v4
- **AI:** Groq-hosted Whisper (speech-to-text) and `openai/gpt-oss-120b` (analysis), called through the OpenAI SDK
- **Files:** UploadThing; `ffmpeg-static`/`fluent-ffmpeg`, `pdf-parse` and `mammoth` for media and document handling
- **Tooling:** Vitest, ESLint, Prettier, pnpm, GitHub Actions

## Getting started

Requires Node.js 20+, pnpm, and free accounts for Clerk, Neon (PostgreSQL), UploadThing, Trigger.dev and Groq.

```bash
pnpm install
cp .env.example .env.local     # then fill in the values below
pnpm db:migrate                # create the tables
pnpm dev                       # http://localhost:3000
pnpm trigger:dev               # in a second terminal: runs the background jobs
```

`trigger.config.ts` contains a Trigger.dev project reference (not a secret). Replace it with your own project's ref from the Trigger.dev dashboard.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk keys |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk webhook verification |
| `DATABASE_URL` | Pooled Postgres connection (host contains `-pooler`; append `&pgbouncer=true`) |
| `DIRECT_URL` | Direct Postgres connection, used by Prisma migrations |
| `UPLOADTHING_TOKEN` | UploadThing app token |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key (`tr_dev_…` for local development) |
| `GROQ_API_KEY` | Groq key for transcription and analysis |

See [`.env.example`](.env.example) for the full list. Never commit `.env.local`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Run, build and serve the app |
| `pnpm lint` / `pnpm typecheck` / `pnpm format:check` | Static checks |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm check` | Lint, typecheck, format check and tests |
| `pnpm db:migrate` / `pnpm db:deploy` / `pnpm db:studio` | Prisma migrations and browser |
| `pnpm trigger:dev` | Run background jobs locally |

## Testing

`pnpm test` runs 7 unit tests across 2 files (report retrieval and upload limit checks). Coverage is small: there are no end-to-end tests and the Trigger.dev pipeline is not covered by automated tests. GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck, format check, tests and a build on pushes to `master` and on pull requests, using placeholder environment values.

## Project layout

```text
src/app/          Routes and pages (thin)
src/features/     One folder per feature (auth, upload, meetings, ai, history, ...)
src/components/   ui/, layout/, shared/
src/lib/          Env validation, utilities
trigger/          Background pipeline (transcription + AI analysis)
prisma/           Schema and migrations
docs/adr/         Architecture decision records
```

## License

No license has been chosen; all rights are reserved by default.
