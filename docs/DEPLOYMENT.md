# Deployment overview

How Mamun Co-Foundr is deployed and how the pieces talk to each other.

> Derived from the repo at `934418c`. Vercel project settings, the Supabase dashboard
> config, and DNS are not in the repo, so details about them are inferred and marked as such.
> Known issues found while mapping this are tracked in
> [`DEPLOYMENT_FINDINGS.md`](./DEPLOYMENT_FINDINGS.md).

## At a glance

- **One Next.js 15 app on Vercel** serves both the general site (`mamuncofoundr.com`) and
  every school tenant (`<school>.mamuncofoundr.com`).
- **Edge middleware** (`src/middleware.ts`) resolves the tenant and gates access before any
  page code runs.
- **Supabase** holds the data (Postgres 17), files (Storage), and embeddings (the `embed`
  Edge Function).
- **Clerk** owns identity. Org membership lives in Clerk `publicMetadata` and is read from
  the session JWT.
- **Third-party APIs** are called from route handlers or loaded as browser SDKs.

## System diagram

```mermaid
flowchart LR
  subgraph Client["Client"]
    Browser["Browser<br/>mamuncofoundr.com<br/>&lt;school&gt;.mamuncofoundr.com<br/>React Query, 5s message polling"]
    SDKs["In-browser SDKs<br/>Clerk JS, posthog-js, fpr.js<br/>face-api + heic-to (local only)"]
  end

  subgraph Vercel["Vercel"]
    MW["Edge middleware<br/>src/middleware.ts<br/>subdomain rewrite, Clerk session,<br/>domain / FERPA / consent / onboarding gates"]
    App["Next.js 15 app (Vercel Functions)<br/>(general)/* and (school)/school/[slug]/*<br/>~45 route handlers under /api/*"]
    Cron["Vercel Cron (vercel.json, UTC)<br/>0 3 * * * lifecycle-emails<br/>0 9 * * 0 weekly-profile-views"]
  end

  subgraph Supabase["Supabase (one project per env)"]
    PG[("Postgres 17<br/>RLS by organization_id<br/>pgvector(384) + tsvector<br/>search_profiles_hybrid()<br/>pgmq: embedding_refresh<br/>pg_net")]
    Embed["Edge Function: embed (Deno)<br/>gte-small, 384 dims<br/>mode=query | mode=drain"]
    Storage[("Storage (public buckets)<br/>profile-pic<br/>resume-uploads")]
  end

  subgraph SaaS["Third-party services"]
    Clerk["Clerk<br/>identity, sessions, webhooks"]
    PostHog["PostHog<br/>analytics"]
    FP["FirstPromoter<br/>referrals"]
    Resend["Resend<br/>email"]
    Gemini["Gemini 2.5 Flash<br/>/api/ai/suggest"]
    Groq["Groq gpt-oss-20b<br/>search query parsing"]
    Affinda["Affinda<br/>/api/parse-resume"]
  end

  Browser -->|HTTPS| MW
  MW -->|rewrite / next| App
  MW -->|org + consent lookups| PG
  MW -->|verified email lookup| Clerk
  App -->|SQL / RPC, service role| PG
  App -->|upload, public URL| Storage
  App -->|embed search query| Embed
  PG -.->|trigger, pg_net: drain| Embed
  Embed -->|write profiles.embedding| PG
  Cron -->|GET + Bearer CRON_SECRET| App
  Clerk -->|user.created webhook| App

  SDKs --> Clerk
  SDKs --> PostHog
  SDKs --> FP
  App --> Resend
  App --> Gemini
  App --> Groq
  App --> Affinda
  App --> PostHog
  App --> FP
```

## Components

### Vercel

| Component | Where | Role |
| --- | --- | --- |
| Edge middleware | `src/middleware.ts` | Rewrites `<sub>.mamuncofoundr.com/*` to `/school/<slug>/*`, enforces Clerk auth, runs school gates, upserts `user_activity_summary.last_active_at`. |
| Next.js app | `src/app/**` | Pages for the general site and school tenants; ~45 route handlers under `src/app/api/`. Thin shells over `src/features/*` (see [`ARCHITECTURE.md`](./ARCHITECTURE.md)). |
| Cron | `vercel.json` | Calls `/api/cron/lifecycle-emails` daily at 03:00 UTC and `/api/cron/weekly-profile-views` Sundays at 09:00 UTC. Routes check `Authorization: Bearer CRON_SECRET`. |
| Image proxy | `next.config.ts` | `next/image` is allowed to fetch public objects from the two Supabase project hosts. |

