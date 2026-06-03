# features/school

Everything related to the school tenant feature lives here. A "school tenant" is an
organization (e.g. UT Austin) that gets its own isolated matching pool, custom branding,
and FERPA-compliant data handling, accessed at `/school/[slug]/...`.

UT Austin is the first and currently only school. The architecture is designed so that
adding a second school means adding a config entry, **not** new code branches.

## Folder map

```
features/school/
  components/         UI for school pages (shared across all schools)
    auth/             Sign-in, sign-up, SSO components
    dashboard/        Candidate card grid, filter sidebar
    landing/          Public landing page sections (hero, how-it-works, etc.)
    contact/          Contact panel components
    SchoolContext.tsx  React context — provides slug, name, OrgConfig to the tree
    SchoolHeader.tsx   Authenticated header for school portal
    OrgHeaderSwitch.tsx

  registry/           Per-school branding and config (the multi-tenant seam)
    types.ts          OrgConfig type — the contract every school must satisfy
    registry.ts       ORG_REGISTRY — add a new key here to onboard a new school

  data/               Data-access utilities for the school domain
    organizations.ts  Supabase queries: getOrganizationBySlug, getOrganizationById
    utSchoolsAndMajors.ts  UT-specific college/major catalog (UT config data)
    dashboardFilters.ts    DashboardFilters type + filter-building helpers

  auth/               Auth guards and school-specific auth utilities
    org-admin.ts      requireOrgAdmin() — guards admin API routes
    email-domain.ts   isEmailDomainAllowed() — org email allowlist check
    school-auth.ts    Server action: assign school org to user on sign-up

  onboarding/         School onboarding flow
    components/       UT* form step components (UTAboutYouForm, UTStartupForm, etc.)
```

## How routing works

Next.js route files live in `src/app/school/[slug]/...` (framework requirement).
Those page files are **thin shells** — they import UI and logic from this feature folder.
Business logic belongs here, not in the route files.

The `[slug]` dynamic segment maps to an org's `slug` column in the `organizations` DB
table (e.g. `"ut"`). The org's full config is looked up via `getOrgConfig(slug)` from
`registry/registry.ts`.

## Adding a new school

1. Insert a row into the `organizations` DB table (slug, name, allowed_email_domains, etc.)
2. Add a seed migration to set `ferpa_dpa_signed_at` once the DPA is signed
3. Add a new key to `ORG_REGISTRY` in `registry/registry.ts` with the school's branding
4. Add the school's college/major catalog in `data/` (following `utSchoolsAndMajors.ts`)
5. Add the school's admin emails via migration (see `supabase/migrations/*_seed_*_admin_emails.sql`)

No new components, no new branches in existing code.

## Known cross-boundary imports (school logic used in general features)

These files outside `features/school/` currently import school-specific modules.
They are documented here because the coupling is intentional but should be kept minimal:

- `src/features/matches/ProfileDetailModal.tsx` — imports `utSchoolsAndMajors` to display
  college/major labels on a matched profile card
- `src/features/profile/useProfile.ts` — imports `dashboardFilters` to include school
  filter params in the profile-feed query string
- `src/app/api/profiles/search/route.ts` — imports `utSchoolsAndMajors` + `dashboardFilters`
  to support school-scoped search
- `src/app/api/we-match/route.ts` — imports `getOrgConfig` for org-level match config
- `src/app/api/delete-profile/route.ts` — imports `requireOrgAdmin` as an auth guard
