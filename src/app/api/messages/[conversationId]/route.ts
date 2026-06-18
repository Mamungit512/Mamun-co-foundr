import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getMessagesByConversationId } from "@/features/messages/messagesService";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

// Polling system - no time restrictions, just rate limiting for security

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
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

    // Get conversation ID from params
    const { conversationId } = await params;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createServerSupabaseClient();

    // Fetch messages for the conversation
    const result = await getMessagesByConversationId(
      conversationId,
      userId,
      supabase,
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      messages: result.messages,
    });
  } catch (error) {
    console.error("Error in messages API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
