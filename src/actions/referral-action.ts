"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function getReferralStats() {
  try {
    const user = await currentUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const referralCode = `mamun-${user.id.slice(-8)}`;

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_code", referralCode);

    if (error) {
      return { ok: false, error: error.message };
    }

    const inviteCount = referrals?.length ?? 0;
    const earnedAmount = inviteCount * 5;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return {
      ok: true,
      data: {
        referral_code: referralCode,
        referral_url: `${baseUrl}/invite/${referralCode}`,
        invite_count: inviteCount,
        earned_amount: earnedAmount,
        rank: null,
        referrals: referrals ?? [],
      },
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";

    return { ok: false, error: errorMessage };
  }
}