### Supabase

| Component | Where | Role |
| --- | --- | --- |
| Postgres 17 | `supabase/migrations/*.sql` | All app data. RLS scopes rows by `organization_id`. Extensions: `vector`, `pgcrypto`, `pg_net`, `pgmq`. |
| Hybrid search | `search_profiles_hybrid()` | Fuses full-text (`search_tsv`), vector (`embedding`), and partial-name matches with reciprocal rank fusion. |
| Embedding queue | `enqueue_embedding_refresh()` trigger | On profile change, sends `{user_id}` to pgmq `embedding_refresh`, then POSTs `{mode: "drain"}` to the Edge Function via `pg_net` if `app.embed_fn_url` and `app.edge_fn_token` are set. |
| Edge Function `embed` | `supabase/functions/embed/index.ts` | `mode=query` embeds a search string; `mode=drain` processes up to 20 queue messages and writes `profiles.embedding`. |
| Storage | `profile-pic`, `resume-uploads` | Written by `/api/upload-profile-pic` and `/api/upload-resume`. Both return public URLs. |

### Supabase clients in the app

| Client | Where | RLS |
| --- | --- | --- |
| Service role | `createClient(url, SUPABASE_SERVICE_ROLE_KEY)` in most routes and middleware | Bypassed. Isolation relies on app-layer `organization_id` filters. |
| User token | `createServerSupabaseClient()` in `src/lib/supabaseServer.ts` | Enforced. Requires Clerk third-party auth enabled on the hosted Supabase project. |

The browser never talks to Supabase directly. All data access goes through route handlers.

### Third-party services

| Service | Called from | Purpose |
| --- | --- | --- |
| Clerk | Browser SDK, middleware, `/api/webhooks/clerk` | Sign-in/up (incl. school SSO), session JWT with `organization_id` and onboarding flags, `user.created` webhook. |
| Resend | `src/lib/email/*`, cron routes | Match, invite, and message notifications; lifecycle and weekly digest emails. |
| Gemini 2.5 Flash | `/api/ai/suggest` | Profile writing suggestions. |
| Groq (`openai/gpt-oss-20b`) | `src/lib/searchQueryParser.ts` | Turns search text into structured filters; 1.5s timeout. |
| Affinda (us1, v3) | `/api/parse-resume` | Parses uploaded resumes to prefill onboarding. |
| PostHog | `posthog-js` in browser, `posthog-node` on server | Product analytics. |
| FirstPromoter | `fpr.js` in browser, Clerk webhook | Referral tracking; signups reported from the webhook. |

## Key request paths

### School page request

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant MW as Middleware
  participant C as Clerk API
  participant DB as Postgres
  participant App as Next.js app

  B->>MW: GET ut.mamuncofoundr.com/dashboard
  MW->>DB: organizations where subdomain = 'ut'
  MW->>MW: rewrite to /school/ut/dashboard
  alt no session and route not public
    MW-->>B: redirect to sign-in
  end
  MW->>DB: organizations where slug = 'ut'
  opt JWT organization_id != org.id
    MW->>C: getUser (verified primary email)
    MW->>MW: check allowed_email_domains, else /not-authorized
  end
  MW->>MW: ferpa_dpa_signed_at set? else /pending-activation
  MW->>DB: latest user_consents (privacy, terms)
  MW->>MW: versions satisfied? else /accept-policies
  MW->>MW: schoolOnboarding[org.id] in JWT? else /onboarding
  MW-)DB: upsert last_active_at (fire and forget)
  MW->>App: next()
  App->>DB: queries (service role + org filter)
  App-->>B: page
```

### Sign-up and tenant assignment

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant C as Clerk
  participant W as /api/webhooks/clerk
  participant DB as Postgres
  participant FP as FirstPromoter

  B->>C: sign up (email or school SSO)
  C->>W: user.created (signed with CLERK_WEBHOOK_SIGNING_SECRET)
  W->>DB: match email domain to organizations.allowed_email_domains
  W->>C: updateUserMetadata(publicMetadata.organization_id)
  W->>DB: write profile / referral rows
  opt referred signup
    W->>FP: track signup
  end
  Note over B,C: next session JWT carries organization_id,<br/>so middleware can skip the Clerk lookup
```

