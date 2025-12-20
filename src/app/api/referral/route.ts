import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, referralCode, fpRef } = await req.json();

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

    // Send to FirstPromoter API
    if (fpRef || referralCode) {
      try {
        const fpResponse = await fetch(
          "https://firstpromoter.com/api/v1/track/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.FIRSTPROMOTER_API_KEY!,
            },
            body: JSON.stringify({
              email: email,
              uid: userId,
              ref_id: fpRef || referralCode,
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
