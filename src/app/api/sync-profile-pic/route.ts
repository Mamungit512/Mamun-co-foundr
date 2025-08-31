import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  console.log("Entered sync-profile-pic endpoint");

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
    console.log("Fetching image from Clerk URL...");
    const response = await fetch(profileImageUrl); // Send an https GET request to clerk at the imageUrl. A response object is returned

    if (!response.ok) {
      console.error(
        "Failed to fetch image from Clerk:",
        response.status,
        response.statusText,
      );
      return new Response(`Failed to fetch image: ${response.status}`, {
        status: 500,
      });
    }

    const arrayBuffer = await response.arrayBuffer(); // Get ArrayBuffer (raw data of the image in bytes) from response
    console.log(
      `Image fetched successfully, size: ${arrayBuffer.byteLength} bytes`,
    );

    // Use "Buffer" from node to handle and manipulate the raw arrayBuffer data
    const buffer = Buffer.from(arrayBuffer); // Create a new node.js buffer from arrayBuffer

    //  --- Upload to Supabase Storage ---
    const filePath = `${userId}.jpg`;
    console.log("Uploading to Supabase storage, file path:", filePath);

    const { error: uploadError } = await supabase.storage
      .from("profile-pic") // Bucket name
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
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
  } catch (err) {
    console.error("Unexpected error in sync-profile-pic:", err);
    return new Response(
      `Internal server error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 500 },
    );
  }
}
