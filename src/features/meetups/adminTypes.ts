import type { MeetupStatus } from "./rules";

/** A campus spot as the school admin sees it, hidden ones included. */
export type AdminLocationDto = {
  id: string;
  name: string;
  building: string | null;
  isActive: boolean;
  createdAt: string;
};

/**
 * One row of the admin activity table. Deliberately has no note, no email
 * address and no user ids: the note goes only to the other student.
 */
export type AdminMeetupRow = {
  id: string;
  status: MeetupStatus;
  proposerName: string;
  recipientName: string;
  startsAt: string;
  createdAt: string;
  respondedAt: string | null;
  /** isActive false means an admin has since switched the spot off. */
  location: { name: string; isActive: boolean };
};
