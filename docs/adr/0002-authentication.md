# 0002: Authentication with Clerk

Date: 2026-09-21. Status: accepted.

## Context

Milestone 5 adds login, signup, password reset, profile and session management (AUTH-01 to AUTH-06).
Security matters because meetings often contain confidential content.

## Decisions

| Decision                                                                                            | Why                                                                                      | Alternative rejected                                |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Clerk hosts the login forms and sessions                                                            | No passwords stored by us; reset emails, Google login and session handling come built in | Building auth ourselves: high security risk         |
| Private by default: `src/middleware.ts` lists the few public routes, everything else requires login | A new page can never be left unprotected by mistake                                      | Protecting each page individually                   |
| `requireUserId()` is the first line of every Server Action and API route                            | One consistent, testable check (step 1 of the entry-point checklist)                     | Ad hoc checks per route                             |
| Clerk forms styled through our CSS tokens (`authAppearance`)                                        | They follow light and dark mode with no extra code                                       | Separate Clerk theme package                        |
| Copying users into our database (webhook) moves from Milestone 5 to Milestone 6                     | The user table does not exist until the database milestone                               | Building the webhook now with nowhere to store data |
| Clerk keys are validated at startup in `src/lib/env.ts`                                             | Clear message instead of a confusing crash                                               | Reading keys ad hoc                                 |

## Consequences

- `/api/uploadthing` must be made reachable by UploadThing's callback in Milestone 7 (it will need its own signature check, like webhooks).
- CI needs the two Clerk keys as GitHub repository secrets to run `pnpm build`.
