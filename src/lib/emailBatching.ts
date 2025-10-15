import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

/**
 * Check if we should send an email to this user
 * Returns true if it's been 1+ day since last email OR if they've never received one
 * Uses Clerk privateMetadata to store timestamp (no Supabase table needed)
 */
export async function shouldSendEmailNotification(
  userId: string,
): Promise<boolean> {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Check privateMetadata for last email sent timestamp
    const lastEmailSent = user.privateMetadata?.lastEmailSent as
      | string
      | undefined;

    if (!lastEmailSent) {
      // No record exists, this is their first email
      return true;
    }

    const lastSentAt = new Date(lastEmailSent);
    const now = new Date();
    const timeDiff = now.getTime() - lastSentAt.getTime();

    // Return true if 1+ day has passed
    return timeDiff >= ONE_DAY_IN_MS;
  } catch (error) {
    console.error("Error checking email notification status:", error);
    // On error, default to sending (fail open)
    return true;
  }
}

/**
 * Update the last email sent timestamp for a user in Clerk metadata
 */
export async function updateLastEmailSent(userId: string): Promise<void> {
  try {
    const clerk = await clerkClient();

    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        lastEmailSent: new Date().toISOString(),
      },
    });

    console.log(`✅ Updated lastEmailSent for user ${userId}`);
  } catch (error) {
    console.error("Error updating last email sent in Clerk:", error);
  }
}

/**
 * Get all unread messages for a user (messages received since last email)
 */
export async function getUnreadMessagesSinceLastEmail(userId: string): Promise<
  Array<{
    senderName: string;
    messagePreview: string;
    conversationId: string;
    senderId: string;
  }>
> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    // Get last email sent timestamp from Clerk metadata
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const lastEmailSent = user.privateMetadata?.lastEmailSent as
      | string
      | undefined;

    const since = lastEmailSent || new Date(0).toISOString(); // Beginning of time if no record

    // Get all conversations where user is a participant
    const { data: conversations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (!conversations || conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map((c) => c.conversation_id);

    // Get all messages in those conversations that are NOT from the user
    const { data: messages } = await supabase
      .from("messages")
      .select("id, sender_id, content, conversation_id, created_at")
      .in("conversation_id", conversationIds)
      .neq("sender_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (!messages || messages.length === 0) {
      return [];
    }

    // Get sender names for each message
    const uniqueSenderIds = [...new Set(messages.map((m) => m.sender_id))];
    const { data: senderProfiles } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", uniqueSenderIds);

    const senderMap = new Map(
      senderProfiles?.map((p) => [
        p.user_id,
        `${p.first_name} ${p.last_name}`,
      ]) || [],
    );

    // Format messages
    return messages.map((msg) => ({
      senderName: senderMap.get(msg.sender_id) || "Someone",
      messagePreview:
        msg.content.length > 80 ? msg.content.substring(0, 80) : msg.content,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
    }));
  } catch (error) {
    console.error("Error getting unread messages:", error);
    return [];
  }
}
