# ADR 0009: swap AI analysis from Gemini to Groq (GPT-OSS-120B)

File: docs/adr/0009-groq-ai-analysis-swap.md. Purpose: records why AI analysis moved off Gemini
entirely, after ADR 0008 had already migrated it once (2.5 Flash → 3.8 Flash) for a different
reason.

## Context

With `gemini-3.8-flash` in place (ADR 0008), analysis started failing with HTTP 503
`UNAVAILABLE — the model is overloaded. Please try again later.` This is a different failure
than the earlier 404 (a retired model) — the model exists and the request is valid, but Google's
servers are refusing it under load. A review of Google's own developer forums showed this pattern
recurring across its newest flash-tier models, including reports on paid tiers for 3.7 Flash —
not a one-off glitch specific to 3.8. Switching to yet another Gemini model was judged unlikely to
fix the underlying problem.

The user has also stated, as a standing constraint, that they will not pay for AI API credits.

## Decision

Move AI analysis off Gemini entirely, to **Groq, hosted GPT-OSS-120B** (`openai/gpt-oss-120b`).

1. **Same account, same pattern as Whisper.** Groq already hosts this app's speech-to-text
   (ADR 0007) on a free tier with no card required. Its chat-completions endpoint is also
   OpenAI-compatible, so `groq-provider.ts` reuses the exact same `openai` SDK and `GROQ_API_KEY`
   already in `whisper-transcribe.ts` — only the base model changes, not the HTTP client or the
   env var. No new dependency, no new secret.
2. **Structured Outputs in strict mode**, GPT-OSS-120B's own equivalent of Gemini's
   `responseSchema`: `response_format: { type: "json_schema", json_schema: { strict: true,
schema } }`. Same guarantee as before — a malformed response is a parse/validation error we
   catch, never silently-wrong output. The schema is standard JSON Schema (`type: "object"`,
   `required`, `additionalProperties: false`), not Gemini's `Type`-enum `Schema` format, but
   describes exactly the same fields.
3. **Behind the same `AnalysisProvider` interface**, unchanged. `groq-provider.ts` is a new file
   implementing it; `gemini-provider.ts` is left in place but unused (nothing imports it anymore)
   rather than deleted, the same way the old `OPENAI_API_KEY` line was left dangling and unused in
   `.env.local` after the Whisper swap. `analyze-meeting.ts` only changed its one import line and
   the one call site — the orchestrator, the transaction logic, and the database writes are
   untouched.
4. **Prompt and "Not stated" behavior preserved exactly**, copied verbatim from
   `gemini-provider.ts`'s `buildPrompt`. `promptVersion` was bumped to `"2026-09-v2"` (only the
   underlying model changed, not the prompt's wording, but the version exists precisely so a
   provider swap like this one is traceable on old `Report` rows).
5. **`GOOGLE_GENERATIVE_AI_API_KEY` left in `src/lib/env.ts`'s required schema**, not removed.
   Same reasoning as point 3 — removing it is a real change with its own risk (it would block
   startup for anyone whose `.env.local` doesn't still have a placeholder value), and it isn't
   needed to make this swap work. It can be cleaned up later in a dedicated pass.

## Consequences

- No new environment variable, no new dependency, no `pnpm install` needed — `GROQ_API_KEY` and
  the `openai` package are already in place from ADR 0007.
- `gemini-provider.ts` and the `@google/genai` dependency are now dead code / an unused
  dependency. Left in place rather than deleted, so nothing about the build breaks and the
  history of what analysis used to look like stays available on disk.
- **Known risk:** Groq's free tier caps `openai/gpt-oss-120b` at roughly 8,000 tokens/minute per
  account. A very long meeting's transcript (this app currently allows up to ~90 minutes of
  audio) could in principle approach that limit in one request. If this becomes a real problem in
  practice, the agreed mitigation is a frontend change to reduce the advertised/allowed upload
  duration — not a code change to this file — and is deliberately not built as part of this ADR.
- No schema/migration, UploadThing, Trigger.dev, or Whisper-transcription changes were made.
