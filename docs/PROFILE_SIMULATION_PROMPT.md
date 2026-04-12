# Profile Simulation Prompt for Algorithm Testing

Use this prompt with an LLM (Claude, ChatGPT, etc.) to generate simulated user profiles for testing the co-founder matching algorithm. The output is valid JSON that can be pasted into the match preview page or used in unit tests. No database writes—JSON simulation only.

## Prompt (copy below)

```
You are generating simulated user profiles for testing a co-founder matching algorithm. Output valid JSON arrays of profile objects.

## Profile Schema (OnboardingData format)

Each profile must include these required fields. Use the exact types and enums shown.

**Identity:**
- user_id: string (unique, e.g. "sim_user_001")
- firstName: string
- lastName: string
- title: string (e.g. "Software Engineer", "Product Manager")
- city: string
- country: string
- state?: string (optional)

**Status:**
- satisfaction: "Happy" | "Content" | "Browsing"
- batteryLevel: "Energized" | "Content" | "Burnt out"

**Technical & Bio:**
- isTechnical: "yes" | "no"
- personalIntro: string (1-2 sentences)
- accomplishments?: string (optional)
- archetype: "the_scaler" | "the_steward" | "the_architect"
- education: string
- experience: string
- interests?: string (optional)
- hobbies?: string (optional)

**Matching preferences (what this user is looking for):**
- lookingFor: "technical" | "non-technical" | "either"
- preferredLocation: "same-city" | "same-country" | "remote"

**Startup:**
- hasStartup: "yes" | "no"
- startupName?: string (if hasStartup is "yes")
- startupDescription?: string
- startupTimeSpent?: string
- startupFunding?: string (e.g. "Pre-seed", "Seed", "Bootstrapped")
- coFounderStatus?: string
- fullTimeTimeline?: string
- responsibilities?: string[] — choose from: ["Ops", "Sales", "Design", "Engineering", "Product"]
- equityExpectation?: number (0-100)

**Priority areas (used for matching score):**
- priorityAreas: string[] — choose from: ["Emerging Tech", "AI", "Healthcare", "Fintech", "Circular Economy", "Climate", "Education", "Consumer"] or add custom strings

**Socials (can be placeholder):**
- linkedin: string
- twitter: string
- git: string
- personalWebsite: string

**Hiring:**
- isHiring: boolean
- hiringEmail?: string

## Test Scenarios to Generate

1. **Location matrix:** Pairs with same-city, same-country-but-different-city, different-country. Cities: London, Manchester, New York, Toronto, Istanbul, Berlin.

2. **Technical preference:** Mix of isTechnical "yes"/"no" and lookingFor "technical"/"non-technical"/"either".

3. **Priority area overlap:** Profile A with ["AI", "Healthcare", "Fintech"], B with ["AI", "Healthcare", "Climate"] (high overlap), C with ["Education", "Consumer"] (no overlap), D with partial overlap (~40%) for 0.3-0.7 diversity band.

4. **Complementarity:** Technical + non-technical with different responsibilities (Engineering vs Sales).

5. **Edge cases:** Empty optional fields; hasStartup "no" vs "yes" pairs.

## Output Format

Return a JSON array only. No markdown, no explanation.
```

## Usage

1. **Match Preview UI:** Go to `/admin/match-preview`, paste a JSON array (first profile = current user perspective, rest = candidates), click Preview. No DB writes.
2. **Unit Tests:** Copy profiles into `src/features/matching/__fixtures__/profiles.ts` or a new fixture file.
3. **External Algorithm:** Map the JSON to your algorithm's input format; scenarios apply regardless of implementation.

## Adapting for Different Algorithms

If your algorithm uses different fields, replace the schema section with your fields and scenarios. The methodology is: define schema + scenarios → generate → test.
