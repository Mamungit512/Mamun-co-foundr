import type { MeetupStatus } from "./rules";

/** A campus spot as students see it when proposing. */
export type MeetupLocationOption = {
  id: string;
  name: string;
  building: string | null;
};

/** A meetup as returned to one of its two students. Times are UTC ISO strings. */
export type MeetupDto = {
  id: string;
  status: MeetupStatus;
  proposerUserId: string;
  recipientUserId: string;
  startsAt: string;
  /** Only ever returned to the two students in the pair. */
  note: string | null;
  createdAt: string;
  respondedAt: string | null;
  /** Still resolves when an admin has switched the spot off. */
  location: MeetupLocationOption & { isActive: boolean };
};

export type MeetupForPairResponse = {
  matched: boolean;
  meetup: MeetupDto | null;
};
