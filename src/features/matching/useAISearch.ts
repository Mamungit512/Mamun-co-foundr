import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

type AISearchResult = OnboardingData & {
  matchReason: string;
  relevanceScore: number;
};

type AISearchResponse = {
  results: AISearchResult[];
  query: string;
};

export function useAISearch() {
  return useMutation({
    mutationFn: async (query: string): Promise<AISearchResponse> => {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI search failed");
      }

      return response.json();
    },
  });
}

export function useAISearchAccess() {
  const { has } = useAuth();
  return has?.({ feature: "ai_search" }) ?? false;
}
