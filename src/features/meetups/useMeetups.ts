import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@clerk/nextjs";
import { useSchool } from "@/features/school/components/SchoolContext";
import {
  getMeetupForPair,
  getMeetupLocations,
  proposeMeetup,
  respondToMeetup,
} from "./meetupsService";

/**
 * All meetups queries are off when the school's flag is off, so a school
 * without meetups never makes a request.
 */

async function tokenOrThrow(getToken: () => Promise<string | null> | undefined) {
  const token = await getToken();
  if (!token) throw new Error("No authentication token");
  return token;
}

/** Latest meetup with this person, plus whether the two are a mutual match. */
export function useMeetupForPair(otherUserId: string) {
  const { session } = useSession();
  const { features } = useSchool();

  return useQuery({
    queryKey: ["meetup", otherUserId],
    queryFn: async () =>
      getMeetupForPair({
        token: await tokenOrThrow(() => session?.getToken()),
        withUserId: otherUserId,
      }),
    enabled: features.meetups && !!session && !!otherUserId,
  });
}

/** Active campus spots for the school. */
export function useMeetupLocations(enabled = true) {
  const { session } = useSession();
  const { features } = useSchool();

  return useQuery({
    queryKey: ["meetup-locations"],
    queryFn: async () =>
      getMeetupLocations({ token: await tokenOrThrow(() => session?.getToken()) }),
    enabled: enabled && features.meetups && !!session,
  });
}

export function useProposeMeetup(otherUserId: string) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      locationId: string;
      startsAtLocal: string;
      note: string;
    }) =>
      proposeMeetup({
        token: await tokenOrThrow(() => session?.getToken()),
        toUserId: otherUserId,
        ...input,
      }),
    // Settled, not success: a 409 means someone else's request is now open.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["meetup", otherUserId] }),
  });
}

export function useRespondMeetup(otherUserId: string) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "accept" | "decline" }) =>
      respondToMeetup({
        token: await tokenOrThrow(() => session?.getToken()),
        id,
        action,
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["meetup", otherUserId] }),
  });
}
