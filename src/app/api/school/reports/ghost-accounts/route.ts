import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { getGhostExportRows } from "@/features/school/services/retention";
import {
  getOrgSlug,
  recordAdminExport,
} from "@/features/school/services/retention/exports";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const rows = await getGhostExportRows(auth.orgId);

    // Record the export first: if the audit row cannot be written, no file.
    await recordAdminExport({
      orgId: auth.orgId,
      userId: auth.userId,
      email: auth.email,
      kind: "ghost-accounts",
      rowCount: rows.length,
    });

    const csv = toCsv([
      [
        "email",
        "account_created",
        "days_since_created",
        "has_main_site_profile",
      ],
      ...rows.map((r) => [
        r.email,
        r.clerk_created_at.split("T")[0],
        r.days_since_created,
        r.has_main_site_profile ? "yes" : "no",
      ]),
    ]);
    const slug = await getOrgSlug(auth.orgId);
    const date = new Date().toISOString().split("T")[0];
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}-ghost-accounts-${date}.csv"`,
      },
    });
  } catch (error) {
    console.error("Ghost export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
