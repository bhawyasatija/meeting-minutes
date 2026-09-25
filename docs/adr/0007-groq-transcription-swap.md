# ADR 0007: Swap speech-to-text from OpenAI Whisper to Groq (Milestone 8)

File: docs/adr/0007-groq-transcription-swap.md. Purpose: records why the transcription provider
changed after ADR 0005 originally chose OpenAI's Whisper API.

## Context

On 2026-09-25, while verifying Milestone 8 end-to-end, a real transcription attempt hit
`ECONNRESET` talking to OpenAI. That connection bug was fixed on its own (see Milestone 8 fix #5
in `claude/project-status.md` — the `openai` package needed upgrading from 4.70.0 to 7.23.0), but
fixing it surfaced OpenAI's real response underneath: `429 — you have no credits remaining`.
OpenAI's Whisper API requires prepaid billing credit; the user does not want to pay for that.

## Decision

Switched the transcription provider from OpenAI's Whisper API to **Groq**, which hosts the same
Whisper model family and offers it on a free tier with no credit card and no paid credits required
(rate-limited instead: ~2,000 requests/day, ~2 hours of audio per hour of clock time, as of
2026-09-25 — see https://console.groq.com/docs/speech-to-text).

Groq's API is OpenAI-compatible (same request/response shape, `https://api.groq.com/openai/v1`
base URL), so the existing `openai` npm SDK, `toFile()` helper, and
`audio.transcriptions.create()` call shape in `whisper-transcribe.ts` needed no rewrite — only the
client's `baseURL`/`apiKey` and the `model` string changed (`whisper-1` → `whisper-large-v3`).

Model choice: `whisper-large-v3` (10.3% word error rate) over `whisper-large-v3-turbo` (12% WER,
faster) — meeting-minutes accuracy matters more than shaving transcription time, and the free
tier's rate limits are generous enough for this project's usage (5 meetings/day/user cap, see
`src/config/limits.ts`). Easy to switch later if the turbo model's speed or its share of the daily
request quota becomes the binding constraint — it's a one-line change.

## Consequences

- New env var `GROQ_API_KEY` (starts with `gsk_`) replaces `OPENAI_API_KEY` everywhere:
  `src/lib/env.ts`'s schema, `.env.example`, `README.md`'s setup steps, and (once pushed to
  GitHub) CI secrets. `OPENAI_API_KEY` is no longer read anywhere in the codebase.
- No other code depended on the `openai` package beyond `whisper-transcribe.ts`, so this swap
  doesn't touch AI analysis (Gemini, `@google/genai`, unrelated) or anything else.
- No schema, migration, database, UploadThing, or Trigger.dev changes.
- Groq's free tier is rate-limited rather than metered by spend — if usage ever needs to scale
  well past personal/demo use, that limit (not a bill) is the thing to revisit.
