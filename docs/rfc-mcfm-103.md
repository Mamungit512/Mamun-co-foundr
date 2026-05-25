# RFC: MCFM-103 — School Tenant Isolation & UT Austin Launch

**Branch:** `MCFM-103`
**Status:** Draft
**Authors:** Mamun Co-Foundr Engineering
**Diff:** 89 files changed, +7 523 / −578 lines

---

## 1. Motivation

Mamun Co-Foundr is a general-purpose co-founder matching platform. Universities want their own branded, privacy-compliant instance that limits matching to students and alumni of their school. The first partner is **UT Austin**.

This PR introduces a multi-tenant "school" isolation layer so that:

- Each school gets a branded portal at `/school/{slug}` (optionally served from its own subdomain).
- Student data is walled off from the general matching pool at the database, API, and middleware layers.
- FERPA compliance is enforced: no student data is collected until a Data Processing Agreement is recorded.
- Analytics tracking (PostHog) is suppressed per-org when `suppress_tracking` is set.

---

## 2. Architecture Overview

```
┌──────────────┐   subdomain   ┌─────────────┐   path rewrite   ┌──────────────────────┐
│  ut.mamun...  │ ──────────▶  │  middleware  │ ──────────────▶  │ /school/ut/dashboard  │
└──────────────┘               │  (clerk)     │                  └──────────────────────┘
                               │              │
┌──────────────┐   apex host   │  org_id in   │   general pool   ┌──────────────────────┐
│ mamuncofoundr │ ──────────▶  │  JWT claims  │ ──────────────▶  │ /cofoundr-matching    │
└──────────────┘               └─────┬────────┘                  └──────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Supabase (RLS)     │
                          │  organization_id FK  │
                          └──────────────────────┘
```

### Tenant identity flow

1. **Sign-up:** Clerk `user.created` webhook checks the new user's email domain against `organizations.allowed_email_domains`. If matched (and FERPA DPA is signed), `publicMetadata.organization_id` is stamped on the Clerk user.
2. **Middleware:** Reads `sessionClaims.metadata.organization_id`. School users are routed to `/school/{slug}/*` and gated through FERPA and onboarding checks. General users are routed to `/cofoundr-matching`.
3. **API layer:** `GET /api/profiles` scopes candidates to the caller's `organization_id`. School tenants further filter to users with a `school_profiles` row (verified enrollment).
4. **Database:** RLS policies on `profiles`, `likes`, `matching_queue`, `conversations`, `messages`, and `organizations` enforce isolation via `auth.organization_id()` extracted from the Clerk JWT.

---

## 3. Database Changes

### New tables

| Table | Purpose |
|---|---|
| `organizations` | One row per school. Stores slug, allowed email domains, FERPA DPA timestamp, `suppress_tracking`, and a `settings` JSONB column. |
| `school_profiles` | Per-user school-specific fields (status, graduation year, college, degree type, major, sector interests). Keyed by `user_id`, FK to `organizations`. |

### Schema modifications

| Table | Change |
|---|---|
| `profiles` | Added `organization_id uuid REFERENCES organizations(id)`. `NULL` = general pool. |
| `matching_queue` | Added `seen_at timestamptz` for "New" badge support. |

### RLS policies

A new helper function `auth.organization_id()` extracts the org UUID from the Clerk JWT. Policies on 7 tables enforce: general users see only `organization_id IS NULL` rows; school users see only their own org's rows. Since the app uses the service-role key for API routes, these are defense-in-depth for any anon/client-key access.

### Migrations

| File | Description |
|---|---|
| `supabase-migrations/add_organizations_table.sql` | Creates `organizations` table |
| `supabase-migrations/add_organization_id_to_profiles.sql` | Adds FK column to `profiles` |
| `supabase-migrations/add_organization_rls_policies.sql` | All RLS policies across 7 tables |
| `supabase-migrations/update_ut_allowed_email_domains.sql` | Seeds UT org with `utexas.edu` + sub-domains |
| `supabase/migrations/20260511000000_seed_ut_org.sql` | Seeds the UT Austin organization record |
| `supabase/migrations/20260520000001_create_school_profiles.sql` | Creates `school_profiles` table |
| `supabase/migrations/20260520000003_add_seen_at_to_matching_queue.sql` | Adds `seen_at` column |
| `supabase/migrations/20260524000001_seed_ut_mock_profiles.sql` | 10 mock UT student/alumni profiles for QA |

