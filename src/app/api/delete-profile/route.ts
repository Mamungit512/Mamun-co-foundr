import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key for backend operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Perform soft delete by updating the profile with deleted_at timestamp
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
        permanent_delete_at: new Date(
          Date.now() + 3 * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error soft deleting profile:", updateError);
      return NextResponse.json(
        { error: "Failed to delete profile" },
        { status: 500 },
      );
    }

    // Also clean up profile pictures from storage
    try {
      const { data: oldFiles, error: listError } = await supabase.storage
        .from("profile-pic")
        .list("", {
          search: userId,
        });

      if (!listError && oldFiles && oldFiles.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from("profile-pic")
          .remove(oldFiles.map((file) => file.name));

        if (deleteError) {
          console.error("Error deleting profile pictures:", deleteError);
          // Don't fail the request if profile pic deletion fails
        }
      }
    } catch (storageError) {
      console.error("Error during profile picture cleanup:", storageError);
      // Don't fail the request if storage cleanup fails
    }

    return NextResponse.json(
      { message: "Profile marked for deletion successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in delete-profile endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
