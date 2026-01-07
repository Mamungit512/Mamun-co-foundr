import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as WebhookEvent;

    const eventType = evt.type;
    const id = evt.data.id;

    // Track referrals when a new user is created
    if (eventType === "user.created") {
      const emailAddresses = evt.data.email_addresses;
      const email =
        emailAddresses && emailAddresses.length > 0
          ? emailAddresses[0].email_address
          : null;

      // Get referral code and FirstPromoter ref/tid from unsafe_metadata
      const referralCode = evt.data.unsafe_metadata?.referral_code as
        | string
        | undefined;
      const fpRef = evt.data.unsafe_metadata?.fp_ref as string | undefined;
      const fpTid = evt.data.unsafe_metadata?.fp_tid as string | undefined;

      console.log("🆕 New user created:", {
        userId: id,
        email: email ? `${email.substring(0, 3)}***` : "none",
        hasReferral: !!(referralCode || fpRef || fpTid),
      });

      if (email) {
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
          );

          // Look up referrer if using internal mamun-xxx code
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

          // Insert referral record into database
          const { data: referralData, error: dbError } = await supabase
            .from("referrals")
            .insert({
              referrer_code: referralCode || null,
              referrer_user_id: referrerUserId,
              referred_user_id: id,
              referred_user_email: email,
              fp_ref: fpRef || null,
              status: "pending",
            })
            .select()
            .single();

          if (dbError) {
            if (dbError.code === "23505") {
              console.log(`Referral already exists for user ${id}`);
            } else {
              console.error("Supabase error:", dbError);
            }
          } else {
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
                      uid: id,
                      tid: fpTid || undefined,
                      ref_id: !fpTid ? fpRef || referralCode : undefined,
                    }),
                  },
                );

                if (!fpResponse.ok) {
                  const errorText = await fpResponse.text();
                  console.error("FirstPromoter API error:", errorText);
                  await supabase
                    .from("referrals")
                    .update({ status: "error" })
                    .eq("id", referralData.id);
                } else {
                  console.log("✅ FirstPromoter referral tracked");
                  await supabase
                    .from("referrals")
                    .update({ status: "confirmed" })
                    .eq("id", referralData.id);
                }
              } catch (fpError) {
                console.error("Error calling FirstPromoter:", fpError);
              }
            }
          }
        } catch (refError) {
          console.error("Error tracking referral:", refError);
        }
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);

    if (err instanceof Error) {
      console.error("Error details:", {
        message: err.message,
        name: err.name,
      });
    }

    return new Response("Error verifying webhook", { status: 400 });
  }
}
