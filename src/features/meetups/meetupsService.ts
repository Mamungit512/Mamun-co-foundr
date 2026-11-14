import type { ProposalErrors } from "./rules";
import type {
  MeetupDto,
  MeetupForPairResponse,
  MeetupLocationOption,
} from "./types";

/** An API failure with the status and, for a 400, the per-field messages. */
export class MeetupApiError extends Error {
  status: number;
  fields?: ProposalErrors;
  constructor(message: string, status: number, fields?: ProposalErrors) {
    super(message);
    this.name = "MeetupApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(
  url: string,
  token: string,
  init?: { method: "POST"; body?: unknown },
): Promise<T> {
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
    fields?: ProposalErrors;
  } & T;
  if (!res.ok) {
    throw new MeetupApiError(
      json.error ?? "Something went wrong. Please try again.",
      res.status,
      json.fields,
    );
  }
  return json;
}

export function getMeetupForPair({
  token,
  withUserId,
}: {
  token: string;
  withUserId: string;
}): Promise<MeetupForPairResponse> {
  return request(`/api/meetups?with=${encodeURIComponent(withUserId)}`, token);
}

export async function getMeetupLocations({
  token,
}: {
  token: string;
}): Promise<MeetupLocationOption[]> {
  const json = await request<{ locations: MeetupLocationOption[] }>(
    "/api/meetups/locations",
    token,
  );
  return json.locations;
}

export async function proposeMeetup({
  token,
  toUserId,
  locationId,
  startsAtLocal,
  note,
}: {
  token: string;
  toUserId: string;
  locationId: string;
  startsAtLocal: string;
  note: string;
}): Promise<MeetupDto> {
  const json = await request<{ meetup: MeetupDto }>("/api/meetups", token, {
    method: "POST",
    body: { toUserId, locationId, startsAtLocal, note },
  });
  return json.meetup;
}

export async function respondToMeetup({
  token,
  id,
  action,
}: {
  token: string;
  id: string;
  action: "accept" | "decline";
}): Promise<MeetupDto> {
  const json = await request<{ meetup: MeetupDto }>(
    `/api/meetups/${encodeURIComponent(id)}/${action}`,
    token,
    { method: "POST" },
  );
  return json.meetup;
}
