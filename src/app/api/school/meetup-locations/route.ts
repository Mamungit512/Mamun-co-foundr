import { NextRequest, NextResponse } from "next/server";
import { validateLocationInput } from "@/features/meetups/locationRules";
import { requireMeetupsAdmin } from "@/features/meetups/server/adminGuard";
import { createLocation, listLocationsForAdmin } from "@/features/meetups/server/adminData";

/** The school's campus spots, switched-off ones included. */
export async function GET() {
  try {
    const admin = await requireMeetupsAdmin();
    if (admin instanceof NextResponse) return admin;

    return NextResponse.json({ locations: await listLocationsForAdmin(admin.orgId) });
  } catch {
    console.error("[school/meetup-locations GET] failed");
    return NextResponse.json({ error: "Failed to load locations" }, { status: 500 });
  }
}

/** Add a spot to the caller's school. It starts active. */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireMeetupsAdmin();
    if (admin instanceof NextResponse) return admin;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = validateLocationInput({ name: body.name, building: body.building });
    if (!result.ok) {
      return NextResponse.json(
        { error: "Check the highlighted fields.", fields: result.errors },
        { status: 400 },
      );
    }

    const created = await createLocation(admin.orgId, result.value);
    if (!created.ok) {
      return NextResponse.json(
        { error: "A spot with that name already exists.", fields: { name: "Already in your list." } },
        { status: 409 },
      );
    }
    return NextResponse.json({ location: created.location }, { status: 201 });
  } catch {
    console.error("[school/meetup-locations POST] failed");
    return NextResponse.json({ error: "Failed to add location" }, { status: 500 });
  }
}
