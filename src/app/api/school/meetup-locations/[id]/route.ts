import { NextRequest, NextResponse } from "next/server";
import { requireMeetupsAdmin } from "@/features/meetups/server/adminGuard";
import { setLocationActive } from "@/features/meetups/server/adminData";

/**
 * Switch a spot on or off: { isActive: boolean }. Live immediately.
 * There is deliberately no DELETE: past meetups keep resolving the spot.
 *   403 the spot belongs to another school
 *   404 no such spot
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireMeetupsAdmin();
    if (admin instanceof NextResponse) return admin;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { id } = await params;
    const result = await setLocationActive(admin.orgId, id, body.isActive);
    if (!result.ok) {
      return result.reason === "forbidden"
        ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
        : NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ location: result.location });
  } catch {
    console.error("[school/meetup-locations PATCH] failed");
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
