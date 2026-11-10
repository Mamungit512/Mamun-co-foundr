"use client";

import { useSession } from "@clerk/nextjs";
import toast from "react-hot-toast";
import MeetupCard from "./MeetupCard";
import { MeetupApiError } from "./meetupsService";
import { useMeetupForPair, useRespondMeetup } from "./useMeetups";
import { shortName } from "./viewState";

/** The viewer's latest meetup with the other student, on the chat page. */
export default function ChatMeetupCard({
  otherUserId,
  otherFirstName,
  otherLastName,
  onProposeAnother,
}: {
  otherUserId: string;
  otherFirstName: string | null | undefined;
  otherLastName: string | null | undefined;
  onProposeAnother: () => void;
}) {
  const { session } = useSession();
  const { data } = useMeetupForPair(otherUserId);
  const respond = useRespondMeetup(otherUserId);

  if (!data?.matched || !data.meetup) return null;
  const { meetup } = data;

  const answer = (action: "accept" | "decline") =>
    respond.mutate(
      { id: meetup.id, action },
      {
        onSuccess: () =>
          toast.success(action === "accept" ? "Meetup confirmed." : "Request declined."),
        onError: (err) =>
          toast.error(
            err instanceof MeetupApiError
              ? err.message
              : "Something went wrong. Please try again.",
          ),
      },
    );

  return (
    <MeetupCard
      meetup={meetup}
      viewerId={session?.user?.id}
      otherName={shortName(otherFirstName, otherLastName)}
      otherFirstName={(otherFirstName ?? "").trim() || "your match"}
      isResponding={respond.isPending}
      onAccept={() => answer("accept")}
      onDecline={() => answer("decline")}
      onProposeAnother={onProposeAnother}
    />
  );
}
