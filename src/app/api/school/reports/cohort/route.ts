import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { toCsv } from "@/lib/csv";
import {
  UT_SCHOOLS_AND_PROGRAMS,
  SECTOR_INTEREST_LABELS,
} from "@/features/school/data/utSchoolsAndMajors";

const ARCHETYPE_LABELS: Record<string, string> = {
  the_scaler: "The Scaler",
  the_steward: "The Steward",
  the_architect: "The Architect",
};

type ProfileRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  archetype: string | null;
};

type SchoolProfileRow = {
  user_id: string;
  school_status: string | null;
  graduation_year: number | null;
  college: string | null;
  major: string | null;
  sector_interests: string[] | null;
};

function schoolLabel(college: string | null): string {
  if (!college) return "—";
  const entry = (
    UT_SCHOOLS_AND_PROGRAMS as Record<string, { label: string } | undefined>
  )[college];
  return entry?.label ?? college;
}

function sectorLabels(sectors: string[] | null): string {
  if (!sectors || sectors.length === 0) return "—";
  const labels = SECTOR_INTEREST_LABELS as Record<string, string | undefined>;
  return sectors.map((s) => labels[s] ?? s).join("; ");
}

function titleCase(value: string | null): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Active cohort report (CSV) — full snapshot of the current org cohort.
 * Org-admin only. Scoped to the caller's organization. Excludes soft-deleted users.
 */
export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  const { orgId } = auth;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, archetype")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json(
      { error: "Failed to fetch cohort" },
      { status: 500 },
    );
  }

  const orgProfiles = (profiles ?? []) as ProfileRow[];
  const orgUserIds = orgProfiles.map((p) => p.user_id);

  // School-specific structured fields
  const schoolByUser = new Map<string, SchoolProfileRow>();
  if (orgUserIds.length > 0) {
    const { data: schoolProfiles } = await supabase
      .from("school_profiles")
      .select(
        "user_id, school_status, graduation_year, college, major, sector_interests",
      )
      .in("user_id", orgUserIds);
    for (const row of (schoolProfiles ?? []) as SchoolProfileRow[]) {
      schoolByUser.set(row.user_id, row);
    }
  }

  // Email lives only in Clerk — batch fetch
  const emailByUser = new Map<string, string>();
  if (orgUserIds.length > 0) {
    try {
      const client = await clerkClient();
      const { data: users } = await client.users.getUserList({
        userId: orgUserIds,
        limit: orgUserIds.length,
      });
      for (const u of users) {
        const primary = u.emailAddresses.find(
          (e) => e.id === u.primaryEmailAddressId,
        );
        if (primary) emailByUser.set(u.id, primary.emailAddress);
      }
    } catch (err) {
      console.error("[cohort report] Clerk email lookup failed:", err);
    }
  }

  const header = [
    "First name",
    "Last name",
    "Email",
    "School",
    "Founder archetype",
    "Graduation year",
    "Industry / Interest",
    "Major",
    "Student or Alumni",
  ];

  const rows: (string | number | null)[][] = orgProfiles.map((p) => {
    const sp = schoolByUser.get(p.user_id);
    return [
      p.first_name ?? "",
      p.last_name ?? "",
      emailByUser.get(p.user_id) ?? "—",
      schoolLabel(sp?.college ?? null),
      p.archetype ? (ARCHETYPE_LABELS[p.archetype] ?? p.archetype) : "—",
      sp?.graduation_year ?? "—",
      sectorLabels(sp?.sector_interests ?? null),
      sp?.major ?? "—",
      titleCase(sp?.school_status ?? null),
    ];
  });

  const csv = toCsv([header, ...rows]);
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ut-cohort-${date}.csv"`,
    },
  });
}
