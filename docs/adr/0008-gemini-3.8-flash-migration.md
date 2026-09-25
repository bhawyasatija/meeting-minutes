# ADR 0008: Migrate AI analysis from gemini-2.5-flash to gemini-3.8-flash (Milestone 9)

File: docs/adr/0008-gemini-3.8-flash-migration.md. Purpose: records why the Gemini model changed
after ADR 0006 originally chose `gemini-2.5-flash`.

## Context

On 2026-09-25, the first real end-to-end AI analysis attempt failed with a 404 from Gemini:
`"This model models/gemini-2.5-flash is no longer available to new users. Please update your code
to use models/gemini-3.8-flash..."`. Google retired 2.5 Flash for accounts that never used it
before; `gemini-3.8-flash` (GA as of 2026-09-02) is the current replacement.

## Decision

Changed `aiConfig.model` in `src/config/ai.ts` from `"gemini-2.5-flash"` to `"gemini-3.8-flash"` —
the only change made. Before touching anything, checked whether 3.8 Flash needed more than that:

- Google's own migration notes for 3.8 Flash list dropping `temperature`/`top_p`/`top_k`/
  `candidate_count` and replacing `thinking_budget` with `thinking_level` — but
  `gemini-provider.ts`'s `generateContent` call only ever passed `responseMimeType` and
  `responseSchema`, never any of those, so none applied here.
- 3.8 Flash's docs lead with a new "Interactions API," which could have looked like a forced
  migration off `generateContent`. Checked Google's changelog directly: `generateContent` remains
  fully supported for 3.8 Flash; the Interactions API is a separate, optional multi-agent/video
  feature, not a replacement. Kept `client.models.generateContent(...)` unchanged.
- Structured JSON output (`responseSchema`/`responseMimeType`) is unaffected between 2.5 and 3.8 —
  confirmed no changes documented to that capability.
- `@google/genai` was already on `2.24.0`, the current latest — no SDK bump needed to pass a new
  model string.

## Consequences

- Only file changed: `src/config/ai.ts` (one line, plus a comment). `gemini-provider.ts` and
  `analyze-meeting.ts` are untouched — same request shape, same structured-output schema (summary,
  agenda, decisions, risks, open questions, next steps, action items with owner/deadline), same
  "Not stated" sentinel handling.
- No Prisma/schema/migration, UploadThing, Trigger.dev, or Groq transcription changes.
- If Google retires 3.8 Flash the same way later, the fix is the same one-line change in
  `src/config/ai.ts` — that's the whole point of keeping the model name centralized there instead
  of inline in `gemini-provider.ts` (see that file's own top-of-file comment).

**Superseded 2026-09-25:** `gemini-3.8-flash` itself turned out to fail differently — 503
`UNAVAILABLE` under load, not a 404 — so AI analysis was moved off Gemini entirely to Groq-hosted
GPT-OSS-120B. See docs/adr/0009-groq-ai-analysis-swap.md.
