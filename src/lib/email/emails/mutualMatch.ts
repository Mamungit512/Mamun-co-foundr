import { clerkClient } from "@clerk/nextjs/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { resolveOrgBranding } from "../branding";
import { sendTemplateEmail } from "../send";

type ProfileRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  city: string | null;
  state: string | null;
  organization_id: string | null;
  archetype: string | null;
  is_technical: boolean | null;
  personal_intro: string | null;
  startup_funding: string | null;
  cofounder_status: string | null;
  startup_time_spent: string | null;
  priority_areas: string[] | null;
};

type SchoolProfileRow = {
  school_status: string | null;
  graduation_year: number | null;
  college: string | null;
  degree_type: string | null;
  major: string | null;
};

function initials(first: string | null, last: string | null) {
  return `${(first?.[0] ?? "").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`;
}

function schoolStatusLabel(s: SchoolProfileRow | null): string {
  if (!s) return "";
  const status = s.school_status === "alumni" ? "Alumni" : "Student";
  const degree = (() => {
    if (!s.degree_type) return "";
    if (s.degree_type === "masters" && s.major?.toLowerCase().includes("business")) return "MBA";
    if (s.degree_type === "bachelors") return "Bachelors";
    if (s.degree_type === "masters") return "Masters";
    if (s.degree_type === "professional") return s.major ?? "Professional";
    return s.degree_type;
  })();
  const year = s.graduation_year ?? "";
  return [status, [degree, year].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
}

function archetypeLabel(p: ProfileRow): string {
  return p.is_technical ? "Technical founder" : "Non-technical founder";
}

export async function sendMutualMatchEmails({
  supabase,
  orgId,
  userAId,
  userBId,
}: {
  supabase: SupabaseClient;
  orgId: string;
  userAId: string;
  userBId: string;
}): Promise<void> {
  const { data: org } = await supabase
    .from("organizations")
    .select("slug, name")
    .eq("id", orgId)
    .single();

  const orgSlug = org?.slug ?? null;
  const { wordmark } = resolveOrgBranding(orgSlug, org?.name ?? undefined);

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "user_id, first_name, last_name, title, city, state, organization_id, archetype, is_technical, personal_intro, startup_funding, cofounder_status, startup_time_spent, priority_areas",
    )
    .in("user_id", [userAId, userBId]);

  const { data: schoolProfiles } = await supabase
    .from("school_profiles")
    .select("user_id, school_status, graduation_year, college, degree_type, major")
    .in("user_id", [userAId, userBId]);

  const profileMap = new Map<string, ProfileRow>(
    (profiles ?? []).map((p) => [p.user_id, p as ProfileRow]),
  );
  const schoolMap = new Map<string, SchoolProfileRow>(
    (schoolProfiles ?? []).map((s) => [
      (s as SchoolProfileRow & { user_id: string }).user_id,
      s as SchoolProfileRow,
    ]),
  );

  const clerk = await clerkClient();
  const [userA, userB] = await Promise.all([
    clerk.users.getUser(userAId),
    clerk.users.getUser(userBId),
  ]);
  const emailMap = new Map<string, string | undefined>([
    [userAId, userA.emailAddresses[0]?.emailAddress],
    [userBId, userB.emailAddresses[0]?.emailAddress],
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mamuncofoundr.com";

  const buildAndSend = async (recipientId: string, matchedId: string) => {
    const recipientProfile = profileMap.get(recipientId);
    const matchedProfile = profileMap.get(matchedId);
    const matchedSchool = schoolMap.get(matchedId) ?? null;
    const recipientEmail = emailMap.get(recipientId);

    if (!recipientEmail || !recipientProfile || !matchedProfile) {
      console.warn("[mutual-match] missing data, skipping send", { recipientId, matchedId });
      return;
    }

    const { primaryColor } = resolveOrgBranding(orgSlug);

    await sendTemplateEmail({
      type: "mutualMatch",
      to: recipientEmail,
      orgSlug,
      variables: {
        primaryColor,
        wordmark,
        schoolPill: wordmark,
        recipientName: `${recipientProfile.first_name ?? ""} ${recipientProfile.last_name ?? ""}`.trim(),
        matchedName: `${matchedProfile.first_name ?? ""} ${matchedProfile.last_name ?? ""}`.trim(),
        matchedInitials: initials(matchedProfile.first_name, matchedProfile.last_name),
        matchedTitle: matchedProfile.title ?? "",
        matchedCity: matchedProfile.city ?? "",
        matchedState: matchedProfile.state ?? "",
        schoolStatusLabel: schoolStatusLabel(matchedSchool),
        archetypeLabel: archetypeLabel(matchedProfile),
        stageLabel: matchedProfile.startup_funding ?? "",
        bio: matchedProfile.personal_intro ?? "",
        interestsCsv: (matchedProfile.priority_areas ?? []).join(", "),
        lookingFor: matchedProfile.cofounder_status ?? "",
        commitment: matchedProfile.startup_time_spent ?? "",
        collegeLabel: matchedSchool?.college ?? "",
        degreeLabel: matchedSchool?.degree_type ?? "",
        major: matchedSchool?.major ?? "",
        messageUrl: `${appUrl}/messages?startWith=${matchedId}`,
      },
    });
  };

  await Promise.all([
    buildAndSend(userAId, userBId),
    buildAndSend(userBId, userAId),
  ]).catch((err) => {
    console.error("[mutual-match] send error:", err);
  });
}
