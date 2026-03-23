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
  workExperienceOrganization?: string;
  workExperienceDateRange?: string;
};

type AffindaEducation = {
  educationAccreditation?: string;
  educationOrganization?: string;
  educationDateRange?: string;
};

type AffindaWebsite = {
  websiteType?: string;
  websiteUrl?: string;
};

type AffindaLocation = {
  city?: string;
  state?: string;
  country?: string;
};

type AffindaResumeData = {
  candidateName?: {
    candidateNameFirst?: string;
    candidateNameFamily?: string;
  };
  workExperience?: AffindaWorkExperience[];
  education?: AffindaEducation[];
  location?: AffindaLocation | null;
  summary?: string | Record<string, unknown> | null;
  objective?: string | Record<string, unknown> | null;
  website?: AffindaWebsite[] | null;
  achievement?: string[] | null;
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

function mapAffindaToFields(data: AffindaResumeData): Partial<OnboardingData> {
  const mapped: Partial<OnboardingData> = {};

  if (data.candidateName?.candidateNameFirst) {
    mapped.firstName = data.candidateName.candidateNameFirst;
  }
  if (data.candidateName?.candidateNameFamily) {
    mapped.lastName = data.candidateName.candidateNameFamily;
  }

  // Most recent job title
  if (data.workExperience?.length) {
    const latest = data.workExperience[0];
    if (latest.jobTitle) mapped.title = latest.jobTitle;
  }

  if (data.location) {
    if (data.location.city) mapped.city = data.location.city;
    if (data.location.country) mapped.country = data.location.country;
    if (data.location.state) mapped.state = data.location.state;
  }

  if (data.education?.length) {
    mapped.education = data.education
      .map((e) => {
        const parts = [
          e.educationAccreditation,
          e.educationOrganization,
          e.educationDateRange,
        ].filter(Boolean);
        return parts.join(" – ");
      })
      .filter(Boolean)
      .join("\n");
  }

  if (data.workExperience?.length) {
    mapped.experience = data.workExperience
      .map((w) => {
        const org = w.workExperienceOrganization
          ? ` at ${w.workExperienceOrganization}`
          : "";
        const dates = w.workExperienceDateRange
          ? ` (${w.workExperienceDateRange})`
          : "";
        return `${w.jobTitle ?? ""}${org}${dates}`.trim();
      })
      .filter(Boolean)
      .join("\n");
  }

  // summary first, fall back to objective
  const intro = extractText(data.summary) || extractText(data.objective);
  if (intro) mapped.personalIntro = intro;

  if (data.website?.length) {
    for (const site of data.website) {
      const type = (site.websiteType ?? "").toLowerCase();
      const url = site.websiteUrl ?? "";
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

  if (data.achievement?.length) {
    mapped.accomplishments = data.achievement.join("\n");
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
    const data = mapAffindaToFields(
      (affindaJson.data ?? {}) as AffindaResumeData,
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in parse-resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
