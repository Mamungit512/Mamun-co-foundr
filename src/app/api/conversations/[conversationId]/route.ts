import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getConversationById } from "@/features/conversations/conversationService";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

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

    // Fetch conversation details
    const result = await getConversationById(conversationId, userId, supabase);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      conversation: result.conversation,
    });
  } catch (error) {
    console.error("Error in conversation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
