import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export type CofounderLinkProfile = {
  link_id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  pfp_url: string | null;
  title: string | null;
};

// Lightweight co-founder list for profile card badges
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId: requestingUserId, sessionClaims } = await auth();
    if (!requestingUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // Access check: caller must be the profile owner or able to see the target
    // in the matching feed (same org, or both general-pool / null-org).
    // Blocks the IDOR: a school-org user can't read a different school's links.
    const isSelf = requestingUserId === userId;
    if (!isSelf) {
      const requestingOrgId =
        ((sessionClaims?.metadata as Record<string, unknown>)
          ?.organization_id as string | undefined) ?? null;

      const supabase = supa();
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", userId)
        .single();

      const targetOrgId = targetProfile?.organization_id ?? null;

      // Deny if the orgs don't match (covers school↔general and school↔school cross-org)
      if (requestingOrgId !== targetOrgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const supabase = supa();

    const { data: links, error: linkErr } = await supabase
      .from("cofounder_links")
      .select("id, user_a_id, user_b_id")
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

    if (linkErr) {
      console.error("[cofounder-link GET] links error:", linkErr);
      return NextResponse.json({ error: "Failed to load links" }, { status: 500 });
    }

    const partnerIds = (links ?? []).map((l) =>
      l.user_a_id === userId ? l.user_b_id : l.user_a_id,
    );

    let profiles: CofounderLinkProfile[] = [];
    if (partnerIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, pfp_url, title")
        .in("user_id", partnerIds)
        .is("deleted_at", null);

      profiles = (profileRows ?? []).map((p) => {
        const link = (links ?? []).find(
          (l) => l.user_a_id === p.user_id || l.user_b_id === p.user_id,
        );
        return { link_id: link?.id ?? "", ...p };
      });
    }

    return NextResponse.json({ cofounderLinks: profiles });
  } catch (error) {
    console.error("[cofounder-link GET] unhandled:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
