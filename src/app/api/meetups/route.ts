import { NextRequest, NextResponse, after } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { isValidClerkUserId } from "@/lib/validation";
import { validateProposal } from "@/features/meetups/rules";
import { requireMeetupsAccess } from "@/features/meetups/server/guard";
import {
  getLatestMeetupForPair,
  getLocationForProposal,
  insertMeetup,
  isMutualMatch,
} from "@/features/meetups/server/data";
import { sendMeetupEmails } from "@/features/meetups/server/sendMeetupEmails";
import type { MeetupForPairResponse } from "@/features/meetups/types";

/**
 * Latest meetup between the caller and `?with={userId}`, plus whether they are
 * a mutual match. Anyone who is not matched with the caller gets
 * { matched: false, meetup: null }, never someone else's meetup.
 */
export async function GET(req: NextRequest) {
  try {
    const ctx = await requireMeetupsAccess();
    if (ctx instanceof NextResponse) return ctx;

    const other = req.nextUrl.searchParams.get("with");
    if (!isValidClerkUserId(other) || other === ctx.userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const matched = await isMutualMatch(ctx.orgId, ctx.userId, other);
    const meetup = matched
      ? await getLatestMeetupForPair(ctx.orgId, ctx.userId, other)
      : null;

    return NextResponse.json({ matched, meetup } satisfies MeetupForPairResponse);
  } catch {
    console.error("[meetups GET] failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Propose a meetup to a mutual match. */
export async function POST(req: NextRequest) {
  try {
    const ctx = await requireMeetupsAccess();
    if (ctx instanceof NextResponse) return ctx;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const toUserId = body.toUserId;
    if (!isValidClerkUserId(toUserId) || toUserId === ctx.userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Only the two students in a mutual match can propose.
    if (!(await isMutualMatch(ctx.orgId, ctx.userId, toUserId))) {
      return NextResponse.json(
        { error: "Meetups open once you both match." },
        { status: 403 },
      );
    }

    const rate = await checkRateLimit({
      key: `meetup-propose:${ctx.userId}`,
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!rate.allowed) return rateLimitResponse(rate);

    const location =
      typeof body.locationId === "string"
        ? await getLocationForProposal(body.locationId)
        : null;

    const result = validateProposal({
      location,
      organizationId: ctx.orgId,
      startsAtLocal: typeof body.startsAtLocal === "string" ? body.startsAtLocal : null,
      note: typeof body.note === "string" ? body.note : null,
      now: new Date(),
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: "Check the highlighted fields.", fields: result.errors },
        { status: 400 },
      );
    }

    const inserted = await insertMeetup({
      orgId: ctx.orgId,
      proposerUserId: ctx.userId,
      recipientUserId: toUserId,
      locationId: location!.id,
      startsAt: result.value.startsAt,
      note: result.value.note,
    });
    if (!inserted.ok) {
      return NextResponse.json(
        { error: "There is already an open meetup request between you two." },
        { status: 409 },
      );
    }

    // After the response: the student never waits on Resend, and a send problem
    // cannot fail the proposal. The send itself never throws.
    const meetupId = inserted.meetup.id;
    after(() => sendMeetupEmails(meetupId, "proposed"));

    return NextResponse.json({ meetup: inserted.meetup }, { status: 201 });
  } catch {
    // No error object in the log: it can echo the request body, note included.
    console.error("[meetups POST] failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
