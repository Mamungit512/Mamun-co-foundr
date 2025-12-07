import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as WebhookEvent;

    // Do something with payload
    const eventType = evt.type;
    const id = evt.data.id;

    // Supabase client instantiation removed as it was unused

    // Note: Removed reactivation logic since we now use hard deletes
    // Deleted users cannot be reactivated

    // Track referrals when a new user is created
    if (eventType === "user.created") {
      const emailAddresses = evt.data.email_addresses;
      const email =
        emailAddresses && emailAddresses.length > 0
          ? emailAddresses[0].email_address
          : null;

      // Get referral code from unsafe_metadata
      const referralCode = evt.data.unsafe_metadata?.referral_code as
        | string
        | undefined;

      console.log("🆕 New user created:", {
        userId: id,
        email,
        referralCode: referralCode || "none",
      });

      if (email) {
        try {
          const baseUrl =
            process.env.NODE_ENV === "production"
              ? process.env.NEXT_PUBLIC_PRODUCTION_URL ||
                "https://www.mamuncofoundr.com"
              : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

          const referralUrl = `${baseUrl}/api/referral`;

          const referralRes = await fetch(referralUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: id,
              email: email,
              referralCode: referralCode || null,
              fpRef: null, // Can be extracted from metadata if needed
            }),
            signal: AbortSignal.timeout(25000),
          });

          if (!referralRes.ok) {
            const errorText = await referralRes.text();
            console.error("❌ Referral tracking failed:", errorText);
          } else {
            const result = await referralRes.json();
            console.log("✅ Referral tracked successfully:", result);
          }
        } catch (refError) {
          console.error("Error tracking referral:", refError);
        }
      }
    }

    // Call sync-profile-pic endpoint when user updates their data
    if (eventType === "user.updated") {
      // Check if the user actually has a profile image
      const profileImageUrl = evt.data.image_url;

      if (!profileImageUrl) {
        console.log("No profile image URL found, skipping sync");
        return new Response("Webhook received - no profile image to sync", {
          status: 200,
        });
      }

      try {
        // Use proper base URL - fallback to localhost for development
        const baseUrl =
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_PRODUCTION_URL ||
              "https://www.mamuncofoundr.com"
            : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        const syncUrl = `${baseUrl}/api/sync-profile-pic`;

        const res = await fetch(syncUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: id,
            profileImageUrl: profileImageUrl,
          }),
          // Add timeout for Vercel
          signal: AbortSignal.timeout(25000), // 25 seconds (under Vercel's 30s limit)
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("sync-profile-pic failed:", errorText);
          console.error(
            "Response headers:",
            Object.fromEntries(res.headers.entries()),
          );
        }
      } catch (syncErr) {
        console.error("Error calling sync-profile-pic:", syncErr);
        if (syncErr instanceof Error) {
          if (syncErr.name === "TimeoutError") {
            console.error("Sync request timed out on Vercel");
          } else if (syncErr.name === "AbortError") {
            console.error("Sync request was aborted");
          }
        }
        // Don't fail the webhook, just log the error
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);

    // Log more details about the error
    if (err instanceof Error) {
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
    }

    return new Response("Error verifying webhook", { status: 400 });
  }
}
