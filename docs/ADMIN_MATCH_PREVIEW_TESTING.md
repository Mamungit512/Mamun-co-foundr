# Admin Match Preview — Integration Testing Guide

> Manual end-to-end workflow for testing the matching algorithm with custom JSON data. A video walkthrough accompanies this guide.

## Overview

Use the Match Preview UI to run the matching algorithm on JSON profiles without any database writes. Ideal for validating sorting behavior with new fixture data and testing algorithm changes before deploying.

---

## Switching to a New Algorithm

1. **Add your new algorithm** in `src/features/matching/` — e.g. `matchingServiceV2.ts` or `newAlgorithm.ts`. It should export a `sortProfiles` function with the same signature as the current one: `(currentUser: OnboardingData, candidates: OnboardingData[]) => OnboardingData[]`.

2. **Update the import** in `src/app/api/admin/match-preview/route.ts` on **line 4**:

   **Current (default):**
   ```ts
   import { sortProfiles } from "@/features/matching/matchingService";
   ```

   **After (using your new algorithm):**
   ```ts
   import { sortProfiles } from "@/features/matching/matchingServiceV2";
   ```

3. Use the Match Preview UI below to test with your JSON fixtures. No other changes are needed — the API route delegates to whichever algorithm you import.

---

## Prerequisites

- Logged in as a user with `is_admin: true` in the `profiles` table
- Dev server running: `npm run dev`
- Environment variables set: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, Clerk keys

---

## Steps

### 1. Add Your JSON File

Create a `.json` or `.jsonl` file with your test profiles and place it in the project, for example:

```
src/app/admin/match-preview/fixtures/my-test-profiles.json
```

**Format:** An array of profile objects. The first profile = current user perspective; the rest = candidates to be sorted.

```json
[
  {
    "user_id": "current_user_001",
    "firstName": "Alex",
    "lastName": "Khan",
    "city": "London",
    "country": "United Kingdom",
    "isTechnical": "yes",
    "lookingFor": "non-technical",
    "preferredLocation": "same-country",
    "priorityAreas": ["AI", "Healthcare"],
    "...": "see OnboardingData type for full shape"
  },
  {
    "user_id": "candidate_001",
    "firstName": "Sarah",
    "..."
  }
]
```

See `docs/PROFILE_SIMULATION_PROMPT.md` for how to generate more profiles via LLM.

---

### 2. Update the Import in the Page

Open `src/app/admin/match-preview/page.tsx` and change `loadFixture` to use your file.

**Before** (inline JSON):

```ts
const loadFixture = () => {
  setJsonInput(
    JSON.stringify(
      [
        { user_id: "current_user_001", firstName: "Alex", ... },
        { user_id: "sim_user_002", ... },
        ...
      ],
      null,
      2,
    ),
  );
  setPreviewResult(null);
};
```

**After** (import from your file):

```ts
import myTestProfiles from "./fixtures/my-test-profiles.json";

// ...

const loadFixture = () => {
  setJsonInput(JSON.stringify(myTestProfiles, null, 2));
  setPreviewResult(null);
};
```

> **Note:** If using `.jsonl`, parse each line as JSON and combine into an array before stringifying.

---

### 3. Run the App and Open Match Preview

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000/admin/match-preview`
3. Log in as an admin user if prompted

---

### 4. Load and Preview

1. Click **"Load sample"** to populate the textarea with your fixture (or paste JSON manually)
2. Click **"Preview"**
3. Review the sorted list below — ranked by relevance (1 = best match)

---

### 5. Verify Output

Check that:

- The list excludes the current user
- Candidates are ordered by relevance (e.g. same-city non-technical before same-country when `lookingFor` is `"non-technical"`)
- Filtering matches preferences (`lookingFor`, `preferredLocation`)

Adjust your fixture or the matching logic in `src/features/matching/` as needed.

---

## File References

| File | Purpose |
|------|---------|
| `src/features/matching/` | Add new algorithm files here (e.g. `matchingServiceV2.ts`) |
| `src/app/api/admin/match-preview/route.ts` | Line 4: change import to point at your new algorithm |
| `src/app/admin/match-preview/page.tsx` | Page UI; update `loadFixture` to import your JSON |
| `src/app/admin/match-preview/fixtures/` | Suggested location for test JSON files (create if needed) |
| `src/features/matching/matchingService.ts` | Current/default sorting logic |
| `docs/PROFILE_SIMULATION_PROMPT.md` | Prompt for generating profile JSON via LLM |

---

## Troubleshooting

- **Access denied** — Ensure your user has `is_admin: true` in the `profiles` table
- **Preview failed** — Body must be `{ currentUser, candidates }`; ensure JSON has 2+ profiles
- **Invalid JSON** — Validate your JSON (e.g. with `jq` or a JSON validator) before pasting
