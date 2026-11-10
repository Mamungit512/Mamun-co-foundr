import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getEnvAdminEmails,
  getVerifiedPrimaryEmail,
} from "@/features/school/auth/org-admin";
import { runUtAnnouncement } from "@/lib/email/lifecycle";

// Sends are paced for Resend's rate limit, so a batch can take a while.
export const maxDuration = 60;

const MAX_LIMIT = 100;

function positiveInt(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

/**
 * Manually triggered UT feature announcement. Platform staff only: the caller's
 * verified email must be in ADMIN_EMAILS. School admins (UT staff) are
 * deliberately not allowed, and profiles.is_admin is not trusted for a bulk send.
 *
 * Body: { dryRun?: boolean (default true), limit?: number, inactiveDays?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = await getVerifiedPrimaryEmail(userId);
    if (!email || !getEnvAdminEmails().includes(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) ?? {};
    } catch {
      // An empty body means all defaults (a dry run).
    }

    const dryRun = body.dryRun === false ? false : true;

    let limit: number | undefined;
    if (body.limit !== undefined) {
      const parsed = positiveInt(body.limit);
      if (parsed === null || parsed > MAX_LIMIT) {
        return NextResponse.json(
          { error: `limit must be an integer from 1 to ${MAX_LIMIT}` },
          { status: 400 },
        );
      }
      limit = parsed;
    }

    let inactiveDays: number | undefined;
    if (body.inactiveDays !== undefined) {
      const parsed = positiveInt(body.inactiveDays);
      if (parsed === null) {
        return NextResponse.json(
          { error: "inactiveDays must be a positive integer" },
          { status: 400 },
        );
      }
      inactiveDays = parsed;
    }

    const result = await runUtAnnouncement({ dryRun, limit, inactiveDays });
    console.log(
      `[ut-announcement] dryRun=${result.dryRun} candidates=${result.candidates} sent=${result.sent} skipped=${result.skipped} failed=${result.failed} remaining=${result.remaining}`,
    );
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error in UT announcement route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
