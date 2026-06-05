import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { getAnalytics } from "@/features/school/services/analytics";

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const analytics = await getAnalytics(auth.orgId);
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
