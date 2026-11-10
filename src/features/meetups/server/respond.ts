import { NextResponse } from "next/server";
import { canRespond } from "../rules";
import { getMeetupParties, respondToMeetup } from "./data";
import { notFound, requireMeetupsAccess } from "./guard";

/**
 * Shared accept/decline handler. Responses:
 *   404 flag off, no such meetup, other school, or caller is not in the pair
 *       (a stranger learns nothing about whether the meetup exists)
 *   409 caller is the proposer, or the meetup was already answered
 *   200 { meetup }
 * There is deliberately no request body: a decline never carries a reason.
 */
export async function handleRespond(
  idParam: Promise<{ id: string }>,
  action: "accepted" | "declined",
): Promise<NextResponse> {
  try {
    const ctx = await requireMeetupsAccess();
    if (ctx instanceof NextResponse) return ctx;

    const { id } = await idParam;
    const parties = await getMeetupParties(id);
    if (!parties || parties.organizationId !== ctx.orgId) return notFound();

    const check = canRespond(parties, ctx.userId);
    if (!check.ok) {
      if (check.reason === "not_participant") return notFound();
      return NextResponse.json(
        {
          error:
            check.reason === "not_recipient"
              ? "Only the person who received the request can answer it."
              : "This request was already answered.",
        },
        { status: 409 },
      );
    }

    // Atomic: loses cleanly if a double click or a racing request got there first.
    const meetup = await respondToMeetup(parties.id, ctx.userId, action);
    if (!meetup) {
      return NextResponse.json(
        { error: "This request was already answered." },
        { status: 409 },
      );
    }

    return NextResponse.json({ meetup });
  } catch {
    console.error("[meetups respond] failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
