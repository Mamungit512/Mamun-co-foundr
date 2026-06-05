import { NextRequest, NextResponse } from "next/server";
import { runWeeklyProfileViews } from "@/lib/email/lifecycle";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid cron secret" },
        { status: 401 },
      );
    }

    const result = await runWeeklyProfileViews();
    console.log(
      `✅ [weekly-profile-views] ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed (${result.candidates} candidates)`,
    );

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Weekly profile views cron error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
