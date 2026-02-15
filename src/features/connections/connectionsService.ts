// Connections service functions for admin dashboard
import { SupabaseClient } from "@supabase/supabase-js";

export type Connection = {
  conversation_id: string;
  user1: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    pfp_url: string | null;
    title: string | null;
  };
  user2: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    pfp_url: string | null;
    title: string | null;
  };
  message_count: number;
  created_at: string;
  last_message_at: string | null;
};

export async function getAllConnections(
  supabaseClient: SupabaseClient,
): Promise<{
  connections: Connection[];
  total_connections: number;
  error?: string;
}> {
  const supabase = supabaseClient;

  try {
    // 1. Fetch all conversations
    const { data: allConversations, error: conversationsError } =
      await supabase
        .from("conversations")
        .select(
          `
          id,
          created_at,
          last_message_at
        `,
        )
        .order("created_at", { ascending: false });

    if (conversationsError) {
      console.error("Error fetching conversations:", conversationsError);
      return {
        connections: [],
        total_connections: 0,
        error: "Failed to fetch conversations",
      };
    }

    if (!allConversations || allConversations.length === 0) {
      return {
        connections: [],
        total_connections: 0,
      };
    }

    // 2. For each conversation, get participants and message count
    const connections: Connection[] = [];

    for (const conversation of allConversations) {
      // Count messages in this conversation first
      const { count: messageCount, error: countError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversation.id);

      if (countError) {
        console.error(
          `Error counting messages for conversation ${conversation.id}:`,
          countError,
        );
        continue;
      }

      // Skip conversations with no messages
      if (!messageCount || messageCount === 0) {
        continue;
      }

      // Get all participants for this conversation
      const { data: participants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversation.id);

      if (participantsError || !participants || participants.length !== 2) {
        console.error(
          `Error fetching participants for conversation ${conversation.id}:`,
          participantsError,
        );
        continue; // Skip this conversation if we can't get exactly 2 participants
      }

      const user1Id = participants[0].user_id;
      const user2Id = participants[1].user_id;

      // Get profile data for both users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, pfp_url, title")
        .in("user_id", [user1Id, user2Id])
        .is("deleted_at", null);

      if (profilesError || !profiles || profiles.length < 2) {
        console.error(
          `Error fetching profiles for conversation ${conversation.id}:`,
          profilesError,
        );
        continue; // Skip if we can't get both profiles
      }

      // Create a map for easy lookup
      const profilesMap = new Map(
        profiles.map((p) => [p.user_id, p]),
      );

      const user1Profile = profilesMap.get(user1Id);
      const user2Profile = profilesMap.get(user2Id);

      if (!user1Profile || !user2Profile) {
        continue; // Skip if either profile is missing
      }

      connections.push({
        conversation_id: conversation.id,
        user1: {
          user_id: user1Profile.user_id,
          first_name: user1Profile.first_name,
          last_name: user1Profile.last_name,
          pfp_url: user1Profile.pfp_url,
          title: user1Profile.title,
        },
        user2: {
          user_id: user2Profile.user_id,
          first_name: user2Profile.first_name,
          last_name: user2Profile.last_name,
          pfp_url: user2Profile.pfp_url,
          title: user2Profile.title,
        },
        message_count: messageCount,
        created_at: conversation.created_at,
        last_message_at: conversation.last_message_at,
      });
    }

    return {
      connections,
      total_connections: connections.length,
    };
  } catch (error) {
    console.error("Unexpected error in getAllConnections:", error);
    return {
      connections: [],
      total_connections: 0,
      error: "Unexpected error occurred",
    };
  }
}
