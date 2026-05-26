import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getOrgConfig } from "@/orgs/registry";

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

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toUserId } = await request.json();
    if (!toUserId) {
      return NextResponse.json({ error: "Missing toUserId" }, { status: 400 });
    }
    if (toUserId === userId) {
      return NextResponse.json(
        { error: "Cannot we-match your own profile" },
        { status: 400 },
      );
    }

    const supabase = supa();

    const { data: fromProfile, error: fromErr } = await supabase
      .from("profiles")
      .select("user_id, organization_id, first_name, last_name")
      .eq("user_id", userId)
      .single();

    if (fromErr || !fromProfile) {
      return NextResponse.json(
        { error: "Caller profile not found" },
        { status: 404 },
      );
    }
    if (!fromProfile.organization_id) {
      return NextResponse.json(
        { error: "We Match is only available for school-org users" },
        { status: 403 },
      );
    }

    const { data: toProfile, error: toErr } = await supabase
      .from("profiles")
      .select("user_id, organization_id")
      .eq("user_id", toUserId)
      .single();

    if (toErr || !toProfile) {
      return NextResponse.json(
        { error: "Target profile not found" },
        { status: 404 },
      );
    }
    if (toProfile.organization_id !== fromProfile.organization_id) {
      return NextResponse.json(
        { error: "Cross-org match not allowed" },
        { status: 403 },
      );
    }

    const orgId = fromProfile.organization_id;

    const { error: insertErr } = await supabase
      .from("match_intents")
      .upsert(
        {
          from_user_id: userId,
          to_user_id: toUserId,
          organization_id: orgId,
        },
        { onConflict: "from_user_id,to_user_id", ignoreDuplicates: true },
      );

    if (insertErr) {
      console.error("[we-match] insert error:", insertErr);
      return NextResponse.json(
        { error: "Failed to record match intent" },
        { status: 500 },
      );
    }

    const { data: mutual, error: mutualErr } = await supabase
      .from("match_intents")
      .select("id, we_match_notified_at")
      .eq("from_user_id", toUserId)
      .eq("to_user_id", userId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (mutualErr) {
      console.error("[we-match] mutual check error:", mutualErr);
      return NextResponse.json(
        { error: "Failed to check mutual" },
        { status: 500 },
      );
    }

    if (!mutual) {
      return NextResponse.json({ success: true, mutual: false });
    }

    if (mutual.we_match_notified_at) {
      return NextResponse.json({ success: true, mutual: true, alreadyNotified: true });
    }

    await sendMutualMatchEmails({
      supabase,
      orgId,
      userAId: userId,
      userBId: toUserId,
    });

    const { error: markErr } = await supabase
      .from("match_intents")
      .update({ we_match_notified_at: new Date().toISOString() })
      .eq("organization_id", orgId)
      .or(
        `and(from_user_id.eq.${userId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${userId})`,
      );

    if (markErr) {
      console.error("[we-match] mark notified error:", markErr);
    }

    return NextResponse.json({ success: true, mutual: true });
  } catch (error) {
    console.error("[we-match] unhandled:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supa();
    const { data, error } = await supabase
      .from("match_intents")
      .select("to_user_id, we_match_notified_at")
      .eq("from_user_id", userId);

    if (error) {
      console.error("[we-match GET] error:", error);
      return NextResponse.json(
        { error: "Failed to load match intents" },
        { status: 500 },
      );
    }

    const sent = data?.map((r) => r.to_user_id) ?? [];
    const mutualNotified = data
      ?.filter((r) => r.we_match_notified_at)
      .map((r) => r.to_user_id) ?? [];

    return NextResponse.json({ sent, mutualNotified });
  } catch (error) {
    console.error("[we-match GET] unhandled:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function sendMutualMatchEmails(args: {
  supabase: ReturnType<typeof supa>;
  orgId: string;
  userAId: string;
  userBId: string;
}) {
  const { supabase, orgId, userAId, userBId } = args;

  if (!process.env.RESEND_API_KEY) {
    console.warn("[we-match] RESEND_API_KEY missing — skipping emails");
    return;
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("slug, name")
    .eq("id", orgId)
    .single();

  const orgConfig = org?.slug ? getOrgConfig(org.slug) : null;
  const primaryColor = orgConfig?.branding.primaryColor ?? "#BF5700";
  const wordmark = orgConfig?.branding.wordmark ?? org?.name ?? "";

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
  const resend = new Resend(process.env.RESEND_API_KEY);

  const buildAndSend = async (recipientId: string, matchedId: string) => {
    const recipientProfile = profileMap.get(recipientId);
    const matchedProfile = profileMap.get(matchedId);
    const matchedSchool = schoolMap.get(matchedId) ?? null;
    const recipientEmail = emailMap.get(recipientId);

    if (!recipientEmail || !recipientProfile || !matchedProfile) {
      console.warn("[we-match] missing recipient/matched data, skipping send", {
        recipientId,
        matchedId,
      });
      return;
    }

    const variables: Record<string, string> = {
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
      primaryColor,
      wordmark,
      schoolPill: wordmark,
      messageUrl: `${appUrl}/messages?startWith=${matchedId}`,
    };

    await (resend.emails.send as unknown as (options: Record<string, unknown>) => Promise<unknown>)({
      from: "Mamun Co-Foundr <mamun@mamuncofoundr.com>",
      to: recipientEmail,
      template: {
        id: "we-match-mutual",
        variables,
      },
    });
  };

  await Promise.all([
    buildAndSend(userAId, userBId),
    buildAndSend(userBId, userAId),
  ]).catch((err) => {
    console.error("[we-match] resend send error:", err);
  });
}
