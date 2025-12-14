import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 },
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${userId}_${timestamp}.${fileExt}`;

    // Clean up old profile pictures for this user
    try {
      const { data: oldFiles } = await supabase.storage
        .from("profile-pic")
        .list("", { search: userId });

      if (oldFiles && oldFiles.length > 0) {
        await supabase.storage
          .from("profile-pic")
          .remove(oldFiles.map((file) => file.name));
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
      // Continue with upload even if cleanup fails
    }

    // Upload new image
    const { error: uploadError } = await supabase.storage
      .from("profile-pic")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("profile-pic")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update profile with new photo URL in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ pfp_url: publicUrl })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 },
      );
    }

    // Update Clerk's profile image to keep UserButton avatar in sync
    try {
      const clerk = await clerkClient();

      // Create a File object from the buffer for Clerk
      const clerkFile = new File([buffer], file.name, { type: file.type });

      await clerk.users.updateUserProfileImage(userId, {
        file: clerkFile,
      });

      console.log("✅ Profile image synced to Clerk successfully");
    } catch (clerkError) {
      // Log error
      // DO NOT fail the request, Supabase will still have the new profile image
      console.error("⚠️ Failed to sync image to Clerk:", clerkError);
      console.error("Supabase update succeeded, but Clerk sync failed");
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    console.error("Unexpected upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
