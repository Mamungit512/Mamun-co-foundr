import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const imageUrl = user?.imageUrl; // User's clerk profile picture

  const response = await fetch(imageUrl); // Send an https GET request to clerk at the imageUrl. A response object is returned
  const arrayBuffer = await response.arrayBuffer(); // Get ArrayBuffer (raw data of the image in bytes) from response

  // Use "Buffer" from node to handle and manipulate the ray arrayBuffer data
  const buffer = Buffer.from(arrayBuffer); // Create a new node.js buffer from arrayBuffer

  // TO DELETE LATER
  console.log(req, buffer);

  return new NextResponse(imageUrl); // Change this later
}
