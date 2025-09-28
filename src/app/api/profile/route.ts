import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import {
  mapProfileToOnboardingData,
  mapOnboardingDatatoProfileDB,
} from "@/lib/mapProfileToFromDBFormat";

export async function GET() {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch the user's profile
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null) // Exclude soft-deleted profiles
      .single();

    if (error) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const mappedProfile = mapProfileToOnboardingData(data);

    return NextResponse.json({
      profile: mappedProfile,
    });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the profile data from request body
    const formData = await request.json();

    if (!formData) {
      return NextResponse.json(
        { error: "Profile data is required" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Map the form data to database format
    const dbData = mapOnboardingDatatoProfileDB(formData);

    // Upsert the profile
    const { error: dbError } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        ...dbData,
      },
      { onConflict: "user_id" },
    );

    if (dbError) {
      console.error("Supabase returned an error:", dbError);
      return NextResponse.json(
        { error: `Error saving profile: ${dbError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error in profile upsert API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
