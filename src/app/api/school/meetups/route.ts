import { NextResponse } from "next/server";
import { requireMeetupsAdmin } from "@/features/meetups/server/adminGuard";
import { listMeetupsForAdmin } from "@/features/meetups/server/adminData";

/**
 * The school's meetups: who, where, when, status. Never the note, an address
 * or a user id (see adminData.listMeetupsForAdmin).
 */
export async function GET() {
  try {
    const admin = await requireMeetupsAdmin();
    if (admin instanceof NextResponse) return admin;

    return NextResponse.json({ meetups: await listMeetupsForAdmin(admin.orgId) });
  } catch {
    console.error("[school/meetups GET] failed");
    return NextResponse.json({ error: "Failed to load meetups" }, { status: 500 });
  }
}
