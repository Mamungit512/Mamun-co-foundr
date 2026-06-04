import { NextRequest, NextResponse } from "next/server";
import {
  runProfileCompletionReminders,
  type LifecycleResult,
} from "@/lib/email/lifecycle";

/**
 * Unified lifecycle email cron — runs all lifecycle checks daily.
 *
 * To add a new lifecycle email:
 *   1. Create src/lib/email/lifecycle/<name>.ts exporting run<Name>(): Promise<LifecycleResult>
 *   2. Re-export it from src/lib/email/lifecycle/index.ts
 *   3. Add it to the CHECKS array below
 *
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/lifecycle-emails",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */

const CHECKS = [runProfileCompletionReminders];

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

    const results: LifecycleResult[] = [];

    for (const check of CHECKS) {
      try {
        const result = await check();
        results.push(result);
        console.log(
          `✅ [lifecycle] ${result.name}: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed (${result.candidates} candidates)`,
        );
      } catch (err) {
        console.error(`❌ [lifecycle] check failed:`, err);
        results.push({
          name: check.name,
          candidates: 0,
          sent: 0,
          skipped: 0,
          failed: 1,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Lifecycle email cron error:", error);
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
