import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log("Entered sync-profile-pic endpoint");

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key used for backend endpoint
    );

    const { userId, profileImageUrl } = await req.json(); // Receive request body data
    console.log("Received data:", {
      userId,
      profileImageUrl: profileImageUrl?.substring(0, 100) + "...",
    });

    if (!userId || !profileImageUrl) {
      console.error("Missing required data:", {
        userId: !!userId,
        profileImageUrl: !!profileImageUrl,
      });
      return new Response("Missing userId or profileImageUrl", { status: 400 });
    }

    //  --- Fetch Clerk User Profile as Raw Bytes ---
    console.log("Fetching user data from Clerk...");

    try {
      // Get the user data from Clerk using the client
      const user = await clerk.users.getUser(userId);
      console.log("User fetched from Clerk:", user.id);

      // Get the user's profile image data
      const imageUrl = user.imageUrl;
      console.log("User's image URL from Clerk:", imageUrl);

      if (!imageUrl) {
        console.log("No image URL found in user data");
        return new Response("No profile image found for user", { status: 404 });
      }

      // Fetch the image using the Clerk client's authenticated context
      console.log("Fetching image from Clerk...");
      const imageResponse = await fetch(imageUrl, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });

      if (!imageResponse.ok) {
        console.error(
          "Failed to fetch image from Clerk:",
          imageResponse.status,
          imageResponse.statusText,
        );
        return new Response(`Failed to fetch image: ${imageResponse.status}`, {
          status: 500,
        });
      }

      const arrayBuffer = await imageResponse.arrayBuffer(); // Get ArrayBuffer (raw data of the image in bytes) from response
      console.log(
        `Image fetched successfully, size: ${arrayBuffer.byteLength} bytes`,
      );

      // Use "Buffer" from node to handle and manipulate the raw arrayBuffer data
      const buffer = Buffer.from(arrayBuffer); // Create a new node.js buffer from arrayBuffer

      //  --- Upload to Supabase Storage ---
      // Generate unique file path with timestamp
      const timestamp = Date.now();
      const filePath = `${userId}_${timestamp}.jpg`;
      console.log("Uploading to Supabase storage, file path:", filePath);

      // Clean up old profile pictures for this user
      try {
        console.log("Cleaning up old profile pictures for user:", userId);
        const { data: oldFiles, error: listError } = await supabase.storage
          .from("profile-pic")
          .list("", {
            search: userId, // Get all files that start with the user ID
          });

        if (listError) {
          console.error("Error listing old files:", listError);
        } else if (oldFiles && oldFiles.length > 0) {
          console.log(
            `Found ${oldFiles.length} old profile pictures to delete`,
          );

          // Delete all old files for this user
          const { error: deleteError } = await supabase.storage
            .from("profile-pic")
            .remove(oldFiles.map((file) => file.name));

          if (deleteError) {
            console.error("Error deleting old files:", deleteError);
          } else {
            console.log("Successfully deleted old profile pictures");
          }
        } else {
          console.log("No old profile pictures found to delete");
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
        // Continue with upload even if cleanup fails
      }

      // Upload the new image with unique path
      const { error: uploadError } = await supabase.storage
        .from("profile-pic") // Bucket name
        .upload(filePath, buffer, {
          contentType: "image/jpeg",
          upsert: true, // Changed back to true since we have unique paths
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return new Response(`Error uploading image: ${uploadError.message}`, {
          status: 500,
        });
      }

      console.log("Image uploaded successfully to Supabase storage");

      // --- Get Public URL of profile pic ---
      const { data: publicUrlData } = supabase.storage
        .from("profile-pic")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log("Generated public URL:", publicUrl);

      // --- Update Supabase User Row with profile pic url ---
      console.log("Updating user profile in database...");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ pfp_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Database update error:", updateError);
        return new Response(
          `Error updating user profile: ${updateError.message}`,
          { status: 500 },
        );
      }

      console.log("User profile updated successfully in database");
      return NextResponse.json({ success: true, imageUrl: publicUrl });
    } catch (clerkError) {
      console.error("Error fetching user from Clerk:", clerkError);
      return new Response(
        `Error fetching user data: ${clerkError instanceof Error ? clerkError.message : "Unknown error"}`,
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("Unexpected error in sync-profile-pic:", err);
    return new Response(
      `Internal server error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 500 },
    );
  }
}
