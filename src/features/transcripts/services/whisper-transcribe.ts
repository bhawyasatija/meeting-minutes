// File: src/features/transcripts/services/whisper-transcribe.ts
// Purpose: turns a recording into text with Whisper, hosted by Groq (not OpenAI directly — see
// docs/adr/0007-groq-transcription-swap.md for why). Groq's API is OpenAI-compatible, so this
// still uses the `openai` SDK, just pointed at Groq's base URL. Whisper accepts at most 25MB per
// request, but our upload limit is 100MB, so a large file is split into chunks with ffmpeg first,
// each chunk is transcribed separately, and the results are stitched back into one transcript
// with correct timestamps.
import "server-only";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";
import fluentFfmpeg from "fluent-ffmpeg";
import { parseBuffer } from "music-metadata";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { env } from "@/lib/env";
import type { TranscriptResult, TranscriptSegmentInput } from "./save-transcript";

if (!ffmpegPath) throw new Error("ffmpeg binary is not available on this platform.");
fluentFfmpeg.setFfmpegPath(ffmpegPath);

// Groq's Whisper endpoint is OpenAI-compatible, so the `openai` SDK works unchanged — only the
// base URL and key are different. See docs/adr/0007-groq-transcription-swap.md.
const openai = new OpenAI({ apiKey: env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

// Temporary diagnostics from the Whisper ECONNRESET investigation (2026-09-25, since carried
// forward through the Groq swap). Never logs the key itself or any header value — only whether
// it's present and how long it is, which is enough to tell a missing/misloaded key apart from a
// network-level failure. Safe to remove once a real transcription has been confirmed working.
console.warn(
  "[whisper] GROQ_API_KEY present:",
  Boolean(env.GROQ_API_KEY),
  "length:",
  env.GROQ_API_KEY.length,
);

// Stay comfortably under Whisper's 25MB-per-request limit.
const MAX_CHUNK_BYTES = 20 * 1024 * 1024;
const MIN_CHUNK_SECONDS = 60;

interface WhisperVerboseResponse {
  text: string;
  segments?: { start: number; end: number; text: string }[];
}

// A pure-JS metadata reader (no ffprobe binary needed) is enough to get the recording's length,
// which is all we need to decide whether and how to split it before sending it to Whisper.
async function probeDurationSeconds(bytes: Buffer): Promise<number> {
  const metadata = await parseBuffer(bytes);
  return metadata.format.duration ?? 0;
}

function extractChunk(
  inputPath: string,
  outputPath: string,
  startSeconds: number,
  durationSeconds: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fluentFfmpeg(inputPath)
      .setStartTime(startSeconds)
      .duration(durationSeconds)
      .outputOptions("-c copy")
      .save(outputPath)
      .on("end", () => resolve())
      .on("error", reject);
  });
}

interface Chunk {
  start: number;
  length: number;
}

function planChunks(durationSeconds: number, fileBytes: number): Chunk[] {
  if (fileBytes <= MAX_CHUNK_BYTES || durationSeconds <= 0) {
    return [{ start: 0, length: durationSeconds }];
  }
  const bytesPerSecond = fileBytes / durationSeconds;
  const chunkSeconds = Math.max(MIN_CHUNK_SECONDS, Math.floor(MAX_CHUNK_BYTES / bytesPerSecond));
  const chunks: Chunk[] = [];
  for (let start = 0; start < durationSeconds; start += chunkSeconds) {
    chunks.push({ start, length: Math.min(chunkSeconds, durationSeconds - start) });
  }
  return chunks;
}

async function transcribeChunk(buffer: Buffer): Promise<WhisperVerboseResponse> {
  const start = Date.now();
  console.warn("[whisper] sending chunk to Groq, bytes:", buffer.byteLength);
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(buffer, "audio.mp3"),
      // Groq's higher-accuracy Whisper model (10.3% WER vs. whisper-large-v3-turbo's 12%) — worth
      // it for meeting minutes, where correctness matters more than shaving off transcription
      // time. Swap to "whisper-large-v3-turbo" if free-tier rate limits (2,000 requests/day,
      // ~2 hours of audio per hour of clock time as of this writing) become the binding constraint.
      model: "whisper-large-v3",
      response_format: "verbose_json",
    });
    console.warn("[whisper] chunk transcribed ok in", Date.now() - start, "ms");
    return transcription as unknown as WhisperVerboseResponse;
  } catch (error) {
    // Log only fields that can never contain a secret: error name/code/message. Never log the
    // error's `headers`/`request` properties, which can carry the Authorization header.
    const e = error as { name?: string; code?: string; message?: string; status?: number };
    console.error(
      "[whisper] chunk request failed after",
      Date.now() - start,
      "ms — name:",
      e.name,
      "code:",
      e.code,
      "status:",
      e.status,
      "message:",
      e.message,
    );
    throw error;
  }
}

export async function transcribeAudioFile(url: string): Promise<TranscriptResult> {
  const downloadStart = Date.now();
  const response = await fetch(url);
  console.warn(
    "[whisper] downloaded source file, status:",
    response.status,
    "in",
    Date.now() - downloadStart,
    "ms",
  );
  if (!response.ok) {
    throw new Error(`Could not download the recording (status ${response.status}).`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  console.warn("[whisper] source file bytes:", bytes.byteLength);

  const dir = await mkdtemp(join(tmpdir(), "minutes-"));
  const inputPath = join(dir, "input");
  await writeFile(inputPath, bytes);

  try {
    const durationSeconds = await probeDurationSeconds(bytes);
    const chunks = planChunks(durationSeconds, bytes.byteLength);
    const wholeFileFits = chunks.length === 1 && bytes.byteLength <= MAX_CHUNK_BYTES;

    const textParts: string[] = [];
    const segments: TranscriptSegmentInput[] = [];

    for (const chunk of chunks) {
      let chunkBuffer: Buffer;
      if (wholeFileFits) {
        chunkBuffer = bytes;
      } else {
        const chunkPath = join(dir, `chunk-${chunk.start}.mp3`);
        await extractChunk(inputPath, chunkPath, chunk.start, chunk.length);
        chunkBuffer = await readFile(chunkPath);
      }

      const result = await transcribeChunk(chunkBuffer);
      textParts.push(result.text.trim());
      for (const segment of result.segments ?? []) {
        segments.push({
          startMs: Math.round((segment.start + chunk.start) * 1000),
          endMs: Math.round((segment.end + chunk.start) * 1000),
          text: segment.text.trim(),
        });
      }
    }

    return { text: textParts.join(" ").trim(), source: "SPEECH", segments };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
