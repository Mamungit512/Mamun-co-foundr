"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CofounderLinkProfile } from "@/app/api/cofounder-link/[userId]/route";

export type CofounderInvite = {
  id: string;
  invitee_email: string;
  status: "pending" | "accepted" | "declined" | "revoked" | "expired";
  created_at: string;
  expires_at: string;
};

export type CofounderManagement = {
  invites: CofounderInvite[];
  links: (CofounderLinkProfile & { created_at: string })[];
};

export function useCofounderManagement() {
  return useQuery<CofounderManagement>({
    queryKey: ["cofounder-management"],
    queryFn: async () => {
      const res = await fetch("/api/cofounder-invite");
      if (!res.ok) throw new Error("Failed to load co-founder data");
      return res.json();
    },
  });
}

export function useSendCofounderInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteeEmail: string) => {
      const res = await fetch("/api/cofounder-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send invite");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cofounder-management"] });
    },
  });
}

export function useRevokeCofounderInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cofounder-invite/${id}/revoke`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to revoke invite");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cofounder-management"] });
    },
  });
}

export function useUnlinkCofounder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      const res = await fetch("/api/cofounder-link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to unlink");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cofounder-management"] });
      queryClient.invalidateQueries({ queryKey: ["cofounder-links"] });
    },
  });
}

export function useCofounderLinks(userId: string | undefined) {
  return useQuery<CofounderLinkProfile[]>({
    queryKey: ["cofounder-links", userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`/api/cofounder-link/${userId}`);
      if (!res.ok) throw new Error("Failed to load co-founder links");
      const data = await res.json();
      return data.cofounderLinks ?? [];
    },
  });
}
