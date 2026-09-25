// AI analysis settings (Milestone 9). Change the model or prompt version here, never inside
// features. Bumping promptVersion when the prompt changes lets old reports be traced to the
// exact wording that produced them (Report.promptVersion).
export const aiConfig = {
  // 2026-09-25: migrated from Gemini ("gemini-3.8-flash", before that "gemini-2.5-flash") to
  // Groq-hosted GPT-OSS-120B, after Gemini 3.8 Flash started returning 503 "high demand" errors
  // that Google's own forums show as a recurring pattern on its newest flash-tier models, not a
  // one-off glitch — see docs/adr/0009-groq-ai-analysis-swap.md.
  model: "openai/gpt-oss-120b",
  promptVersion: "2026-09-v2",
  // Sentinel string the model is instructed to write when the transcript does not say something,
  // instead of guessing. Code compares against this exact string to convert it to a real null
  // in fields the database allows that for (see analyze-meeting.ts).
  notStated: "Not stated",
} as const;
