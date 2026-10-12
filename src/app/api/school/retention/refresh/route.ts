import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { CLERK_CACHE_TAG } from "@/features/school/services/retention/clerkAccounts";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

// Drops the cached Clerk accounts so the next read pulls fresh data. The cache
// is shared across schools (one tag), so the limit is per school to stop any
// one admin forcing a full Clerk pull in a loop.
export async function POST() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;

  const limit = await checkRateLimit({
    key: `retention-refresh:${auth.orgId}`,
    limit: 1,
    windowSeconds: 60,
  });
  if (!limit.allowed) return rateLimitResponse(limit);

  revalidateTag(CLERK_CACHE_TAG);
  return NextResponse.json({ refreshed: true });
}
