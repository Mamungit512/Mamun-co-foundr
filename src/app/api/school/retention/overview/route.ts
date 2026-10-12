import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { getOverview } from "@/features/school/services/retention";

export type { RetentionOverview } from "@/features/school/services/retention";

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json(await getOverview(auth.orgId));
  } catch (error) {
    console.error("Retention overview failed:", error);
    return NextResponse.json(
      { error: "Failed to load retention data" },
      { status: 500 },
    );
  }
}
