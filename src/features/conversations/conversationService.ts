// Conversation service functions will be implemented here
// Conversation junction table stores a user_id and the conversation_id it's tied to.
// One row per user_id per conversation_id
// E.g One-on-One conversations -> Two rows in the junction table

// Conversation service functions will be implemented here

export type ConversationWithOtherParticipant = {
  id: string;
  created_at: string;
  last_message_at: string | null;
  otherParticipant: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    pfp_url: string | null;
    title: string | null;
  };
};

export async function getUserConversations(
  currentUserId: string,
  supabaseClient: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{
  conversations: ConversationWithOtherParticipant[];
  error?: string;
}> {
  const supabase = supabaseClient;

  try {
    // 1️⃣ Fetch conversations where the user is a participant
    const { data, error } = await supabase
      .from("conversation_participants")
      .select(
        `
        conversation_id,
        conversations!inner (
          id,
          created_at,
          last_message_at
        )
      `,
      )
      .eq("user_id", currentUserId)
      .order("conversations(last_message_at)", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error.message);
      return { conversations: [], error: "Failed to fetch conversations" };
    }

    if (!data || data.length === 0) {
      return { conversations: [], error: undefined };
    }

    // 2️⃣ For each conversation, get the other participant's profile
    const conversationsWithOtherParticipants: ConversationWithOtherParticipant[] =
      [];

    for (const participant of data) {
      // Handle the nested conversations data properly
      const conversations = participant.conversations as unknown;
      const conversation = Array.isArray(conversations)
        ? conversations[0]
        : conversations;

      // Get the other participant's user_id
      const { data: otherParticipantData, error: otherParticipantError } =
        await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conversation.id)
          .neq("user_id", currentUserId)
          .single();

      if (otherParticipantError || !otherParticipantData) {
        console.error(
          "Error fetching other participant:",
          otherParticipantError,
        );
        continue;
      }

      // Get the other participant's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, pfp_url, title")
        .eq("user_id", otherParticipantData.user_id)
        .is("deleted_at", null)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        continue;
      }

      conversationsWithOtherParticipants.push({
        id: conversation.id as string,
        created_at: conversation.created_at as string,
        last_message_at: conversation.last_message_at as string | null,
        otherParticipant: {
          id: profileData.user_id as string,
          first_name: profileData.first_name as string | null,
          last_name: profileData.last_name as string | null,
          pfp_url: profileData.pfp_url as string | null,
          title: profileData.title as string | null,
        },
      });
    }

    return {
      conversations: conversationsWithOtherParticipants,
      error: undefined,
    };
  } catch (error) {
    console.error("Unexpected error in getUserConversations:", error);
    return { conversations: [], error: "Unexpected error occurred" };
  }
}
