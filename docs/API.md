# API reference

Every route below lives under `src/app/api/<path>/route.ts` (Next.js App
Router). For the platform-level picture — middleware, Supabase clients, cron
scheduling, storage buckets — see [`DEPLOYMENT.md`](./DEPLOYMENT.md) and
[`ARCHITECTURE.md`](./ARCHITECTURE.md). Known gaps and their status live in
[`DEPLOYMENT_FINDINGS.md`](./DEPLOYMENT_FINDINGS.md) (gitignored locally —
ask a teammate if you don't have a copy).

**Auth model.** `src/middleware.ts` redirects any unauthenticated request to
a non-public route to Clerk sign-in before it reaches a route handler — see
the public-route list there for the small set of routes reachable without a
session (`/api/webhooks/clerk`, `/api/cron/*`, `/api/send`). Most routes then
call `auth()` themselves as defense-in-depth. "Auth" below means the route
requires a signed-in Clerk session unless noted otherwise. "Org-admin" means
`requireOrgAdmin()` (`src/features/school/auth/org-admin.ts`) — the caller
must be a member of the org's `admin_emails` allowlist. "Platform-admin"
means `profiles.is_admin` is checked directly against a service-role client.

**Rate limiting.** Postgres-backed, via `checkRateLimit()`
(`src/lib/rateLimit.ts`) and the `rate_limits` table
(`supabase/migrations/20260920000001_add_rate_limits.sql`). Fails open — a
limiter outage allows the request rather than 500ing. Limits are noted per
route below; routes with no note have none.

---

## Profile

| Method        | Path                        | Auth                                  | Description                                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | --------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET           | `/api/profile`              | Auth                                  | The caller's own onboarding profile.                                                                                                                                                                                                                                                                                                                                             |
| POST          | `/api/profile`              | Auth                                  | Upsert the caller's own profile. Also writes a `school_profiles` row when the session (or an explicit `_saveContext`) resolves to a school org. Body is whitelisted through `mapOnboardingDatatoProfileDB()` — no mass-assignment to `is_admin`/`organization_id`/`deleted_at`.                                                                                                  |
| GET           | `/api/profile/[userId]`     | Auth                                  | Another user's profile. Gated: allowed if the caller shares a matching pool with the target, or has a direct relationship (shared conversation, mutual like, or confirmed co-founder link). Otherwise 403.                                                                                                                                                                       |
| GET           | `/api/profiles`             | Auth                                  | The scored/filtered candidate feed (swipe deck) for the caller's pool (general or school org, resolved server-side from the org slug — never trusted from the client). Also seeds `matching_queue` rows for any new candidate.                                                                                                                                                   |
| POST          | `/api/profiles/search`      | Auth                                  | School-tenant-only semantic + full-text candidate search. Body: `{ q, org?, userFilters?, cachedParse?, dismissedFilterKeys? }`. Uses Groq for query parsing, a Supabase Edge Function for embeddings, and `search_profiles_hybrid()` (Postgres RPC) for ranking. Returns AI-inferred filter chips and, on a zero-result hard-filter wall, per-dimension relaxation suggestions. |
| PATCH         | `/api/profiles/seen`        | Auth                                  | Marks one `matching_queue` row `seen_at` (drives the "New" badge). Body: `{ candidate_user_id }`.                                                                                                                                                                                                                                                                                |
| POST          | `/api/profiles/reset-round` | Auth                                  | Resets the caller's `matching_queue.cycle` to 0, i.e. restarts the swipe deck from the top.                                                                                                                                                                                                                                                                                      |
| POST          | `/api/profile-views`        | Auth                                  | Records that the caller viewed `target_user_id`'s profile (upsert, idempotent per pair).                                                                                                                                                                                                                                                                                         |
| POST          | `/api/upload-profile-pic`   | Auth · 10/hr                          | Uploads to the public `profile-pic` Supabase Storage bucket, updates `profiles.pfp_url`, and best-effort syncs the image to Clerk's own avatar. 5MB cap; JPEG/PNG/WebP only. Storage key's extension is derived from the validated MIME type, not the client-supplied filename.                                                                                                  |
| DELETE / POST | `/api/delete-profile`       | DELETE: org-admin · POST: Auth (self) | `POST` deletes the caller's own account (Supabase profile, messages, likes, actions, storage, then the Clerk user). `DELETE` is admin-initiated deletion of another user in the same org (`?targetUserId=`), with an explicit org-match check before deleting.                                                                                                                   |

## Matching, likes, skips

| Method     | Path                  | Auth          | Description                                                                                                                                                                                                                        |
| ---------- | --------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST       | `/api/like`           | Auth · 300/hr | Records a like (`likedId` in body). `likedId` is validated against the Clerk-id shape (`isValidClerkUserId`) before being trusted — it's later read back and used to build a query filter, so this closes a filter-injection path. |
| DELETE     | `/api/like`           | Auth          | Removes a like. Same `likedId` validation.                                                                                                                                                                                         |
| POST       | `/api/skip`           | Auth · 300/hr | Records a skip and bumps the candidate's `matching_queue.cycle` (so skipped profiles cycle to the back of the deck).                                                                                                               |
| GET        | `/api/likes/mutual`   | Auth          | User IDs the caller has mutually liked, scoped to the caller's org/pool.                                                                                                                                                           |
| GET        | `/api/likes/profiles` | Auth          | Full profile objects for everyone the caller has liked.                                                                                                                                                                            |
| GET        | `/api/swipe-count`    | Auth          | Today's like+skip count against the daily swipe limit (general-pool users only; school-org users are unlimited).                                                                                                                   |
| GET / POST | `/api/we-match`       | Auth          | `POST` records a "We Match" intent toward `toUserId` (school-org only); if the other side already sent one, marks it mutual and emails both parties. `GET` returns the caller's sent/mutual-notified intent lists.                 |

## Co-founder linking

| Method     | Path                                    | Auth               | Description                                                                                                                                                                   |
| ---------- | --------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET / POST | `/api/cofounder-invite`                 | Auth · POST 20/day | `GET` lists the caller's sent invites and existing links. `POST` creates an invite (school-org only, invitee email domain must be org-allowed), one active link per user max. |
| POST       | `/api/cofounder-invite/[token]/accept`  | Auth               | Accepts an invite: creates the canonical `cofounder_links` row, syncs both profiles' startup name/site, emails both parties.                                                  |
| POST       | `/api/cofounder-invite/[token]/decline` | Auth               | Declines an invite (invitee only; inviter must use revoke).                                                                                                                   |
| POST       | `/api/cofounder-invite/[token]/resend`  | Auth               | Re-sends the invite email and extends its expiry (inviter only, 60s cooldown).                                                                                                |
| POST       | `/api/cofounder-invite/[token]/revoke`  | Auth               | Revokes a pending invite (inviter only).                                                                                                                                      |
| GET        | `/api/cofounder-link/[userId]`          | Auth               | Lightweight co-founder badge data for a user's profile card. Cross-org access blocked explicitly (see the IDOR comment in the route).                                         |
| DELETE     | `/api/cofounder-link`                   | Auth               | Unlinks a co-founder pair. Either party may call it; body: `{ linkId }`.                                                                                                      |

## Messaging

| Method     | Path                                  | Auth | Description                                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET / POST | `/api/conversations`                  | Auth | `GET` lists the caller's conversations (org-scoped). `POST` creates a conversation with `otherUserId` (validated as a Clerk id).                                                                                                                                                          |
| GET        | `/api/conversations/[conversationId]` | Auth | One conversation's details.                                                                                                                                                                                                                                                               |
| GET        | `/api/messages/[conversationId]`      | Auth | Polling-based message fetch for a conversation (no websocket).                                                                                                                                                                                                                            |
| POST       | `/api/messages/[conversationId]/send` | Auth | Sends a message. Requires the caller to be a conversation participant (checked server-side). General-pool (non-org) conversations are capped at 20 messages; school-org conversations are unlimited. Sends a batched email notification to the recipient if they're not actively reading. |

## Contact / reporting / AI

| Method | Path                | Auth                     | Description                                                                                                                                                                                                                     |
| ------ | ------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/send`         | **Public** · 5/hr per IP | The `/contact-us` marketing form. Deliberately unauthenticated — anonymous visitors are the intended callers. Validates required fields, HTML-escapes everything before it goes into the outbound email body, sends via Resend. |
| POST   | `/api/report-abuse` | Auth · 5/hr              | Reports a profile. HTML-escapes all interpolated fields before emailing.                                                                                                                                                        |
| POST   | `/api/ai/suggest`   | Auth · 20/hr             | Onboarding-field text expansion/typo-fix via Gemini. Body: `{ text, fieldType }`.                                                                                                                                               |
| POST   | `/api/parse-resume` | Auth · 3/24h             | Parses an uploaded resume via Affinda for onboarding autofill. Does **not** persist the file to storage — parse-only, nothing saved. 5MB cap.                                                                                   |

## School admin (org-scoped)

All require `requireOrgAdmin()` — the caller's verified email must be on the org's `admin_emails` allowlist (DB `organizations.settings.admin_emails` or the `ADMIN_EMAILS` env var).

| Method | Path                                 | Description                                                                                                                  |
| ------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/school/students`               | Org's student roster.                                                                                                        |
| GET    | `/api/school/analytics`              | Org-level usage analytics.                                                                                                   |
| GET    | `/api/school/connections`            | Org's actual conversation connections.                                                                                       |
| GET    | `/api/school/match-connections`      | Org's matching-queue-derived connections (a different dataset from the above — matching intent, not realized conversations). |
| GET    | `/api/school/reports/cohort`         | Downloads a cohort CSV.                                                                                                      |
| GET    | `/api/school/reports/match-outcomes` | Downloads a match-outcomes CSV.                                                                                              |

## Platform admin (global)

Both require `profiles.is_admin = true`, checked against a service-role client. These pages have no in-app navigation link (URL-only, not linked from anywhere) — see `src/app/(general)/admin/*`.

| Method | Path                       | Description                                                                                                                          |
| ------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/admin/connections`   | Global (cross-org) connection list.                                                                                                  |
| POST   | `/api/admin/match-preview` | Dry-run the matching algorithm against arbitrary JSON input — no DB reads/writes, just scoring. Body: `{ currentUser, candidates }`. |

## Cron

Both are in `vercel.json`'s schedule and in `src/middleware.ts`'s public-route allowlist (`/api/cron/(.*)`) — they're reachable without a Clerk session by design, and instead check `Authorization: Bearer <CRON_SECRET>` (fails closed: a missing/wrong secret always 401s, whether or not `CRON_SECRET` itself is set).

| Method     | Path                             | Schedule          | Description                                            |
| ---------- | -------------------------------- | ----------------- | ------------------------------------------------------ |
| GET / POST | `/api/cron/lifecycle-emails`     | Daily 03:00 UTC   | Profile-completion reminders and re-engagement emails. |
| GET / POST | `/api/cron/weekly-profile-views` | Sundays 09:00 UTC | Weekly profile-view digest emails.                     |

## Webhooks

| Method | Path                  | Auth                             | Description                                                                                                                                                                                                                                            |
| ------ | --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/webhooks/clerk` | Svix signature (`verifyWebhook`) | Clerk → app events. On `user.created`: auto-assigns a school org by verified email domain (if that org's FERPA DPA is signed), sends the welcome email, and records a referral if `unsafe_metadata.referral_code` matches the `mamun-<8 chars>` shape. |

---

## Removed endpoints

These existed at some point and were deleted as dead surface area (see
`docs/DEPLOYMENT_FINDINGS.md` F-1 and F-6 for the history):

- `/api/ut-profile` — deprecated alias for `/api/profile`, zero callers.
- `/api/cron/sync-posthog-activity` — never wired into `vercel.json`, never triggered.
- `/api/upload-resume` — retired along with the Hiring badge's resume-attachment feature (it required a public storage bucket to work, since the attachment was delivered via a `mailto:` link).

## Adding a new route

- Auth: call `auth()` from `@clerk/nextjs/server` yourself even though
  middleware also gates non-public routes — don't rely on middleware alone
  (see F-3 / the CVE-2025-29927-adjacent note in `DEPLOYMENT_FINDINGS.md`).
- IDs from the request body/query that represent a Clerk user: validate with
  `isValidClerkUserId()` (`src/lib/validation.ts`) before trusting them,
  especially before they touch a raw Supabase filter string.
- Any user input going into an email body: escape with `escapeHtml()`
  (`src/lib/html.ts`).
- Anything that calls a paid API, sends email, or is reachable without auth:
  add rate limiting with `checkRateLimit()` (`src/lib/rateLimit.ts`).
- Business logic belongs in `src/features/<domain>/`, not in the route file
  — see the folder conventions in `ARCHITECTURE.md`.
