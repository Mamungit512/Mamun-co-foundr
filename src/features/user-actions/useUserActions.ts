import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@clerk/nextjs";
import { createSkipProfileAction } from "./userActionsService";

// Hook to skip a profile
export function useSkipProfile() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ skippedProfileId }: { skippedProfileId: string }) => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");

      const userId = session?.user?.id;
      if (!userId) throw new Error("No user ID");

      return await createSkipProfileAction(userId, skippedProfileId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-swipe-count"] });
      queryClient.invalidateQueries({ queryKey: ["swipe-limit"] });
      // Do NOT invalidate ["profiles"] here. The UI handles ordering via an
      // optimistic rotate, and the server-side cycle tracking ensures the next
      // independent refetch (page reload, preference change) returns the correct order.
    },
    onError: (error) => {
      console.error("Error skipping profile:", error);
    },
  });
}
