"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function getReferralStats() {
  try {
    const user = await currentUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    // Server-side Supabase (do NOT use NEXT_PUBLIC)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
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

    return {
      ok: true,
      data: {
        referral_code: referralCode,
        referral_url: `http://localhost:3000/invite/${referralCode}`,
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

export async function createReferral(
  referredUserId: string, // Clerk user ID
  referrerCode: string, // mamun-xxxx
) {
  try {
    // Server-side Supabase client (correct)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
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
      return { ok: false, error: error.message };
    }

    // FirstPromoter API — correct format
    if (process.env.FIRSTPROMOTER_API_KEY) {
      fetch("https://firstpromoter.com/api/v1/track/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.FIRSTPROMOTER_API_KEY,
        },
        body: JSON.stringify({
          uid: referredUserId,
          tid: referrerCode, // FP 'tid' parametresi
        }),
      }).catch((err) => console.error("FP Error:", err));
    }

    return { ok: true, data };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";

    return { ok: false, error: errorMessage };
  }
}
