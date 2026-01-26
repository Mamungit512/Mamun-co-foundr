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
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing like:", checkError);
      return NextResponse.json(
        { error: "Failed to check like status" },
        { status: 500 },
      );
    }

    // If like already exists, return success without inserting
    if (existingLike) {
      console.log("Profile already liked, skipping duplicate insert");
      return NextResponse.json({
        success: true,
        alreadyLiked: true,
      });
    }

    // Insert the like (only if doesn't exist)
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

    return NextResponse.json({ success: true, alreadyLiked: false });
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
