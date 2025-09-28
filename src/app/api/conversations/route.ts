import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import {
  getUserConversations,
  createConversation,
} from "@/features/conversations/conversationService";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the token from the request headers
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid token provided" },
        { status: 401 },
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch conversations for the user
    const result = await getUserConversations(userId, supabase);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      conversations: result.conversations,
    });
  } catch (error) {
    console.error("Error in conversations API:", error);
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

    // Get the token from the request headers
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No valid token provided" },
        { status: 401 },
      );
    }

    // Get the other user ID from request body
    const { otherUserId } = await request.json();

    if (!otherUserId) {
      return NextResponse.json(
        { error: "Other user ID is required" },
        { status: 400 },
      );
    }

    if (otherUserId === userId) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Create conversation
    const result = await createConversation(userId, otherUserId, supabase);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      conversation: result.conversation,
      success: true,
    });
  } catch (error) {
    console.error("Error in create conversation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
