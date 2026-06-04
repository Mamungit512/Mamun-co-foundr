import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { getCohortCsv } from "@/features/school/services/reports/cohort";

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const csv = await getCohortCsv(auth.orgId);
    const date = new Date().toISOString().split("T")[0];
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ut-cohort-${date}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch cohort" }, { status: 500 });
  }
}
