# Database & Migrations Guide

How we manage the Supabase Postgres database across **local**, **staging**, and **prod**.

> **Golden rule:** schema changes happen through **migration files in git** — never by
> hand-editing tables in the Supabase dashboard / SQL editor. The dashboard is fine for
> *reading* data and ad‑hoc queries, but any change to the schema (tables, columns,
> indexes, functions, RLS policies) must be a committed migration so every environment
> and every engineer stays in sync.

---

## Environments

| Env         | Where it runs               | Project ref            | How you target it             |
| ----------- | --------------------------- | ---------------------- | ----------------------------- |
| **local**   | Docker on your machine      | — (local stack)        | `supabase start` + `db reset` |
| **staging** | Supabase cloud (shared dev) | `<STAGING_REF>`        | `supabase link` → `db push`   |
| **prod**    | Supabase cloud (live)       | `<PROD_REF>`           | `supabase link` → `db push`   |

**Finding a project ref:** it's the subdomain of `NEXT_PUBLIC_SUPABASE_URL` in the
matching `.env` — e.g. `https://<REF>.supabase.co`. Refs are not secret, but we keep them
out of committed docs by habit. **Never** put API keys, service-role keys, or DB passwords
in this file — those live only in `.env` (gitignored, from the team vault).

Local services after `supabase start`:

| Service              | URL                                                       |
| -------------------- | --------------------------------------------------------- |
| Studio (local GUI)   | http://127.0.0.1:54323                                     |
| Postgres             | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| API                  | http://127.0.0.1:54321                                     |

> Migration files are the **single source of truth** for schema. Seed data
> (`supabase/seed.sql`) is **local-only** and is replayed on every `db reset` — it is
> never pushed to staging or prod.

---

## Prerequisites (install once per machine)

```bash
brew install supabase/tap/supabase   # Supabase CLI
# Docker Desktop must be installed and running
supabase login                       # opens browser; token is cached in ~/.supabase
```

You only `supabase login` **once per machine** — the token persists across terminals.
macOS may prompt for your **Mac login password** to unlock the keychain; that's expected.

---

## Part A — First-time local setup (new engineer)

Run these once after cloning the repo.

```bash
# 1. Get the env file from the team vault (1Password / shared) — it is gitignored.
#    Place it at the repo root as `.env`.

# 2. Make sure Docker Desktop is running, then start the local Supabase stack.
#    First run downloads images and can take a few minutes.
supabase start

# 3. Build the local database from migrations + seed data.
#    This replays every file in supabase/migrations/ then runs supabase/seed.sql.
supabase db reset
```

That's it — you now have a full local copy of the schema with seed data.

- Browse it at **http://127.0.0.1:54323** (local Studio) or connect any Postgres client
  (TablePlus / DBeaver / psql) to `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.
- To point the app at local, set the local API URL + the publishable key printed by
  `supabase start` in your `.env` (keep a separate `.env.local` if you prefer).

Useful day-to-day:

```bash
supabase status     # show local URLs / keys
supabase stop       # stop the local stack (data is preserved)
supabase db reset   # wipe local DB and rebuild from migrations + seed (do this after `git pull`)
```

> **After pulling new migrations from `main`, run `supabase db reset`** so your local DB
> matches the latest schema.

---

## Part B — Creating & shipping a new migration

The loop is: **write → test locally → push to staging → push to prod.**

### 1. Create the migration file

```bash
supabase migration new add_widgets_table
# creates supabase/migrations/<timestamp>_add_widgets_table.sql
```

Write your SQL in that file. Prefer idempotent, additive changes
(`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, etc.).

> Alternative: if you prototyped a change in **local** Studio, capture it as a migration
> with `supabase db diff -f add_widgets_table` instead of hand-writing the SQL. (Only do
> this against **local** — never diff against staging/prod.)

### 2. Test it locally

```bash
supabase db reset      # replays baseline + all migrations + seed against local
```

If `db reset` succeeds, your migration applies cleanly on a fresh database. Fix any
errors here before going further.

### 3. Push to staging, verify

```bash
supabase link --project-ref <STAGING_REF>   # point CLI at staging
supabase migration list                     # sanity-check what will apply
supabase db push                            # applies un-applied migrations to staging
```

Verify the change in the staging dashboard / app.

### 4. Push to prod

```bash
supabase link --project-ref <PROD_REF>      # point CLI at prod
supabase migration list                     # confirm only your new migration is pending
supabase db push                            # applies it to prod
```

### 5. Commit to git

```bash
git add supabase/migrations/
git commit -m "Add widgets table"
```

> `supabase db push` only applies migrations the target hasn't recorded yet (tracked in
> `supabase_migrations.schema_migrations`), so each file is applied exactly once per
> environment. Re-running `db push` with nothing new is a safe no-op.

---

## One-time-per-environment setup (history reconciliation)

Our schema was originally built through the dashboard, so staging and prod **already
contain all the baseline objects but have no migration history recorded**. Before the
**first** `db push` to an environment, tell it the baseline is already applied — this
writes a tracking row only and runs **no** schema SQL:

```bash
supabase link --project-ref <env-ref>
supabase migration list        # if Remote column is empty for 20260101000000_baseline_schema:
supabase migration repair --status applied 20260101000000
```

Do this **once** for staging and once for prod. After that, normal `db push` (Part B)
applies only the new migrations on top.

> Only mark the baseline `applied` on an environment that **already has** those objects
> (staging/prod built via the dashboard). On a brand-new empty project you would instead
> let `db push` actually create them.

---

## Rules & gotchas

- **Never hand-edit schema in the dashboard.** Read-only browsing and data queries are
  fine; schema changes must be migrations.
- **Never edit `20260101000000_baseline_schema.sql`.** It's a one-time snapshot of the
  original (dashboard-built) schema. All changes go in new migration files after it.
- **Migrations run in filename (timestamp) order.** `supabase migration new` handles the
  timestamp for you — don't back-date a file to before something it depends on.
- **Seeds are local-only.** `supabase/seed.sql` runs on local `db reset` and is never
  pushed. Don't put schema in it; don't put real/prod data in it.
- **Extensions.** The baseline enables `vector` (in `public`), `pgmq`, `pg_net`, and
  `pgcrypto`. Prod also has `pg_cron` / `supabase_vault` / `pg_stat_statements`, which are
  auto-provisioned by Supabase and not needed for local schema work.
- **No secrets in this doc or in git.** Project refs come from `.env`
  (`NEXT_PUBLIC_SUPABASE_URL`); API keys, service-role keys, and DB passwords come from the
  team vault via `.env` (gitignored).

---

## Command cheat sheet

```bash
# Local
supabase start                     # boot local stack
supabase stop                      # stop local stack
supabase status                    # local URLs / keys
supabase db reset                  # rebuild local from migrations + seed

# Migrations
supabase migration new <name>      # create a new migration file
supabase db diff -f <name>         # capture local Studio changes as a migration (local only)
supabase migration list            # compare local files vs linked remote

# Targeting a remote (refs from .env → NEXT_PUBLIC_SUPABASE_URL)
supabase link --project-ref <STAGING_REF>   # staging
supabase link --project-ref <PROD_REF>      # prod
supabase db push                            # apply pending migrations to the linked remote
```
