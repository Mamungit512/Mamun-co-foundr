import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  likeProfile,
  unlikeProfile,
  checkLikeStatus,
  getLikedProfiles,
  getLikers,
  getMutualLikes,
} from "./likesService";

// Hook to like/unlike a profile
export function useLikeProfile() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      likedId,
      isLiked,
    }: {
      likedId: string;
      isLiked: boolean;
    }) => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");

      const userId = session?.user?.id;
      if (!userId) throw new Error("No user ID");

      if (isLiked) {
        return await unlikeProfile({ likerId: userId, likedId, token });
      } else {
        return await likeProfile({ likerId: userId, likedId, token });
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["likes"] });
      queryClient.invalidateQueries({ queryKey: ["liked-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["mutual-likes"] });
      queryClient.invalidateQueries({
        queryKey: ["like-status", variables.likedId],
      });
    },
    onError: (error) => {
      console.error("Error with like operation:", error);
      toast.error("Something went wrong. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
    },
  });
}

// Hook to check if a profile is liked
export function useLikeStatus(likedId: string | undefined) {
  const { session } = useSession();

  return useQuery({
    queryKey: ["like-status", likedId],
    queryFn: async () => {
      if (!likedId) return { isLiked: false };

      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");

      const userId = session?.user?.id;
      if (!userId) throw new Error("No user ID");

      return await checkLikeStatus({ likerId: userId, likedId, token });
    },
    enabled: !!likedId && !!session,
  });
}

// Hook to get all profiles liked by the current user
export function useLikedProfiles() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["liked-profiles"],
    queryFn: async () => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");

      const userId = session?.user?.id;
      if (!userId) throw new Error("No user ID");

      return await getLikedProfiles({ likerId: userId, token });
    },
    enabled: !!session,
  });
}

// Hook to get all profiles that liked the current user
export function useLikers() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["likers"],
    queryFn: async () => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");

      const userId = session?.user?.id;
      if (!userId) throw new Error("No user ID");

      return await getLikers({ likedId: userId, token });
    },
    enabled: !!session,
  });
}

// Hook to get mutual likes (matches)
export function useMutualLikes() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["mutual-likes"],
    queryFn: async () => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");

      const userId = session?.user?.id;
      if (!userId) throw new Error("No user ID");

      return await getMutualLikes({ userId, token });
    },
    enabled: !!session,
  });
}

// Hook to toggle like status for a profile
export function useToggleLike() {
  const likeMutation = useLikeProfile();

  const toggleLike = async (likedId: string, currentIsLiked: boolean) => {
    try {
      const result = await likeMutation.mutateAsync({
        likedId,
        isLiked: currentIsLiked,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to toggle like");
      }

      return result;
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  };

  return {
    toggleLike,
    isLoading: likeMutation.isPending,
    error: likeMutation.error,
  };
}
