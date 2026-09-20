import { NextRequest, NextResponse } from "next/server";
import { runWeeklyProfileViews } from "@/lib/email/lifecycle";
import { verifyCronSecret } from "@/lib/cronAuth";

export async function GET(req: NextRequest) {
  try {
    const authError = verifyCronSecret(req);
    if (authError) return authError;

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