### Profile edit to embedding refresh

```mermaid
sequenceDiagram
  autonumber
  participant App as Next.js app
  participant DB as Postgres
  participant Q as pgmq embedding_refresh
  participant E as Edge Function embed

  App->>DB: UPDATE profiles
  DB->>Q: pgmq.send({user_id}) via trigger
  opt app.embed_fn_url and app.edge_fn_token set
    DB-)E: pg_net POST {mode: "drain"}
  end
  E->>Q: read up to 20 messages (vt 30s)
  E->>DB: read profiles + school_profiles
  E->>E: gte-small embedding (384 dims)
  E->>DB: UPDATE profiles.embedding
  E->>Q: delete message
```

### Natural-language search

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant S as /api/profiles/search
  participant G as Groq
  participant E as Edge Function embed
  participant DB as Postgres

  B->>S: GET ?q=...
  S->>G: parse query into filters (1.5s budget)
  S->>DB: eligible user IDs for viewer's org + filters
  S->>E: {mode: "query", text}
  E-->>S: query vector
  S->>DB: search_profiles_hybrid(eligible_ids, query_text, query_vec)
  S->>DB: enrich profiles
  S-->>B: results
```

### Scheduled jobs

| Schedule (UTC) | Route | Does |
| --- | --- | --- |
| `0 3 * * *` | `/api/cron/lifecycle-emails` | Profile-completion reminders and re-engagement emails (`src/lib/email/lifecycle/`). |
| `0 9 * * 0` | `/api/cron/weekly-profile-views` | Weekly profile-view digests. |
| not scheduled | `/api/cron/sync-posthog-activity` | Syncs PostHog activity into `user_activity_summary`. Route exists, no entry in `vercel.json`. |

## Environments

| Env | App | Database | Auth | Schema changes |
| --- | --- | --- | --- | --- |
| Local | `npm run dev` (`next dev --turbopack`) | Supabase in Docker: API `:54321`, Postgres `:54322`, Studio `:54323`; seeded from `supabase/seed.sql` | Clerk dev instance | `supabase db reset` |
| Staging | Vercel preview deployments (inferred) | Supabase cloud, shared dev project | Clerk dev instance | `supabase link` then `supabase db push`, by hand |
| Prod | Vercel production, apex + wildcard subdomains (inferred) | Supabase cloud, prod project | Clerk prod instance | `supabase link` then `supabase db push`, by hand |

See [`DATABASE_MIGRATIONS.md`](./DATABASE_MIGRATIONS.md) for the full migration workflow.

## Release flow

```mermaid
flowchart LR
  subgraph Code["App code"]
    PR[PR] --> Preview[Vercel preview URL] --> Merge[merge to main] --> Prod[Vercel production build]
  end
  subgraph Schema["Database schema"]
    Mig[migration file] --> Reset[db reset, local] --> Stg[db push, staging] --> PProd[db push, prod]
  end
  subgraph Secrets["Config and secrets"]
    Vault[team vault] --> Env[.env, local]
    Vault --> VEnv[Vercel env vars]
  end
```

- App code deploys through Vercel's Git integration. There is no `.github/workflows`, so lint,
  tests, and type checks run only when someone runs them locally.
- Migrations, the `embed` Edge Function, and the `app.embed_fn_url` / `app.edge_fn_token` DB
  settings are deployed separately with the Supabase CLI or dashboard.
- The two pipelines are not coordinated. See finding F-2 in
  [`DEPLOYMENT_FINDINGS.md`](./DEPLOYMENT_FINDINGS.md).

## Environment variables

Names only. Values live in the team vault and in Vercel project settings.

| Group | Variables |
| --- | --- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` |
| Email | `RESEND_API_KEY` |
| AI | `GEMINI_API_KEY`, `GROQ_API_KEY` |
| Resume parsing | `AFFINDA_API_KEY`, `AFFINDA_WORKSPACE_ID`, `AFFINDA_DOCUMENT_TYPE_ID` |
| Analytics | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_PROJECT_ID`, `POSTHOG_PERSONAL_API_KEY` |
| Referrals | `FIRSTPROMOTER_API_KEY`, `NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID` |
| App | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_PRODUCTION_URL`, `NEXT_PUBLIC_MAMUN_ACCESS_CODE`, `ADMIN_EMAILS`, `CRON_SECRET` |
| Edge Function (Supabase-managed) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
