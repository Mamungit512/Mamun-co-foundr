import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, referralCode, fpRef, fpTid } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    let referrerUserId = null;
    if (referralCode?.startsWith("mamun-")) {
      const shortId = referralCode.replace("mamun-", "");

      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("user_id", `%${shortId}`)
        .single();

      referrerUserId = referrerProfile?.user_id || null;
    }

    const { data: referralData, error: dbError } = await supabase
      .from("referrals")
      .insert({
        referrer_code: referralCode || null,
        referrer_user_id: referrerUserId,
        referred_user_id: userId,
        referred_user_email: email,
        fp_ref: fpRef || null,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      if (dbError.code === "23505") {
        console.log(`Referral already exists for user ${userId}`);
        return NextResponse.json({ message: "Referral already recorded" });
      }
      console.error("Supabase error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Send to FirstPromoter v2 API
    // tid is preferred (includes deduplication), ref_id as fallback
    if (fpTid || fpRef || referralCode) {
      try {
        const fpResponse = await fetch(
          "https://v2.firstpromoter.com/api/v2/track/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.FIRSTPROMOTER_API_KEY}`,
              "Account-ID":
                process.env.NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID || "",
            },
            body: JSON.stringify({
              email: email,
              uid: userId,
              tid: fpTid || undefined,
              ref_id: !fpTid ? fpRef || referralCode : undefined,
            }),
          },
        );

        if (!fpResponse.ok) {
          const errorText = await fpResponse.text();
          console.error("FirstPromoter API error:", errorText);

          // Update status in Supabase
          await supabase
            .from("referrals")
            .update({ status: "error" })
            .eq("id", referralData.id);
        } else {
          await supabase
            .from("referrals")
            .update({ status: "confirmed" })
            .eq("id", referralData.id);
        }
      } catch (fpError) {
        console.error("Error calling FirstPromoter:", fpError);
      }
    }

    return NextResponse.json({
      success: true,
      referralId: referralData.id,
    });
  } catch (error) {
    console.error("Referral API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
