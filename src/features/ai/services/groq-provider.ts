// File: src/features/ai/services/groq-provider.ts
// Purpose: the Groq implementation of AnalysisProvider (replaces gemini-provider.ts — see
// docs/adr/0009-groq-ai-analysis-swap.md). Groq's chat-completions endpoint is OpenAI-compatible,
// so this reuses the same `openai` SDK and GROQ_API_KEY already used for Whisper transcription
// (docs/adr/0007-groq-transcription-swap.md), just pointed at a text model instead of an audio
// one. Structured Outputs (`response_format: json_schema`, strict mode) plays the same role here
// that Gemini's `responseSchema` did: a malformed response is a JSON parse/validation error we
// catch, not a silent misread of free text. The "Not stated" instruction below is unchanged from
// the Gemini prompt — it's what makes the product's "never guess a missing fact" rule happen.
import "server-only";
import OpenAI from "openai";
import { aiConfig } from "@/config/ai";
import { env } from "@/lib/env";
import type { AnalysisProvider, AnalysisResult } from "./types";

const client = new OpenAI({ apiKey: env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

// Groq's strict JSON Schema mode requires every property to be listed in `required` (nullable
// fields use a `["string", "null"]` type union instead of being optional) and every object to
// set `additionalProperties: false`. This is standard JSON Schema, unlike Gemini's Type-enum
// based `Schema` format, but describes exactly the same shape.
const actionItemSchema = {
  type: "object",
  properties: {
    task: { type: "string", description: "The task, in the group's own words." },
    ownerName: {
      type: "string",
      description: `The person responsible, exactly as named in the transcript, or the literal string "${aiConfig.notStated}" if no owner was said.`,
    },
    deadlineNote: {
      type: "string",
      description: `The deadline in the transcript's own words (e.g. "next Friday"), or "${aiConfig.notStated}" if none was given.`,
    },
    deadlineIso: {
      type: ["string", "null"],
      description:
        "An exact date (YYYY-MM-DD) ONLY if the transcript states one, or it is unambiguous relative to the meeting date given below. Otherwise null — never guess.",
    },
    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
  },
  required: ["task", "ownerName", "deadlineNote", "deadlineIso", "priority"],
  additionalProperties: false,
};

const participantSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    role: {
      type: "string",
      description: `Their role/title if the transcript says it, else "${aiConfig.notStated}".`,
    },
  },
  required: ["name", "role"],
  additionalProperties: false,
};

const responseSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "A short, specific meeting title." },
    executiveSummary: {
      type: "string",
      description: "2-4 sentences, for someone who was not there.",
    },
    conclusion: {
      type: "string",
      description: `How the meeting wrapped up, or "${aiConfig.notStated}" if it just ended without one.`,
    },
    participants: { type: "array", items: participantSchema },
    agenda: { type: "array", items: { type: "string" } },
    discussion: { type: "array", items: { type: "string" } },
    decisions: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    openQuestions: { type: "array", items: { type: "string" } },
    nextSteps: { type: "array", items: { type: "string" } },
    actionItems: { type: "array", items: actionItemSchema },
  },
  required: [
    "title",
    "executiveSummary",
    "conclusion",
    "participants",
    "agenda",
    "discussion",
    "decisions",
    "risks",
    "openQuestions",
    "nextSteps",
    "actionItems",
  ],
  additionalProperties: false,
};

function buildPrompt(transcriptText: string, meetingDate: Date): string {
  return `You are producing structured meeting minutes from a raw transcript. The meeting took
place on ${meetingDate.toISOString().slice(0, 10)}.

Rules:
- Use only what the transcript actually says. Never invent a name, date, decision or fact.
- Whenever a field asks for something the transcript does not state, write the exact string
  "${aiConfig.notStated}" for that field. Do not leave it blank and do not guess.
- Leave a list empty (an empty array) if the transcript has nothing for that section — do not
  pad it with invented items.
- Empty sections are a normal, correct result for a short or informal meeting.

Transcript:
"""
${transcriptText}
"""`;
}

export const groqProvider: AnalysisProvider = {
  async analyzeTranscript(transcriptText, meetingDate): Promise<AnalysisResult> {
    const completion = await client.chat.completions.create({
      model: aiConfig.model,
      messages: [{ role: "user", content: buildPrompt(transcriptText, meetingDate) }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "meeting_minutes",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Groq returned no content in its response.");
    }

    // The fields above are exactly AnalysisResult minus `usage`, which comes from the response's
    // own metadata rather than from the model's JSON (the model doesn't know its own token count).
    const parsed = JSON.parse(text) as Omit<AnalysisResult, "usage">;

    return {
      ...parsed,
      usage: {
        tokensIn: completion.usage?.prompt_tokens ?? 0,
        tokensOut: completion.usage?.completion_tokens ?? 0,
      },
    };
  },
};
