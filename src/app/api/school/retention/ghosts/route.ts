import { NextRequest, NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { getGhostAccounts } from "@/features/school/services/retention";

const GHOSTS_PAGE_SIZE = 25;

export type { GhostRow } from "@/features/school/services/retention";

export async function GET(req: NextRequest) {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;

  // Only the page number comes from the request; the org never does.
  const page = Math.max(
    0,
    Number.parseInt(req.nextUrl.searchParams.get("page") ?? "0", 10) || 0,
  );
  try {
    const result = await getGhostAccounts(
      auth.orgId,
      GHOSTS_PAGE_SIZE,
      page * GHOSTS_PAGE_SIZE,
    );
    return NextResponse.json({ ...result, pageSize: GHOSTS_PAGE_SIZE, page });
  } catch (error) {
    console.error("Ghost list failed:", error);
    return NextResponse.json(
      { error: "Failed to load ghost accounts" },
      { status: 500 },
    );
  }
}
