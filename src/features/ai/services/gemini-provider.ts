// File: src/features/ai/services/gemini-provider.ts
// Purpose: the Gemini implementation of AnalysisProvider. Asks Gemini to return structured JSON
// (not prose we'd have to parse) matching our own schema, so a malformed response is a validation
// error we can catch, not a silent misread. The "Not stated" instruction below is what makes the
// product's "never guess a missing fact" rule actually happen.
import "server-only";
import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { aiConfig } from "@/config/ai";
import { env } from "@/lib/env";
import type { AnalysisProvider, AnalysisResult } from "./types";

const client = new GoogleGenAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY });

const actionItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    task: { type: Type.STRING, description: "The task, in the group's own words." },
    ownerName: {
      type: Type.STRING,
      description: `The person responsible, exactly as named in the transcript, or the literal string "${aiConfig.notStated}" if no owner was said.`,
    },
    deadlineNote: {
      type: Type.STRING,
      description: `The deadline in the transcript's own words (e.g. "next Friday"), or "${aiConfig.notStated}" if none was given.`,
    },
    deadlineIso: {
      type: Type.STRING,
      nullable: true,
      description:
        "An exact date (YYYY-MM-DD) ONLY if the transcript states one, or it is unambiguous relative to the meeting date given below. Otherwise null — never guess.",
    },
    priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
  },
  required: ["task", "ownerName", "deadlineNote", "deadlineIso", "priority"],
};

const participantSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    role: {
      type: Type.STRING,
      description: `Their role/title if the transcript says it, else "${aiConfig.notStated}".`,
    },
  },
  required: ["name", "role"],
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A short, specific meeting title." },
    executiveSummary: {
      type: Type.STRING,
      description: "2-4 sentences, for someone who was not there.",
    },
    conclusion: {
      type: Type.STRING,
      description: `How the meeting wrapped up, or "${aiConfig.notStated}" if it just ended without one.`,
    },
    participants: { type: Type.ARRAY, items: participantSchema },
    agenda: { type: Type.ARRAY, items: { type: Type.STRING } },
    discussion: { type: Type.ARRAY, items: { type: Type.STRING } },
    decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
    openQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    actionItems: { type: Type.ARRAY, items: actionItemSchema },
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

export const geminiProvider: AnalysisProvider = {
  async analyzeTranscript(transcriptText, meetingDate): Promise<AnalysisResult> {
    const response = await client.models.generateContent({
      model: aiConfig.model,
      contents: buildPrompt(transcriptText, meetingDate),
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned no text in its response.");
    }

    // The fields above are exactly AnalysisResult minus `usage`, which comes from the response's
    // own metadata rather than from the model's JSON (the model doesn't know its own token count).
    const parsed = JSON.parse(text) as Omit<AnalysisResult, "usage">;

    return {
      ...parsed,
      usage: {
        tokensIn: response.usageMetadata?.promptTokenCount ?? 0,
        tokensOut: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  },
};
