import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getOnboardingProfile,
  saveOnboardingProfile,
} from "@/features/profile/services/onboardingProfile";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getOnboardingProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // _saveContext is set explicitly by the calling hook to declare which pool
    // this save belongs to. Without it, the route falls back to the session
    // claim — but school-email users on the main site carry their school org_id
    // in the claim and would be mis-classified as school saves.
    const { _saveContext, ...formData } = body as { _saveContext?: string } & OnboardingData;
    const organizationId =
      _saveContext === "general"
        ? null
        : (sessionClaims?.metadata?.organization_id ?? null);

    const result = await saveOnboardingProfile({ userId, organizationId, formData });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, message: "Profile saved successfully" });
  } catch (error) {
    console.error("Error in profile upsert API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
