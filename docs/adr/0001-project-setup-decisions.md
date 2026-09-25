# 0001: Project setup decisions

Date: 2026-09-21. Status: accepted.

## Context

Milestone 4 creates the project skeleton for a product that will be maintained by several
developers and deployed publicly. The stack is fixed by the brief (Next.js 15, TypeScript,
Tailwind, shadcn/ui, Prisma, PostgreSQL, Clerk, UploadThing, Whisper, Gemini, Vercel).

## Decisions

| Decision                                                                         | Why                                                                                  | Alternative rejected                                    |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Feature-based folders (`src/features/*`)                                         | Everything for one feature is in one place; fewer merge conflicts                    | Folders by file type: code for one feature is scattered |
| Strict TypeScript plus `noUncheckedIndexedAccess`, `no-explicit-any` as an error | Catches mistakes while coding, not in production                                     | Loose settings                                          |
| Tailwind v4 with design tokens as CSS variables                                  | One set of tokens gives light and dark mode; matches shadcn/ui                       | Hard-coded colors                                       |
| Fonts self-hosted through npm (Fontsource)                                       | No build-time network call, faster, no third-party request from users' browsers      | Google Fonts via `next/font/google`                     |
| Settings validated with Zod in `src/lib/env.ts`                                  | The app fails at startup with a clear message                                        | Reading `process.env` directly everywhere               |
| Security headers in `next.config.ts` from day one                                | Cheap protection; a full Content Security Policy is added with Clerk in Milestone 15 | Adding security last                                    |
| pnpm, with CI running lint, typecheck, format check and build                    | Strict, fast installs; every change is checked automatically                         | No CI                                                   |
| shadcn/ui components copied into `src/components/ui`                             | We own and can edit them                                                             | A packaged UI library                                   |

## Consequences

- New shadcn/ui components are added with `pnpm dlx shadcn@latest add <name>`.
- Decisions that change the architecture get a new numbered file in this folder.