---

## 4. Middleware (`src/middleware.ts`)

Rewritten to support three traffic classes:

| Class | Detection | Behavior |
|---|---|---|
| **Subdomain** | `ut.mamuncofoundr.com` → `getSubdomain()` | Resolves org from DB, rewrites path to `/school/{slug}/*` |
| **School user** | `organization_id` present in JWT | FERPA gate → onboarding gate → school dashboard |
| **General user** | No `organization_id` | Legacy onboarding → `/cofoundr-matching` |

Key gates:
- **FERPA:** If `org.ferpa_dpa_signed_at` is null, redirect to `/school/{slug}/pending-activation`.
- **Onboarding:** If `metadata.onboardingComplete` is false, redirect to `/school/{slug}/onboarding`.
- **Cross-org guard:** A signed-in user on a subdomain that doesn't match their org is redirected to apex.

---

## 5. Org Registry & Branding (`src/orgs/`)

A static config layer drives per-school theming without DB round-trips on every render.

- **`types.ts`** — `OrgBranding` (colors, logo, wordmark) + `OrgLanding` (headline, CTA labels, hero image).
- **`registry.ts`** — `ORG_REGISTRY` map keyed by slug. UT entry uses burnt orange (`#BF5700`), UT logo SVG, and school-specific copy. Fallback `DEFAULT_ORG_CONFIG` for general branding.
- **`SchoolContext.tsx`** — React context providing `slug`, `schoolName`, and `config` to all school pages.
- **`SchoolHeader.tsx`** — Authenticated school header with org logo/wordmark and nav links.
- **Layout** — `/school/[slug]/layout.tsx` injects CSS custom properties (`--org-primary`, `--org-accent`, etc.) from the config, with semantic light-mode overrides for white-background schools.

---

## 6. School Pages (`src/app/school/[slug]/`)

| Route | Description |
|---|---|
| `page.tsx` | Public landing page with hero, how-it-works, department mosaic, values pillars, CTA band, footer |
| `sign-up/` | Clerk `<SignUp>` with school-branded appearance and `.edu` domain enforcement |
| `sign-in/` | Clerk `<SignIn>` with school-branded appearance |
| `sso-callback/` | Clerk SSO callback handler |
| `sso-complete/` | Post-SSO redirect that syncs org metadata and routes to onboarding or dashboard |
| `onboarding/` | Multi-step school-specific onboarding (About You, Background, Startup, Interests, Photo, Review) |
| `dashboard/` | Card-based co-founder matching UI, scoped to the school tenant, with "New" badges and school-specific profile fields (college, major, degree, graduation year) |
| `matches/` | Mutual matches list for school users |
| `profile/` | Full profile view with school-specific data display |
| `admin/` | Admin dashboard (gated by `is_school_admin` claim) showing registered student list |
| `pending-activation/` | Holding page shown when FERPA DPA is not yet signed |

---

## 7. School Onboarding Forms (`src/app/onboarding/form-components/UT*.tsx`)

Six new form components tailored for UT Austin:

| Component | Fields |
|---|---|
| `UTAboutYouForm` | First/last name, title, city/state/country, student vs. alumni status, graduation year, college, degree type, major |
| `UTBackgroundAndSocialsForm` | Bio, LinkedIn, GitHub |
| `UTStartupForm` | Has startup?, name, description, stage, funding, team size, seeking co-founder |
| `UTInterestsForm` | Sector interests (multi-select pills), archetype selection |
| `UTProfilePhotoForm` | Photo upload with drag-and-drop |
| `UTReviewForm` | Summary card with edit-back links, submit |

All forms use UT branding via CSS custom properties from the layout and submit to `/api/ut-profile`.

---

## 8. API Routes

### New

