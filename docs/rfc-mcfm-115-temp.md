# RFC: MCFM-115 — UT Dashboard Filters, Meetup Flow & Branding Refresh

**Branch:** `MCFM-115`  
**Base:** `main` (includes MCFM-114)  
**Status:** Ready for review  
**Diff:** 29 files changed, +1,015 / −148 lines  

---

## 1. Motivation

The UT Austin school portal is live, but three gaps remain before it feels complete for students:

1. **Discovery is too broad** — the swipe dashboard surfaces every verified UT user with no way to narrow by school, industry, graduation year, or co-founder intent.
2. **Meetup is invisible after a match** — mutual We Match users have no in-app guidance toward scheduling an in-person UT meetup via Luma.
3. **Branding is McCombs-centric** — copy, footer, and contact links still reference Texas McCombs rather than the university-wide program, and the landing page omits meetup as a step in the journey.

This PR addresses all three: dashboard filtering with persisted intent, meetup surfacing on mutual match, a dedicated contact page, and UT-wide copy updates.

---

## 2. Summary of Changes

| Area | What changed |
|---|---|
| **Dashboard filters** | Sidebar (desktop) + drawer (mobile) for college, sector, grad year, and intent; filter chips; empty state when no results |
| **Intent data model** | New `school_profiles.intent` column; collected at onboarding; backfilled from existing `cofounder_status` |
| **Meetup UX** | `MeetupCard` on We Match tab and in 1:1 conversations when both users have mutually matched (UT only) |
| **Landing page** | "How It Works" expanded to 4 steps (adds Meetup); McCombs → UT Austin copy; tier headers removed from department mosaic |
| **Contact** | New `/school/ut/contact-us` page with two tabs: platform support (Mamun) vs UT inquiries (McCombs) |
| **Copy refresh** | "Co-found" → "work with" in We Match messaging; header wordmark simplified |

---

## 3. Architecture — Dashboard Filtering

```
┌─────────────────┐   sessionStorage    ┌──────────────────────┐
│  FilterSidebar   │ ◀────────────────▶ │  dashboardFilters.ts  │
│  (sidebar/drawer)│                     │  load / save / build  │
└────────┬────────┘                     └──────────┬───────────┘
         │ onChange(filters)                        │ buildProfilesQueryString()
         ▼                                          ▼
┌─────────────────┐   ?college=&sectors=&   ┌──────────────────────┐
│  dashboard/page  │ ──gradYear=&intent=──▶  │  GET /api/profiles    │
└─────────────────┘                         └──────────┬───────────┘
                                                     │
                                          ┌──────────▼───────────┐
                                          │  school_profiles      │
                                          │  (pre-filter user_ids)│
                                          └──────────────────────┘
```

### Filter dimensions

| Filter | Query param | DB column | Notes |
|---|---|---|---|
| School department | `college` | `school_profiles.college` | Exact match on UT college key |
| Industry / interest | `sectors` (comma-separated) | `school_profiles.sector_interests` | PostgreSQL `overlaps` — any selected sector matches |
| Graduation year | `gradYear` | `school_profiles.graduation_year` | Exact match |
| Intent | `intent` | `school_profiles.intent` | Includes profiles with `no_preference` in results |

### Intent filter semantics

When filtering for `join_me` or `seeking_to_join`, the API returns users whose intent is **either the selected value or `no_preference`**. Users with the opposite explicit intent are excluded. This keeps open-minded users discoverable without forcing a binary choice at filter time.

### Client persistence

Filters are stored in `sessionStorage` under `school-dashboard-filters` so they survive page refreshes within a session but reset on new browser sessions.

---

## 4. Database Changes

### Migration: `20260528000001_add_intent_to_school_profiles.sql`

```sql
ALTER TABLE school_profiles
  ADD COLUMN intent text
  CHECK (intent IN ('join_me', 'seeking_to_join', 'no_preference'));

CREATE INDEX idx_school_profiles_intent ON school_profiles (organization_id, intent);
```

**Backfill logic:**

| `profiles.cofounder_status` | → `intent` |
|---|---|
| `Solo founder`, `Have co-founder(s)` | `join_me` |
| `Seeking co-founder` | `seeking_to_join` |
| anything else / NULL | `no_preference` |

---

## 5. API Changes

### `GET /api/profiles`

Accepts optional query params: `college`, `sectors`, `gradYear`, `intent`.

In school tenants, filtering runs against `school_profiles` **before** the matching queue query, narrowing `schoolUserIds` to eligible candidates. Response payloads now include `intent` on each profile's school metadata.

