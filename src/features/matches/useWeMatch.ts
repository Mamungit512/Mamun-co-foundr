import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { weMatch, getWeMatchStatus } from "./weMatchService";

export function useWeMatchStatus() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["we-match-status"],
    queryFn: async () => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");
      return getWeMatchStatus({ token });
    },
    enabled: !!session,
  });
}

export function useWeMatch() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toUserId }: { toUserId: string }) => {
      const token = await session?.getToken();
      if (!token) throw new Error("No authentication token");
      return weMatch({ toUserId, token });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["we-match-status"] });

      if (!data.success) {
        toast.error(data.error || "Failed to send We Match", {
          duration: 3000,
          position: "bottom-right",
        });
        return;
      }

      if (data.mutual && !data.alreadyNotified) {
        toast.success("🎉 It's a match! Check your email.", {
          duration: 5000,
          position: "bottom-right",
        });
      } else if (!data.mutual) {
        toast.success("We Match sent — they'll be notified if they match back.", {
          duration: 3000,
          position: "bottom-right",
        });
      }
    },
    onError: (error) => {
      console.error("[useWeMatch] error:", error);
      toast.error("Something went wrong. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
    },
  });
}
