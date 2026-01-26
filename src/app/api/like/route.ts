import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { likedId } = await request.json();

    if (!likedId) {
      return NextResponse.json({ error: "Missing likedId" }, { status: 400 });
    }

    if (userId === likedId) {
      return NextResponse.json(
        { error: "Cannot like your own profile" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("id")
      .eq("liker_id", userId)
      .eq("liked_id", likedId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected if no like exists
      console.error("Error checking existing like:", checkError);
      return NextResponse.json(
        { error: "Failed to check like status" },
        { status: 500 },
      );
    }

    if (existingLike) {
      return NextResponse.json(
        { error: "Profile already liked" },
        { status: 400 },
      );
    }

    // Insert the like
    const { error: insertError } = await supabase.from("likes").insert({
      liker_id: userId,
      liked_id: likedId,
    });

    if (insertError) {
      console.error("Error inserting like:", insertError);
      return NextResponse.json(
        { error: "Failed to like profile" },
        { status: 500 },
      );
    }

    console.log("Like created successfully:", {
      likerId: userId,
      likedId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in like API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { likedId } = await request.json();

    if (!likedId) {
      return NextResponse.json({ error: "Missing likedId" }, { status: 400 });
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("liker_id", userId)
      .eq("liked_id", likedId);

    if (deleteError) {
      console.error("Error deleting like:", deleteError);
      return NextResponse.json(
        { error: "Failed to unlike profile" },
        { status: 500 },
      );
    }

    console.log("Like deleted successfully:", {
      likerId: userId,
      likedId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in unlike API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
