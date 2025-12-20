import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const posthogApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Cron job to sync PostHog activity data to Supabase
 * Runs daily to update user_activity_summary table
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-posthog-activity",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or contains the correct auth header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid cron secret" },
        { status: 401 },
      );
    }

    if (!posthogApiKey) {
      return NextResponse.json(
        { error: "PostHog Personal API Key not configured" },
        { status: 500 },
      );
    }

    console.log("🔄 Starting PostHog activity sync...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id")
      .is("deleted_at", null);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No profiles to sync",
        synced: 0,
      });
    }

    console.log(`📊 Found ${profiles.length} profiles to sync`);

    // Fetch activity data from PostHog for each user
    const activityData: Array<{
      user_id: string;
      last_active_at: string | null;
      total_login_count: number;
      last_login_at: string | null;
    }> = [];

    for (const profile of profiles) {
      try {
        // Query PostHog API for user's last event
        const eventsResponse = await fetch(
          `${posthogHost}/api/projects/${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || "default"}/events?person_id=${profile.user_id}&limit=1&orderBy=-timestamp`,
          {
            headers: {
              Authorization: `Bearer ${posthogApiKey}`,
            },
          },
        );

        let lastActiveAt: string | null = null;
        let lastLoginAt: string | null = null;
        let totalLoginCount = 0;

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          if (eventsData.results && eventsData.results.length > 0) {
            lastActiveAt = eventsData.results[0].timestamp;
          }
        }

        // Query for login events specifically
        const loginResponse = await fetch(
          `${posthogHost}/api/projects/${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || "default"}/events?person_id=${profile.user_id}&event=user_login`,
          {
            headers: {
              Authorization: `Bearer ${posthogApiKey}`,
            },
          },
        );

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          totalLoginCount = loginData.count || 0;
          if (loginData.results && loginData.results.length > 0) {
            lastLoginAt = loginData.results[0].timestamp;
          }
        }

        activityData.push({
          user_id: profile.user_id,
          last_active_at: lastActiveAt,
          total_login_count: totalLoginCount,
          last_login_at: lastLoginAt,
        });
      } catch (userError) {
        console.error(`Error syncing user ${profile.user_id}:`, userError);
        // Continue with next user
      }
    }

    // Fetch existing activity data to merge intelligently
    const { data: existingActivity } = await supabase
      .from("user_activity_summary")
      .select("user_id, last_active_at")
      .in(
        "user_id",
        activityData.map((d) => d.user_id),
      );

    const existingMap = new Map(
      existingActivity?.map((a) => [a.user_id, a.last_active_at]) || [],
    );

    // Batch upsert to user_activity_summary table
    // Merge strategy: Keep the most recent last_active_at between PostHog and real-time middleware tracking
    const upsertData = activityData.map((data) => {
      const existingLastActive = existingMap.get(data.user_id);
      let finalLastActive = data.last_active_at;

      // If we have existing real-time data, keep whichever is more recent
      if (existingLastActive && data.last_active_at) {
        const existingDate = new Date(existingLastActive).getTime();
        const newDate = new Date(data.last_active_at).getTime();
        finalLastActive =
          existingDate > newDate ? existingLastActive : data.last_active_at;
      } else if (existingLastActive && !data.last_active_at) {
        // Keep existing if PostHog has no data
        finalLastActive = existingLastActive;
      }

      return {
        user_id: data.user_id,
        last_active_at: finalLastActive,
        total_login_count: data.total_login_count,
        last_login_at: data.last_login_at,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const { error: upsertError } = await supabase
      .from("user_activity_summary")
      .upsert(upsertData, {
        onConflict: "user_id",
      });

    if (upsertError) {
      throw new Error(`Failed to upsert activity data: ${upsertError.message}`);
    }

    console.log(
      `✅ Successfully synced ${activityData.length} user activities`,
    );

    return NextResponse.json({
      success: true,
      message: "Activity sync completed successfully",
      synced: activityData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Allow POST as well for manual triggering
export async function POST(req: NextRequest) {
  return GET(req);
}
