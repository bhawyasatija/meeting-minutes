// File: src/features/transcripts/services/extract-document-text.ts
// Purpose: turns an uploaded TXT, PDF or DOCX file into plain text. No AI here — just reading
// the file — so a document-sourced meeting has a Transcript row ready for Milestone 9, the same
// way speech recognition produces one for a recording.
import "server-only";
import mammoth from "mammoth";
// pdf-parse ships as a CommonJS module with no default-export types for this import path.
// Import the lib file directly, NOT the package root ("pdf-parse"): that root index.js has a
// leftover debug block gated on `!module.parent`, which is unset when this module is loaded by
// a bundler (Next.js's server bundle, Trigger.dev's esbuild worker) rather than a plain `require`.
// That makes the package eagerly read its own test fixture at import time and throw ENOENT.
// lib/pdf-parse.js is the actual implementation, with no such side effect.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  data: Buffer,
) => Promise<{ text: string }>;
import type { SourceType } from "@prisma/client";
import type { TranscriptResult } from "./save-transcript";

export async function extractDocumentText(
  url: string,
  sourceType: SourceType,
): Promise<TranscriptResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download the file (status ${response.status}).`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  let text: string;
  if (sourceType === "PDF") {
    text = (await pdfParse(buffer)).text;
  } else if (sourceType === "DOCX") {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    text = buffer.toString("utf-8");
  }

  return { text: text.trim(), source: "UPLOADED", segments: [] };
}