| Route | Method | Description |
|---|---|---|
| `/api/ut-profile` | `POST` | Upserts both `profiles` and `school_profiles` rows. Validates school-required fields server-side. |
| `/api/profiles/seen` | `PATCH` | Marks a matching-queue entry as seen (sets `seen_at`), enabling the "New" badge. |
| `/api/school/students` | `GET` | Admin-only endpoint returning org-scoped student list. Gated by `is_school_admin` claim. |
| `/api/webhooks/clerk` | `POST` | Extended: on `user.created`, checks email domain against `organizations.allowed_email_domains` and auto-assigns `organization_id` in Clerk metadata if FERPA DPA is signed. |

### Modified

| Route | Change |
|---|---|
| `/api/profiles` | Scopes candidate queries by `organization_id`. School tenants additionally filter to `school_profiles` members. Enriches response with school fields. Adds `isNew` flag from `matching_queue.seen_at`. Mamun staff on apex host bypass org scoping. |
| `/api/messages/.../send` | Replaced inline React email template (`MessageDigestEmail`) with Resend template ID (`new-notification-design-trigger`) and variable-based rendering. |

---

## 9. Matching Pipeline Changes

- **Org-scoped candidates:** `GET /api/profiles` adds a hard `organization_id` filter (equality for school users, `IS NULL` for general pool).
- **School enrollment gate:** For school tenants, only users with a `school_profiles` row for the same org appear as candidates.
- **"New" badge:** `matching_queue.seen_at` is set on first card view via `PATCH /api/profiles/seen`. Profiles with `seen_at = NULL` show a "NEW" badge on the dashboard card.
- **Enriched profiles:** School candidates are enriched with `utStatus`, `utCollege`, `utMajor`, `utDegreeType`, `gradYear`, and `utSectorInterests` from `school_profiles`, displayed on the dashboard card and profile page.

---

## 10. PostHog & Analytics

- `PostHogProvider` now checks `suppress_tracking` from org settings. When true, PostHog is not initialized, and `posthog.opt_out_capturing()` is called (FERPA compliance).
- `trackEvent` calls are safe no-ops when PostHog is suppressed.

---

## 11. Other Notable Changes

| Area | Change |
|---|---|
| **Email templates** | Deleted `MessageDigestEmail.tsx` (inline React Email). Emails now use Resend hosted templates with variable substitution. |
| **Intro survey** | Added `IntroSurveyModal` component with Elfsight integration. |
| **Landing page** | Events section replaced with partnership showcase for UT. |
| **UI components** | Action buttons updated to dark minimalist style with colored hover glows. Message icon changed to paper airplane. |
| **Logo** | Replaced image-based logo with text rendering. |
| **Conditional shell** | New `ConditionalShell` wrapper that omits the general app header/footer for school org routes. |
| **Email domain utils** | `src/lib/auth/email-domain.ts` — domain extraction, allowlist check, and human-friendly domain formatting. |
| **UT reference data** | `src/lib/utSchoolsAndMajors.ts` — UT colleges, majors per college, degree types, sector interests, and display helpers. |
| **Global types** | Extended with `OrganizationFromDb`, `SchoolProfileFromDb`, `UTProfileData`, `MatchingQueueFields`, and updated `OnboardingData` to include school fields. |

---

## 12. Security Considerations

| Concern | Mitigation |
|---|---|
| Cross-tenant data leakage | RLS policies + API-layer `organization_id` filtering + middleware org-check |
| FERPA — data collection before DPA | Middleware blocks login until `ferpa_dpa_signed_at` is set; webhook skips org assignment if DPA is unsigned |
| FERPA — analytics | `suppress_tracking` disables PostHog initialization for school orgs |
| Admin endpoint access | `/api/school/students` checks `is_school_admin` JWT claim |
| Email domain spoofing | Domain validation uses `allowed_email_domains` array stored in DB; Clerk handles email verification |

---

## 13. Testing Notes

- **Mock data:** 10 realistic UT mock profiles seeded via migration for QA.
- **Subdomain testing locally:** Set `ut.localhost:3000` in `/etc/hosts` or use the path-based `/school/ut/` route.
- **FERPA gate:** Set `ferpa_dpa_signed_at = NULL` on the UT org row to verify the pending-activation redirect.
- **General pool isolation:** Verify that school profiles do not appear in `/cofoundr-matching` and vice versa.
- **Admin dashboard:** Set `is_school_admin: true` in a user's Clerk `publicMetadata` to access `/school/ut/admin`.
