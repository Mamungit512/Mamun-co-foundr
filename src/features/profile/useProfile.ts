import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth, useSession } from "@clerk/nextjs";
import { getProfileByUserId, upsertUserProfile } from "./profileService";
import { OnboardingData } from "@/app/onboarding/types";

export function useUserProfile() {
  const { userId } = useAuth();
  const { session } = useSession();

  return useQuery<OnboardingData, { message: string }>({
    queryKey: ["profile", userId],
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

export function useProfileUpsert() {
  const { userId } = useAuth();

  const { session } = useSession();

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
  });
}
