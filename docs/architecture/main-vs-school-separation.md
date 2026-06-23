# Main Site vs. School Org Separation

Status: Accepted (Phase 1 implemented) · Last updated: 2026-06-23

## Decision

The active experience is derived from the **request** (host/path), not from the
user's global Clerk `publicMetadata.organization_id`.

- Apex (`mamuncofoundr.com`) → **general** experience for everyone, regardless of
  email domain.
- `/school/[slug]` path or org subdomain (e.g. `ut.mamuncofoundr.com`) → that
  **org's** experience.

Onboarding is tracked **per context**: `onboardingComplete` for general,
`schoolOnboarding: { [orgId]: true }` for each org. A user onboards once per
context. On a school site, users whose verified email domain is not in the org's
`allowed_email_domains` are gated out to `/school/[slug]/not-authorized`.

We deliberately do **not** use Clerk Organizations.

## Why

Clerk allows one profile per email, so one person spans both sites. Previously the
middleware chose the experience from a single global `organization_id`, so a
school-email user was treated as a school user *everywhere* — on the main site they
were redirected to the school's terms page, their profile was hidden, and the
general experience was unreachable. Anchoring the experience to the request fixes
this and matches user intent: the site you're on decides what you see.

### Bugs this resolves

1. Non-org email on the main site couldn't access header tabs — users were bounced
   to `/onboarding` before the general onboarding gate was correctly separated from
   school routing.
2. School-email user on the main site was redirected to `/school/[slug]/accept-policies`
   because the middleware's school consent gate fired for any route when `organization_id`
   was set, regardless of which site the user was on.
3. School-email user's profile didn't show on the main site because `SchoolUserGuard`
   force-refreshed the JWT and hijacked them into the school experience.

## Phase 1 (current) vs. Phase 2 (future)

**Phase 1** keeps the single shared `profiles` row (UNIQUE on `user_id`) with one
`organization_id`. Profile data overlaps across contexts (accepted). A user is in
only **one matching pool at a time** (the pool their `profiles.organization_id`
points at). Their profile still *displays* on either site (reads are by `user_id`),
but cross-pool *matching membership* is single-pool.

**Phase 2** (true separation, when needed) re-keys `profiles` and `school_profiles`
on `(user_id, organization_id)` (NULL = general), so a user can hold a general
profile and an org profile independently and appear in both pools. Because Phase 1
already threads the resolved context through middleware, `completeOnboarding`, and
`resolveTenantScope`, Phase 2 is a mostly **data-layer** migration:

- Change the upsert `onConflict` key and read `eq` clauses in
  `src/features/profile/services/onboardingProfile.ts` to include the context.
- Drop the single-pool assumption in `src/features/school/auth/tenant-scope.ts`
  (the slug-null general path is already correct; the slug-present org-pool path
  simply needs the data to match).
- Remove the `profiles_user_id_key` UNIQUE constraint and replace with
  `UNIQUE(user_id, organization_id)`.

No UX or control-flow rework is needed.

## Invariants for contributors

- **Never** select the experience from `sessionClaims.metadata.organization_id`.
  Derive it from the request slug/host (see `src/middleware.ts`).
- `organization_id` in Clerk metadata is for **pool membership only** (Phase 1).
  Validate school membership per-request against the slug's org via
  `allowed_email_domains` + `getVerifiedPrimaryEmail`.
- Add new onboarding-gated state per context, not as a new global boolean.
  General: `onboardingComplete`. School: `schoolOnboarding[orgId]`.
- The apex matching endpoints always resolve to the general pool
  (`resolveTenantScope` with no slug → `{ kind: "general" }`).

## Key files

| File | Role |
|------|------|
| `src/middleware.ts` | Request-derived context; school email-domain gate; per-context onboarding gates |
| `src/app/(general)/onboarding/_actions.ts` | Context-aware `completeOnboarding` |
| `src/features/school/auth/tenant-scope.ts` | API pool resolution; slug-null → general |
| `src/features/school/components/SchoolContext.tsx` | Provides `orgId` to school pages |
| `src/app/(school)/school/[slug]/sso-complete/page.tsx` | Per-org onboarding destination |
| `types/global.d.ts` | `schoolOnboarding` type in JWT claims |
