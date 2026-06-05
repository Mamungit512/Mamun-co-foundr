# Architecture overview

## Folder conventions

```
src/
  app/              Next.js routing — page and API route files ONLY
                    These are thin shells: authenticate, call a service, return a response.
                    Business logic does NOT live here.

  features/         Vertical slices — one folder per domain feature
    school/         Everything about the school tenant (see features/school/README.md)
    matching/       Candidate scoring and filtering logic
    matches/        "We Match" mutual-interest records
    messages/       Message sending and conversation management
    likes/          Like/unlike actions and liked-profiles feed
    conversations/  Conversation listing and threading
    profile/        Profile CRUD and data-fetching hooks
    connections/    Connection tracking
    auth/           General auth utilities (Clerk helpers)
    user-actions/   User activity logging

  components/
    ui/             Primitive UI components (inputs, progress bars, modals)
                    No feature-specific logic. Safe to import from anywhere.
    home/           Landing page sections for general CoFoundr
    header_footer/  Global layout components (non-school)
    referrals/      Referral system UI
    forms/          Shared form primitives

  hooks/            Custom React hooks that don't belong to a single feature
  lib/              Cross-cutting utilities used by multiple features
                    (mapProfileToFromDBFormat, searchQueryParser, posthog-events, etc.)
  middleware.ts     Request-level routing: auth gate, org routing, FERPA gate
```

## Key architectural decisions

### Vertical-slice features
Domain code is organized by *feature*, not by *technical layer*. To understand "how
school works," read `features/school/`. To understand "how matching works," read
`features/matching/`. You should not need to jump across many top-level folders to
trace one feature end-to-end.

### Thin route shells
`src/app/api/*/route.ts` and `src/app/*/page.tsx` files handle the HTTP/Next.js layer
only: parse request, authenticate, call a service function from `features/`, return a
response. They do not contain business logic. This keeps route files short and testable
logic in plain TypeScript functions.

### Multi-tenant school architecture
Schools (organizations) are isolated at the database level via `organization_id` on
every relevant table, enforced by Supabase RLS policies. The middleware enforces routing
(school users → `/school/[slug]/...`; general users → `/dashboard`). Adding a new school
requires only a DB row + a config entry in `features/school/registry/registry.ts` — no
new code branches.

See `features/school/README.md` for school-specific details.
See `docs/School_Tenant_Isolation.md` for the full architectural RFC.

### Data fetching
Server state is managed with **TanStack React Query**. Custom hooks in `features/*/use*.ts`
own the query/mutation definitions. Service functions in `features/*Service.ts` own the
actual fetch/Supabase calls and are framework-agnostic (no React dependencies).

### Auth
**Clerk** handles identity. The Clerk JWT carries `metadata.organization_id` so org
membership is available in every request without a DB lookup. Supabase is initialized
with the user's Clerk token for RLS enforcement.

### Types
Global DB-row types and shared domain types live in `types/global.d.ts`. Feature-specific
types should live alongside the feature code (in the `features/` folder).
