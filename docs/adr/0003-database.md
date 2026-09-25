# ADR 0003: Database (Milestone 6)

File: docs/adr/0003-database.md. Purpose: records why the database is built the way it is.

## Decisions

1. **Prisma 6 with PostgreSQL on Neon.** Typed queries, migration files kept in git (`prisma/migrations`),
   and a hosted database that suits Vercel. Pinned to major 6 because it is mature and widely documented.
2. **Two connection strings.** `DATABASE_URL` is Neon's pooled link (the app opens many short connections
   on Vercel). `DIRECT_URL` is the non-pooled link that `prisma migrate` needs.
3. **The full 14-table schema from Milestone 2 is created at once**, with enums for fixed lists, cascade
   deletes from User downwards, and an index on every foreign key plus the query-driven indexes from Milestone 2.
4. **Trigram search indexes are deferred to Milestone 13.** Prisma would try to drop hand-added indexes it does
   not model. We add and test them together with the search feature.
5. **Users are saved on first visit (`getCurrentUser`), and also by the Clerk webhook.** The webhook cannot reach
   localhost, so first-visit sync keeps local development simple. The webhook keeps name/email up to date and
   deletes a user's data when they delete their Clerk account. It must be configured before deploying (Milestone 15).
6. **`User.email` is optional.** Clerk accounts can exist without an email (for example phone sign-in later).
7. **UserSettings is created lazily** the first time settings are saved, so user creation stays one atomic upsert.
8. **Access rule.** Only `src/features/*/services/*` import `db` (`server-only`). Every query for user data filters
   by the signed-in user's `id` from `getCurrentUser()` (through `Meeting.userId`). Never trust an ID from the browser alone.
9. **`costMicros` is an Int** (millionths of a dollar): enough for about US$2,100 per user per day.

## Consequences

- `next build` and CI need `DATABASE_URL` and `DIRECT_URL` set (dummy values are fine for a build that does not query).
- Changing a table means editing `schema.prisma` and running `pnpm db:migrate`; commit the generated migration folder.
