import { z } from "zod";

// Every setting the app needs is declared here. If one is missing or wrong the app stops
// at startup with a clear message, instead of failing mysteriously later.
// This file runs on the server only (it is imported by the root layout). Never import it
// from a Client Component: the secret keys are not available in the browser.
// Milestone 9 added the AI analysis key (GOOGLE_GENERATIVE_AI_API_KEY) to this schema.
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .startsWith("pk_", "Clerk publishable key must start with pk_"),
  CLERK_SECRET_KEY: z.string().startsWith("sk_", "Clerk secret key must start with sk_"),
  DATABASE_URL: z.string().startsWith("postgres", "DATABASE_URL must be a postgres:// link"),
  DIRECT_URL: z.string().startsWith("postgres", "DIRECT_URL must be a postgres:// link"),
  // Only needed once Clerk webhooks are switched on (before deploying). The webhook route checks it.
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().startsWith("whsec_").optional(),
  UPLOADTHING_TOKEN: z.string().min(1, "UPLOADTHING_TOKEN is required (see .env.example)."),
  TRIGGER_SECRET_KEY: z.string().startsWith("tr_", "TRIGGER_SECRET_KEY must start with tr_"),
  // Speech-to-text: Groq's free tier (no credit card, no paid credits) hosting Whisper, swapped
  // in from OpenAI's Whisper API on 2026-09-25 — see docs/adr/0007-groq-transcription-swap.md.
  GROQ_API_KEY: z.string().startsWith("gsk_", "GROQ_API_KEY must start with gsk_"),
  GOOGLE_GENERATIVE_AI_API_KEY: z
    .string()
    .min(1, "GOOGLE_GENERATIVE_AI_API_KEY is required (see .env.example)."),
});

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET || undefined,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. See the message above and .env.example.");
}

export const env = parsed.data;