### `POST /api/ut-profile`

School profile upsert refactored to use `mapUTDataToSchoolProfileRow()`, which now persists `intent` from onboarding data.

---

## 6. Onboarding Changes

**`UTStartupForm`** — new required field: **Co-Founder Matching Intent**

- **Join me** — I have a startup/idea  
- **Seeking to join** — I want to join someone else's project  
- **No preference** — open to either  

**`UTReviewForm`** — displays selected intent on the review step before submission.

Types updated in `global.d.ts` (`SchoolProfileFromDb`, `UTProfileData`).

---

## 7. UI Changes

### Dashboard (`/school/[slug]/dashboard`)

- Desktop: fixed-width filter sidebar aligned to profile card height  
- Mobile: filter icon opens animated drawer overlay  
- Active filter chips with per-chip remove  
- Empty state: "No matches for these filters" with clear-all action  

### Meetup (`MeetupCard`)

Rendered when `slug === "ut"`:

- **We Match tab** — always visible at top of tab content  
- **Conversation view** — shown when the other participant is in the user's `mutualNotified` set  

Links to [Luma events](https://luma.com/mamun?period=past) for RSVP scheduling.

### Contact page (`/school/ut/contact-us`)

| Tab | Purpose | CTA |
|---|---|---|
| Platform support | Mamun account/matching help | Calendly + `mamun@mamuncofoundr.com` |
| UT inquiries | School/program questions | McCombs contact page |

Header and footer "Contact Us" links now route to this page instead of external McCombs URL.

### Landing page

- Hero, footer, and header wordmark: McCombs → **University of Texas at Austin**  
- Footer title styled in UT burnt orange (`#bf5700`)  
- `HowItWorks`: 3 steps → **4 steps** (Build profile → Get matched → **Meetup** → Start building)  
- `DepartmentMosaic`: tier 1 / tier 2 section headers removed  

### Copy tone

We Match messaging softened from "co-found" to **"work with"** to reflect broader collaboration intent (project partners, not only co-founders).

---

## 8. Files Changed (by area)

| Area | Key files |
|---|---|
| Filtering | `FilterSidebar.tsx`, `dashboardFilters.ts`, `dashboard/page.tsx`, `useProfile.ts`, `profiles/route.ts` |
| Intent | `20260528000001_add_intent_to_school_profiles.sql`, `UTStartupForm.tsx`, `UTReviewForm.tsx`, `mapProfileToFromDBFormat.ts`, `global.d.ts` |
| Meetup | `MeetupCard.tsx`, `matches/page.tsx`, `matches/[conversationId]/page.tsx`, `HowItWorks.tsx` |
| Contact | `contact-us/page.tsx`, `UtContactTabs.tsx`, `UtSupportPanel.tsx`, `UtAboutPanel.tsx`, `SchoolHeader.tsx`, `PublicFooter.tsx` |
| Branding | `Hero.tsx`, `CtaBand.tsx`, `ValuesPillars.tsx`, `DepartmentMosaic.tsx`, `PublicSchoolHeader.tsx`, `SchoolSignIn.tsx`, `SchoolSignUp.tsx` |

---

## 9. Test Plan

- [ ] Run migration locally; confirm existing profiles backfill to expected intent values  
- [ ] Complete UT onboarding; verify intent is required and persisted to `school_profiles`  
- [ ] Dashboard: apply each filter individually and in combination; confirm swipe queue updates  
- [ ] Dashboard: confirm filter chips render and remove correctly  
- [ ] Dashboard: confirm filters persist across page refresh (same session)  
- [ ] Dashboard: confirm empty state when filters exclude all candidates  
- [ ] Mobile: open/close filter drawer; confirm body scroll lock  
- [ ] We Match tab: confirm `MeetupCard` renders for UT slug  
- [ ] Conversation: confirm `MeetupCard` appears only after mutual We Match  
- [ ] Visit `/school/ut/contact-us`; switch tabs; verify Calendly and McCombs links  
- [ ] Landing page: verify 4-step How It Works and updated hero/footer copy  
- [ ] Header/footer Contact Us links route to internal contact page  

---

## 10. Rollout Notes

- **Migration required** before deploy — `intent` column must exist before onboarding writes or dashboard filters run.  
- **No breaking API changes** — filter query params are optional; unfiltered behavior is unchanged.  
- **Meetup is UT-only** — gated on `slug === "ut"`; other school tenants are unaffected.  
- **Intent filter is inclusive of `no_preference`** — existing users without explicit intent (backfilled or default) remain visible in both intent filter modes.
