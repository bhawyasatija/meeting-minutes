// File: src/features/ai/services/types.ts
// Purpose: the shape every AI provider must return, independent of which model produced it.
// analyze-meeting.ts (the orchestrator) only ever talks to this shape, never to a specific
// provider's own response format — that is what "behind a provider interface" means here.

export interface AnalysisActionItem {
  task: string;
  /** The literal string in aiConfig.notStated when the transcript never names an owner. */
  ownerName: string;
  /** Free-text phrasing, e.g. "next Friday" or "end of sprint". Always present, even alongside deadlineIso. */
  deadlineNote: string;
  /** An exact date the transcript gave or that is unambiguous given the meeting date, else null. */
  deadlineIso: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface AnalysisParticipant {
  name: string;
  /** The literal string in aiConfig.notStated when the transcript never says this person's role. */
  role: string;
}

export interface AnalysisResult {
  title: string;
  executiveSummary: string;
  /** The literal string in aiConfig.notStated when the meeting has no clear closing/outcome. */
  conclusion: string;
  participants: AnalysisParticipant[];
  agenda: string[];
  discussion: string[];
  decisions: string[];
  risks: string[];
  openQuestions: string[];
  nextSteps: string[];
  actionItems: AnalysisActionItem[];
  /** Token counts as reported by the provider, for UsageRecord. */
  usage: { tokensIn: number; tokensOut: number };
}

/** Implemented once per AI provider (Gemini today; another model later would add its own file). */
export interface AnalysisProvider {
  analyzeTranscript(transcriptText: string, meetingDate: Date): Promise<AnalysisResult>;
}
