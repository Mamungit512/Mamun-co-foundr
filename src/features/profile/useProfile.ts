import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useSession } from "@clerk/nextjs";
import {
  getProfileByUserId,
  getProfiles,
  upsertUserProfile,
} from "./profileService";
import toast from "react-hot-toast";

export function useGetProfiles() {
  const { userId } = useAuth();
  const { session } = useSession();

  const {
    data: profiles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const token = await session?.getToken();

      if (!token) {
        throw { message: "Authentication failed. Please log in again." };
      }

      if (!userId) {
        throw { message: "No user id. Please log in." };
      }

      try {
        const currentUser = await getProfileByUserId(userId?.toString(), token);
        return await getProfiles({ token }, currentUser);
      } catch (error) {
        throw {
          message: "Failed to load user profiles. Please try again later",
          originalError: error,
        };
      }
    },
    retry: 1,
  });

  return { data: profiles, isLoading, error };
}

export function useUserProfile() {
  const { userId } = useAuth();
  const { session } = useSession();

  return useQuery<OnboardingData, { message: string }>({
    queryKey: ["profiles", userId],
    queryFn: async () => {
      if (!userId) {
        throw { message: "You must be logged in to view your profile" };
      }

      const token = await session?.getToken();
      if (!token) {
        throw { message: "Authentication failed. Please log in again." };
      }

      try {
        return await getProfileByUserId(userId, token);
      } catch (error) {
        throw {
          message: "Failed to load profile. Please try again later.",
          originalError: error,
        };
      }
    },
    enabled: !!userId,
    retry: 1,
  });
}

export function useProfileByUserId(userId: string, enabled: boolean = true) {
  const { session } = useSession();
  const requestingUserId = session?.user?.id;

  return useQuery<OnboardingData, { message: string }>({
    queryKey: ["profile", userId, requestingUserId],
    queryFn: async () => {
      if (!userId) {
        throw { message: "No user ID provided" };
      }

      const token = await session?.getToken();
      if (!token) {
        throw { message: "Authentication failed. Please log in again." };
      }

      try {
        return await getProfileByUserId(userId, token, requestingUserId);
      } catch (error) {
        throw {
          message: "Failed to load profile. Please try again later.",
          originalError: error,
        };
      }
    },
    enabled: enabled && !!userId && !!session && !!requestingUserId,
    retry: 1,
  });
}

export function useProfileUpsert() {
  const { userId } = useAuth();
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: OnboardingData) => {
      const token = await session?.getToken();

      if (!userId || !token) {
        throw new Error("No logged in user or authentication has failed");
      }

      try {
        return await upsertUserProfile({ userId, token, formData });
      } catch (error) {
        console.error(error);
        throw new Error("Error upserting profile information to database");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch profiles and user profile queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update profile.");
    },
  });
}
