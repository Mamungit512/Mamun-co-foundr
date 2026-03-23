import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/** In-memory rate limit: 3 parses per user per 24 hours. Resets on server restart. */
const PARSE_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  userId: string,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimit.get(userId);
  if (!entry) return { allowed: true };
  const { count, resetAt } = entry;
  if (now >= resetAt) {
    rateLimit.delete(userId);
    return { allowed: true };
  }
  if (count >= PARSE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function incrementRateLimit(userId: string): void {
  const now = Date.now();
  const entry = rateLimit.get(userId);
  if (!entry || now >= entry.resetAt) {
    rateLimit.set(userId, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

type AffindaWorkExperience = {
  jobTitle?: string;
  job_title?: string;
  workExperienceJobTitle?: string;
  work_experience_job_title?: string;
  workExperienceOrganization?: string;
  work_experience_organization?: string;
  workExperienceDateRange?: string;
  work_experience_date_range?: string;
  workExperienceDates?: unknown;
  organization?: string;
  dates?: string;
};

type AffindaEducation = {
  educationAccreditation?: string;
  education_accreditation?: string;
  educationOrganization?: string;
  education_organization?: string;
  educationDateRange?: string;
  education_date_range?: string;
  accreditation?: string;
  organization?: string;
  dateRange?: string;
};

type AffindaWebsite = {
  websiteType?: string;
  website_type?: string;
  websiteUrl?: string;
  website_url?: string;
  url?: string;
  type?: string;
};

type AffindaLocation = {
  city?: string;
  state?: string;
  country?: string;
};

type AffindaName = {
  candidateNameFirst?: string;
  candidate_name_first?: string;
  firstName?: string;
  first_name?: string;
  first?: string;
  givenName?: string;
  candidateNameFamily?: string;
  candidate_name_family?: string;
  familyName?: string;
  family_name?: string;
  family?: string;
  last?: string;
};

type AffindaResumeData = {
  candidateName?: AffindaName;
  candidate_name?: AffindaName;
  name?: AffindaName;
  workExperience?: AffindaWorkExperience[];
  work_experience?: AffindaWorkExperience[];
  education?: AffindaEducation[];
  location?: AffindaLocation | null;
  summary?: string | Record<string, unknown> | null;
  objective?: string | Record<string, unknown> | null;
  website?: AffindaWebsite[] | null;
  websites?: AffindaWebsite[] | null;
  achievement?: string[] | null;
  achievements?: string[] | null;
};

function extractText(
  field: string | Record<string, unknown> | null | undefined,
): string {
  if (!field) return "";
  if (typeof field === "string") return field.trim();
  if (
    typeof field === "object" &&
    "parsed" in field &&
    typeof field.parsed === "string"
  ) {
    return (field.parsed as string).trim();
  }
  return "";
}

/** Get first non-empty string from multiple possible keys (camelCase + snake_case) */
function firstOf<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  ...keys: (keyof T)[]
): string {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function mapAffindaToFields(data: AffindaResumeData): Partial<OnboardingData> {
  const mapped: Partial<OnboardingData> = {};

  const name =
    data.candidateName ?? data.candidate_name ?? data.name;
  if (name) {
    const first = firstOf(
      name,
      "firstName",
      "first_name",
      "candidateNameFirst",
      "candidate_name_first",
      "first",
      "givenName",
    );
    const last = firstOf(
      name,
      "familyName",
      "family_name",
      "candidateNameFamily",
      "candidate_name_family",
      "family",
      "last",
    );
    if (first) mapped.firstName = first;
    if (last) mapped.lastName = last;
  }

  const workExp =
    data.workExperience ?? data.work_experience ?? [];
  if (workExp?.length) {
    const latest = workExp[0];
    const title = firstOf(
      latest,
      "workExperienceJobTitle",
      "work_experience_job_title",
      "jobTitle",
      "job_title",
    );
    if (title) mapped.title = title;
  }

  if (data.location) {
    if (data.location.city) mapped.city = data.location.city;
    if (data.location.country) mapped.country = data.location.country;
    if (data.location.state) mapped.state = data.location.state;
  }

  if (data.education?.length) {
    mapped.education = data.education
      .map((e) => {
        const accred = firstOf(
          e,
          "educationAccreditation",
          "education_accreditation",
          "accreditation",
        );
        const org = firstOf(
          e,
          "educationOrganization",
          "education_organization",
          "organization",
        );
        const range = firstOf(
          e,
          "educationDateRange",
          "education_date_range",
          "dateRange",
        );
        const parts = [accred, org, range].filter(Boolean);
        return parts.join(" – ");
      })
      .filter(Boolean)
      .join("\n");
  }

  if (workExp?.length) {
    mapped.experience = workExp
      .map((w) => {
        const title = firstOf(
          w,
          "workExperienceJobTitle",
          "work_experience_job_title",
          "jobTitle",
          "job_title",
        );
        const org = firstOf(
          w,
          "workExperienceOrganization",
          "work_experience_organization",
          "organization",
        );
        const dates = firstOf(
          w,
          "workExperienceDateRange",
          "work_experience_date_range",
          "dates",
        );
        const orgStr = org ? ` at ${org}` : "";
        const datesStr = dates ? ` (${dates})` : "";
        return `${title}${orgStr}${datesStr}`.trim();
      })
      .filter(Boolean)
      .join("\n");
  }

  // summary first, fall back to objective
  const intro = extractText(data.summary) || extractText(data.objective);
  if (intro) mapped.personalIntro = intro;

  const sites = data.website ?? data.websites ?? [];
  if (sites?.length) {
    for (const site of sites) {
      const type = (
        firstOf(site, "websiteType", "website_type", "type")
      ).toLowerCase();
      const url = firstOf(site, "websiteUrl", "website_url", "url");
      if (!url) continue;
      if (type.includes("linkedin") && !mapped.linkedin) {
        mapped.linkedin = url;
      } else if (
        (type.includes("github") || type.includes("gitlab")) &&
        !mapped.git
      ) {
        mapped.git = url;
      } else if (!mapped.personalWebsite) {
        mapped.personalWebsite = url;
      }
    }
  }

  const achievements = data.achievement ?? data.achievements ?? [];
  if (achievements?.length) {
    mapped.accomplishments = achievements.join("\n");
  }

  return mapped;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed, retryAfter } = checkRateLimit(userId);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Resume parsing limit reached. You can try again later or fill in your details manually.",
        },
        {
          status: 429,
          headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
        },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Affinda's limit for resumes is 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    incrementRateLimit(userId);

    const affindaForm = new FormData();
    affindaForm.append("file", file);
    affindaForm.append("workspace", process.env.AFFINDA_WORKSPACE_ID!);
    affindaForm.append("documentType", process.env.AFFINDA_DOCUMENT_TYPE_ID!);
    affindaForm.append("compact", "true");
    affindaForm.append("deleteAfterParse", "true");
    affindaForm.append("wait", "true");

    const affindaRes = await fetch("https://api.us1.affinda.com/v3/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AFFINDA_API_KEY}`,
      },
      body: affindaForm,
    });

    if (!affindaRes.ok) {
      const errText = await affindaRes.text();
      console.error("Affinda error:", errText);
      return NextResponse.json(
        {
          error: "Resume parsing failed. Please fill in your details manually.",
        },
        { status: 502 },
      );
    }

    const affindaJson = await affindaRes.json();
    // Affinda returns { data, extractor, meta }; resume data is in data
    const rawData: AffindaResumeData =
      affindaJson.data ??
      (affindaJson.candidateName ||
      affindaJson.workExperience ||
      affindaJson.education
        ? affindaJson
        : {});
    const mapped = mapAffindaToFields(rawData);

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error("Error in parse-resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
