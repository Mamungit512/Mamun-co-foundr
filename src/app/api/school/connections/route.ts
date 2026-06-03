import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { getConnections, type OrgConnection } from "@/features/school/services/connections";

export type { OrgConnection };

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const connections = await getConnections(auth.orgId);
    return NextResponse.json({ connections, total_connections: connections.length });
  } catch {
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}
