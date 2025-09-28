// Conversation service functions will be implemented here
// Conversation junction table stores a user_id and the conversation_id it's tied to.
// One row per user_id per conversation_id
// E.g One-on-One conversations -> Two rows in the junction table

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

export async function getConversationById(
  conversationId: string,
  currentUserId: string,
  supabaseClient: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{
  conversation?: ConversationWithOtherParticipant;
  error?: string;
}> {
  const supabase = supabaseClient;

  try {
    // Check if the user is a participant in this conversation
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", currentUserId)
      .single();

    if (participantError || !participantData) {
      return { error: "User is not a participant in this conversation" };
    }

    // Get conversation details
    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .select("id, created_at, last_message_at")
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversationData) {
      console.error("Error fetching conversation:", conversationError);
      return { error: "Failed to fetch conversation" };
    }

    // Get the other participant's user_id
    const { data: otherParticipantData, error: otherParticipantError } =
      await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", currentUserId)
        .single();

    if (otherParticipantError || !otherParticipantData) {
      console.error("Error fetching other participant:", otherParticipantError);
      return { error: "Failed to fetch other participant" };
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
      return { error: "Failed to fetch profile" };
    }

    return {
      conversation: {
        id: conversationData.id,
        created_at: conversationData.created_at,
        last_message_at: conversationData.last_message_at,
        otherParticipant: {
          id: profileData.user_id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          pfp_url: profileData.pfp_url,
          title: profileData.title,
        },
      },
    };
  } catch (error) {
    console.error("Unexpected error in getConversationById:", error);
    return { error: "Unexpected error occurred" };
  }
}

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

export async function createConversation(
  currentUserId: string,
  otherUserId: string,
  supabaseClient: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<{
  conversation?: ConversationWithOtherParticipant;
  error?: string;
}> {
  const supabase = supabaseClient;

  try {
    // Check if conversation already exists between these two users
    const { data: existingConversation, error: checkError } = await supabase
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
      .eq("user_id", currentUserId);

    if (checkError) {
      console.error("Error checking existing conversation:", checkError);
      return { error: "Failed to check existing conversation" };
    }

    // Check if any of these conversations also have the other user as a participant
    let existingConversationId = null;
    if (existingConversation && existingConversation.length > 0) {
      for (const conv of existingConversation) {
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.conversation_id)
          .eq("user_id", otherUserId)
          .single();

        if (otherParticipant) {
          existingConversationId = conv.conversation_id;
          break;
        }
      }
    }

    // If conversation already exists, return it
    if (existingConversationId) {
      const conversationData = existingConversation.find(
        (c: { conversation_id: string; conversations: unknown }) =>
          c.conversation_id === existingConversationId,
      );
      const conversation = conversationData?.conversations as {
        id: string;
        created_at: string;
        last_message_at: string | null;
      };

      // Get the other participant's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, pfp_url, title")
        .eq("user_id", otherUserId)
        .is("deleted_at", null)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        return { error: "Failed to fetch profile" };
      }

      return {
        conversation: {
          id: conversation.id,
          created_at: conversation.created_at,
          last_message_at: conversation.last_message_at,
          otherParticipant: {
            id: profileData.user_id,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            pfp_url: profileData.pfp_url,
            title: profileData.title,
          },
        },
      };
    }

    // Create new conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        created_at: new Date().toISOString(),
        last_message_at: null,
      })
      .select()
      .single();

    if (conversationError || !conversationData) {
      console.error("Error creating conversation:", conversationError);
      return { error: "Failed to create conversation" };
    }

    // Add both users as participants
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        {
          conversation_id: conversationData.id,
          user_id: currentUserId,
        },
        {
          conversation_id: conversationData.id,
          user_id: otherUserId,
        },
      ]);

    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      return { error: "Failed to add participants" };
    }

    // Get the other participant's profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, pfp_url, title")
      .eq("user_id", otherUserId)
      .is("deleted_at", null)
      .single();

    if (profileError || !profileData) {
      console.error("Error fetching profile:", profileError);
      return { error: "Failed to fetch profile" };
    }

    return {
      conversation: {
        id: conversationData.id,
        created_at: conversationData.created_at,
        last_message_at: conversationData.last_message_at,
        otherParticipant: {
          id: profileData.user_id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          pfp_url: profileData.pfp_url,
          title: profileData.title,
        },
      },
    };
  } catch (error) {
    console.error("Unexpected error in createConversation:", error);
    return { error: "Unexpected error occurred" };
  }
}
