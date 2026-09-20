import { NextRequest, NextResponse } from "next/server";

/**
 * Verifies the cron route's `Authorization: Bearer <CRON_SECRET>` header.
 * Fails CLOSED: a missing/unset CRON_SECRET is treated as misconfiguration,
 * not "no secret required" — these routes are also in middleware's public
 * allowlist (`/api/cron/(.*)`), so this check is the only thing standing
 * between them and the internet.
 */
export function verifyCronSecret(req: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid cron secret" },
      { status: 401 },
    );
  }

  return null;
}
