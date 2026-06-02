import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useSession } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  type DashboardFilters,
  type SearchEmptyReason,
  buildProfilesQueryString,
} from "@/lib/dashboardFilters";
import type { ParsedQuery } from "@/lib/searchQueryParser";

export function useGetProfiles(filters?: DashboardFilters) {
  const { userId } = useAuth();
  const { session } = useSession();

  const {
    data: profiles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profiles", filters],
    queryFn: async () => {
      const token = await session?.getToken();

      if (!token) {
        throw { message: "Authentication failed. Please log in again." };
      }

      if (!userId) {
        throw { message: "No user id. Please log in." };
      }

      const queryString = filters ? buildProfilesQueryString(filters) : "";

      try {
        const response = await fetch(`/api/profiles${queryString}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw { message: errorData.error || "Failed to load profiles" };
        }

        const data = await response.json();
        return data.profiles;
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
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw { message: errorData.error || "Failed to load profile" };
        }

        const data = await response.json();
        return data.profile;
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
        const response = await fetch(`/api/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw { message: errorData.error || "Failed to load profile" };
        }

        const data = await response.json();
        return data.profile;
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

export function useSearchProfiles(query: string, userFilters: DashboardFilters) {
  const { session } = useSession();
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  // Last-good Mode A parse, kept so chip dismissals (Mode B) can re-search
  // without paying for another Groq parse.
  const [inferred, setInferred] = useState<ParsedQuery | null>(null);

  // Parse-mode debounce: 750ms (TPM mitigation)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 750);
    return () => clearTimeout(t);
  }, [query]);

  // Reset per-query state whenever the raw query changes
  useEffect(() => {
    setDismissed(new Set());
    setInferred(null);
  }, [query]);

  const dismissFilter = (key: string) => {
    setDismissed((prev) => new Set([...prev, key]));
  };

  // Mode B = we have a cached parse AND the user dismissed at least one chip.
  // Backend skips Groq and re-merges the surviving inferred filters itself.
  const isDismissMode = inferred !== null && dismissed.size > 0;
  const dismissedKeys = [...dismissed].sort();
  const cachedParse = inferred
    ? {
        filters: inferred.filters,
        semanticQuery: inferred.semanticQuery,
        ftsTerms: inferred.ftsTerms,
      }
    : undefined;

  const queryKey = [
    "profiles-search",
    debouncedQuery,
    userFilters,
    dismissedKeys.join(","),
    isDismissMode,
  ];

  const searchQuery = useQuery<
    {
      profiles: OnboardingData[];
      inferred: ParsedQuery | null;
      emptyReason: SearchEmptyReason;
    },
    { message: string }
  >({
    queryKey,
    queryFn: async () => {
      const token = await session?.getToken();
      if (!token)
        throw { message: "Authentication failed. Please log in again." };

      const body = {
        q: debouncedQuery,
        userFilters,
        ...(isDismissMode && {
          cachedParse,
          dismissedFilterKeys: dismissedKeys,
        }),
      };

      const res = await fetch("/api/profiles/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw { message: errorData.error || "Search failed" };
      }

      const result = await res.json();

      // Cache the parse only on Mode A so later dismissals can reuse it.
      if (result.inferred && !isDismissMode) {
        setInferred(result.inferred);
      }

      return result;
    },
    enabled: debouncedQuery.trim().length >= 2 && !!session,
    retry: 1,
  });

  return {
    data: searchQuery.data?.profiles ?? [],
    inferred: searchQuery.data?.inferred ?? null,
    emptyReason: searchQuery.data?.emptyReason ?? null,
    isFetching: searchQuery.isFetching,
    error: searchQuery.error,
    dismissFilter,
  };
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
        const response = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update profile");
        }

        return await response.json();
      } catch (error) {
        console.error(error);
        console.log(error);
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
