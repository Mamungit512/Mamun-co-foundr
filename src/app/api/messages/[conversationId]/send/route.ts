import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
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

    // Get message content from request body
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // First, verify that the user is a participant in this conversation
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .single();

    if (participantError || !participantData) {
      return NextResponse.json(
        { error: "User is not a participant in this conversation" },
        { status: 403 },
      );
    }

    // Check message count limit (20 messages per conversation)
    const { count: messageCount, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId);

    if (countError) {
      console.error("Error counting messages:", countError);
      return NextResponse.json(
        { error: "Failed to check message count" },
        { status: 500 },
      );
    }

    if (messageCount && messageCount >= 20) {
      return NextResponse.json(
        {
          error: "Message limit reached (20 messages per conversation)",
          messageCount: messageCount,
          limit: 20,
          suggestion: "Connect on other platforms to continue the conversation",
        },
        { status: 429 },
      );
    }

    // Insert the message into the database
    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error inserting message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: messageData,
      success: true,
    });
  } catch (error) {
    console.error("Error in send message API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
