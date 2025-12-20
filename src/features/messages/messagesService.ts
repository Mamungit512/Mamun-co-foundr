// Messages service functions for fetching and managing messages
import { SupabaseClient } from "@supabase/supabase-js";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    pfp_url: string | null;
  };
};

// Type for Supabase response
type SupabaseMessageResponse = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles:
    | {
        user_id: string;
        first_name: string | null;
        last_name: string | null;
        pfp_url: string | null;
      }[]
    | null;
};

export async function getMessagesByConversationId(
  conversationId: string,
  currentUserId: string,
  supabaseClient: SupabaseClient,
): Promise<{
  messages: Message[];
  error?: string;
}> {
  const supabase = supabaseClient;

  try {
    // First, verify that the user is a participant in this conversation
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", currentUserId)
      .single();

    if (participantError || !participantData) {
      return {
        messages: [],
        error: "User is not a participant in this conversation",
      };
    }

    // Fetch messages for the conversation with sender information
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        profiles!sender_id (
          user_id,
          first_name,
          last_name,
          pfp_url
        )
      `,
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error.message);
      return { messages: [], error: "Failed to fetch messages" };
    }

    if (!data || data.length === 0) {
      return { messages: [], error: undefined };
    }

    // Transform the data to match our Message type
    const messages: Message[] = data.map((message: SupabaseMessageResponse) => {
      console.log("📧 Message raw data:", {
        sender_id: message.sender_id,
        profiles: message.profiles,
        profiles_length: message.profiles?.length,
        first_profile: message.profiles?.[0],
      });

      const senderProfile = message.profiles?.[0];
      const mappedSender = {
        id: senderProfile?.user_id || message.sender_id,
        first_name: senderProfile?.first_name || null,
        last_name: senderProfile?.last_name || null,
        pfp_url: senderProfile?.pfp_url || null,
      };

      console.log("👤 Mapped sender data:", mappedSender);

      return {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.content,
        created_at: message.created_at,
        sender: mappedSender,
      };
    });

    return {
      messages,
      error: undefined,
    };
  } catch (error) {
    console.error("Unexpected error in getMessagesByConversationId:", error);
    return { messages: [], error: "Unexpected error occurred" };
  }
}
