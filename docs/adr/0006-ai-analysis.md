# ADR 0006: AI analysis (Milestone 9)

File: docs/adr/0006-ai-analysis.md. Purpose: records why this milestone is built the way it is.

## Decisions

1. **Google Gemini (`gemini-2.5-flash`)**, as planned, called from the same Trigger.dev
   background job as transcription (`process-meeting-intake.ts`), right after the transcript is
   saved. One task keeps the two stages sequential without an extra queue hop.
2. **Behind a provider interface.** `src/features/ai/services/types.ts` defines
   `AnalysisProvider` and the `AnalysisResult` shape every provider must return.
   `gemini-provider.ts` is the only file that knows about `@google/genai`; `analyze-meeting.ts`
   (the orchestrator) never touches Gemini's own response format. Swapping models later means
   adding one new provider file, not touching the orchestrator or the database code.
3. **Structured JSON output, not parsed prose.** The Gemini call passes a full JSON schema
   (`responseSchema`) matching our own fields, so a malformed response is a JSON parse error we
   catch, not a silent misread of free text.
4. **The "Not stated" rule.** The prompt explicitly instructs Gemini to write the literal string
   `"Not stated"` (defined once, in `src/config/ai.ts`) for any field the transcript does not
   support, instead of guessing. `analyze-meeting.ts` converts that sentinel back to a real
   `null` for the database columns that already mean "not stated" that way (`Report.conclusion`,
   `ActionItem.ownerName`, `ActionItem.deadlineNote`, `Participant.role`) — matching the
   convention those columns' comments in `schema.prisma` already documented.
5. **Deadlines: note plus optional exact date.** `ActionItem` has both `deadline` (a real date)
   and `deadlineNote` (free text) for exactly this reason. The prompt is given the meeting's own
   date and told to fill `deadlineIso` only when the transcript states an exact date or one that
   is unambiguous relative to the meeting date — otherwise leave it `null` and rely on
   `deadlineNote` alone. No separate date-parsing library; the model does this using the meeting
   date as context, and we never invent a date it didn't give us.
6. **A second `ProcessingJob` row**, type `ANALYSE`, created once transcription's `TRANSCRIBE`
   job succeeds. Kept as two rows (not one job spanning both stages) so job history shows which
   stage actually failed. A failure in analysis never overwrites the transcription job's own
   (already correct) `SUCCEEDED` status — the two stages have separate try/catch blocks in
   `process-meeting-intake.ts` for exactly this reason.
7. **Meeting status** now completes the flow designed in Milestone 2:
   `ANALYSING` → `COMPLETED` (success) or `FAILED` (with `errorMessage` set, same pattern as
   transcription failures).
8. **Usage tracking starts here.** `UsageRecord` (designed in Milestone 2, unused until now) is
   upserted per user per day with `tokensIn`/`tokensOut` from Gemini's own response metadata.
   `costMicros` is left at 0 for now — real per-token pricing isn't wired up yet; that's a
   deliberate gap, not an oversight, since pricing changes independently of this milestone's
   actual scope.
9. **No schema changes.** `Report`, `ReportItem`, `ActionItem`, `Participant`, `ProcessingJob`
   and `UsageRecord` already fit exactly as designed in Milestone 2.

## Consequences

- `next build` and CI now also need `GOOGLE_GENERATIVE_AI_API_KEY` set (a placeholder value is
  fine for a build that never calls Gemini).
- Real Gemini API usage costs money per request once a real key is used (Gemini has a free
  tier, but it has limits).
- If Gemini's response doesn't match the schema (rare, since `responseSchema` constrains it),
  `JSON.parse` or a missing required field throws, the meeting is marked `FAILED` with the
  error message, and the `ANALYSE` job is recorded as failed — same failure shape as every
  other stage, nothing new to learn.

**Superseded 2026-09-25:** AI analysis was migrated off Gemini entirely, first to
`gemini-3.8-flash` (see ADR 0008) and then to Groq-hosted GPT-OSS-120B (see
ADR 0009-groq-ai-analysis-swap.md) after recurring 503 errors. Decisions 2–7 and 9 above (the
provider-interface pattern, structured JSON output, the "Not stated" rule, deadline handling, the
`ANALYSE` job, meeting status, and no schema changes) all still hold — only the concrete
provider (decision 1) and the model recorded in usage tracking (decision 8) changed.
