# Minutes: AI meeting minutes and action items

Transform meetings into structured knowledge automatically. Upload a recording or notes and get a
summary, decisions, and action items with owners and deadlines, ready to share as a PDF.

**Status:** Milestone 8 of 15 (speech recognition). No AI analysis yet; that arrives in Milestone 9.

## Run it on your computer (first time)

You need [Node.js](https://nodejs.org) version 20 or newer (choose the "LTS" download).

1. Open a terminal in this folder.
2. Check Node: `node -v` (should show v20 or higher).
3. Install pnpm (the package manager): `npm install -g pnpm`
4. Install the project's packages: `pnpm install` (takes a minute or two)
5. Format the files once so they match the project style: `pnpm format`
6. Create your settings file: `cp .env.example .env.local`, then paste your two Clerk keys, your two
   database links, and your UploadThing token into it (see the setup sections below)
7. Create the database tables (first time only): `pnpm db:migrate`
8. Start the app: `pnpm dev`
9. Open <http://localhost:3000>. You should see the landing page with "Log in" and "Get started".

After step 4, a file called `pnpm-lock.yaml` appears. Keep it and commit it: it makes everyone's
installs identical.

## Set up login (Clerk), one time

1. Create a free account at <https://clerk.com> and click **Create application**. Name it "Minutes".
2. Under sign-in options, turn on **Email** and **Google**. Create the application.
3. Open the **API keys** page. Copy the **Publishable key** (starts with `pk_`) and the **Secret key**
   (starts with `sk_`).
4. Paste them into `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
5. Restart `pnpm dev` (press Ctrl+C, then run it again). Click "Get started", create an account, and
   you should land on the dashboard page showing your email.

Never share or commit the secret key. If the app refuses to start and mentions "Invalid environment
variables", one of the two keys is missing or has a typo.

## Set up the database (Neon), one time

1. Create a free account at <https://neon.tech> and create a project named "minutes". Pick the
   region closest to you. Keep the default database name.
2. Click **Connect**. Copy the link with **Connection pooling ON** (host contains `-pooler`) and
   paste it into `.env.local` as `DATABASE_URL`. At the very end of that link add `&pgbouncer=true`.
3. Untick **Connection pooling**, copy the new link, and paste it as `DIRECT_URL`.
4. Run `pnpm db:migrate`. When it asks for a migration name, type `init`. This creates all the tables.
5. Run `pnpm dev`, log in, and open the dashboard. It should now say your account is saved in the
   database. To look inside the tables, run `pnpm db:studio` (opens in your browser).

Keep the password in these links secret, like the Clerk secret key.

## Set up file uploads (UploadThing), one time

1. Create a free account at <https://uploadthing.com> and create an app named "minutes".
2. Open **API Keys** and copy the value called **UPLOADTHING_TOKEN** (a long string of letters and numbers).
3. Paste it into `.env.local` as `UPLOADTHING_TOKEN`.
4. Restart `pnpm dev`. Go to the Upload page, choose a small file, and it should upload and take you
   to the dashboard.

## Set up background jobs (Trigger.dev) and speech-to-text (Whisper via Groq), one time

1. Create a free account at <https://trigger.dev> and create a project named "minutes".
2. Open **Project settings > API keys** and copy the **dev secret key** (starts with `tr_dev_`).
   Paste it into `.env.local` as `TRIGGER_SECRET_KEY`.
3. Still on that settings page, copy the **project ref** (starts with `proj_`). Open
   `trigger.config.ts` in the project and paste it in place of `"proj_replace_me"`. This one is
   not a secret, so it does not go in `.env.local`.
4. Create a free account at <https://console.groq.com> (no credit card needed), open **API Keys**,
   and create a key. Paste it into `.env.local` as `GROQ_API_KEY`. Speech-to-text runs on Groq's
   free tier (their hosted Whisper, not OpenAI's) — see `docs/adr/0007-groq-transcription-swap.md`
   for why.
5. Run `pnpm dev` in one terminal and `pnpm trigger:dev` in a second terminal (same folder). The
   first time, `trigger:dev` will open a browser tab asking you to log in — do that once.
6. On the Upload page, upload a short recording. Its status moves from Uploaded to Queued to
   Transcribing to Analysing automatically. Run `pnpm db:studio` to see the transcript that
   appears in the `Transcript` and `TranscriptSegment` tables.

If a recording gets stuck on "Queued", `pnpm trigger:dev` probably isn't running.

## Everyday commands

| Command            | What it does                                      |
| ------------------ | ------------------------------------------------- |
| `pnpm dev`         | Runs the app locally with live reload             |
| `pnpm build`       | Builds the production version                     |
| `pnpm lint`        | Checks code for common mistakes                   |
| `pnpm typecheck`   | Checks TypeScript types                           |
| `pnpm format`      | Formats all files consistently                    |
| `pnpm check`       | Runs lint, typecheck and format check together    |
| `pnpm db:migrate`  | Applies table changes from `prisma/schema.prisma` |
| `pnpm db:studio`   | Opens a browser view of the database tables       |
| `pnpm trigger:dev` | Runs background jobs (transcription) locally      |

## Where things live

```text
src/app/          Pages and URLs only (thin files)
src/features/     One folder per feature (auth, upload, meetings, ...)
src/components/   ui/ (shadcn), layout/, shared/ (reusable pieces)
src/lib/          Tools with no feature knowledge (env, utils)
src/config/       Site name and product limits
src/prompts/      Versioned AI prompts (Milestone 9)
prisma/           Database schema (Milestone 6)
trigger/          Background jobs (Milestone 8)
docs/adr/         Short records of big decisions
```

Rules: imports flow downward (app uses features, features use lib and components); a feature
exposes only what is in its `index.ts`; only services talk to the database.

## If something goes wrong

- `command not found: pnpm` or `node`: repeat steps 2 and 3.
- Install or start errors: copy the full message and send it to whoever is helping you.
- Port 3000 busy: run `pnpm dev -p 3001`.
