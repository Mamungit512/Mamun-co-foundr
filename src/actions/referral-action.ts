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

    // Fetch this user's referrals
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_code", referralCode);

    if (error) {
      console.error("Supabase error:", error);
      return { ok: false, error: error.message };
    }

    const inviteCount = referrals?.length ?? 0;
    const earnedAmount = inviteCount * 5; // 5$ example

    const { data: counts } = await supabase.rpc("get_referral_counts"); 

    let rank = null;
    if (Array.isArray(counts)) {
      const sorted = counts.sort((a, b) => b.count - a.count);
      rank = sorted.findIndex((u) => u.referrer_code === referralCode) + 1;
    }

    return {
      ok: true,
      data: {
        referral_code: referralCode,
        // referral_url: `https://mamun.co/invite/${referralCode}`,
        referral_url: `http://localhost:3000/invite/${referralCode}`,

        invite_count: inviteCount,
        earned_amount: earnedAmount,
        rank: rank || null,
        referrals: referrals ?? [],
      },
    };
  } catch (err: any) {
    console.error("getReferralStats error:", err);
    return { ok: false, error: err?.message || "Unexpected error" };
  }
}

export async function createReferral(
  referredUserId: string,
  referrerCode: string,
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabase
      .from("referrals")
      .insert({
        referrer_code: referrerCode,
        referred_user_id: referredUserId,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create referral error:", error);
      return { ok: false, error: error.message };
    }

    // FirstPromoter — async non-blocking
    if (process.env.FIRSTPROMOTER_API_KEY) {
      fetch("https://firstpromoter.com/api/v1/track/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.FIRSTPROMOTER_API_KEY,
        },
        body: JSON.stringify({
          email: referredUserId,
          promoter_id: referrerCode,
        }),
      }).catch((fp) => console.error("FP error:", fp));
    }

    return { ok: true, data };
  } catch (err: any) {
    console.error("createReferral error:", err);
    return { ok: false, error: err?.message || "Unexpected error" };
  }
}
