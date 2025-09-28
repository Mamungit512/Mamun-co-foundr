import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { ConversationWithOtherParticipant } from "@/features/conversations/conversationService";

interface CreateConversationRequest {
  otherUserId: string;
}

interface CreateConversationResponse {
  conversation: {
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
  success: boolean;
}

async function createConversation(
  otherUserId: string,
  token: string,
): Promise<CreateConversationResponse> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ otherUserId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create conversation");
  }

  return response.json();
}

async function fetchConversation(
  conversationId: string,
  token: string,
): Promise<ConversationWithOtherParticipant> {
  const response = await fetch(`/api/conversations/${conversationId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch conversation");
  }

  const data = await response.json();
  return data.conversation;
}

export function useCreateConversation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ otherUserId }: CreateConversationRequest) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      return createConversation(otherUserId, token);
    },
    onSuccess: () => {
      // Invalidate conversations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useConversation(conversationId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      return fetchConversation(conversationId, token);
    },
    enabled: !!conversationId,
  });
}
