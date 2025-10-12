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
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["today-swipe-count"] });
      queryClient.invalidateQueries({ queryKey: ["swipe-limit"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error) => {
      console.error("Error skipping profile:", error);
    },
  });
}

