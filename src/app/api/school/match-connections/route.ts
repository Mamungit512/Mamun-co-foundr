import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import {
  getMatchConnections,
  type MatchConnection,
} from "@/features/school/services/matchConnections";

export type { MatchConnection };

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const connections = await getMatchConnections(auth.orgId);
    return NextResponse.json({ connections, total: connections.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch match connections" },
      { status: 500 },
    );
  }
}
