import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key used for backend endpoint
  );

  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const imageUrl = user?.imageUrl; // User's clerk profile picture

  //  --- Fetch Clerk User Profile as Raw Bytes ---
  const response = await fetch(imageUrl); // Send an https GET request to clerk at the imageUrl. A response object is returned
  const arrayBuffer = await response.arrayBuffer(); // Get ArrayBuffer (raw data of the image in bytes) from response

  // Use "Buffer" from node to handle and manipulate the ray arrayBuffer data
  const buffer = Buffer.from(arrayBuffer); // Create a new node.js buffer from arrayBuffer

  //  --- Upload to Supabase Storage ---
  const filePath = `${user.id}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("profile-pic") // Bucket name
    .upload(filePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error(uploadError);
    return new Response("Error uploading image", { status: 500 });
  }

  // --- Get Public URL of profile pic ---
  const { data: publicUrlData } = supabase.storage
    .from("profile-pic")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  // --- Update Supabase User Row with profile pic url ---
  const { error: dbError } = await supabase
    .from("users")
    .update({ pfp_url: publicUrl })
    .eq("user_id", user.id);

  if (dbError) {
    console.error(dbError);
    return new Response("Error updating user row with pfp", { status: 500 });
  }

  return NextResponse.json({ imageUrl: publicUrl });
}
