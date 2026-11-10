import { NextResponse } from "next/server";
import { requireMeetupsAccess } from "@/features/meetups/server/guard";
import { listActiveLocations } from "@/features/meetups/server/data";

/** Active campus spots for the caller's school, for the propose form. */
export async function GET() {
  try {
    const ctx = await requireMeetupsAccess();
    if (ctx instanceof NextResponse) return ctx;

    const locations = await listActiveLocations(ctx.orgId);
    return NextResponse.json({ locations });
  } catch {
    console.error("[meetups/locations GET] failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
