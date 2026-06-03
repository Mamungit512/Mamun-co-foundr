import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { getStudents } from "@/features/school/services/students";

export async function GET() {
  const auth = await requireOrgAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const students = await getStudents(auth.orgId);
    return NextResponse.json({ students });
  } catch {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
