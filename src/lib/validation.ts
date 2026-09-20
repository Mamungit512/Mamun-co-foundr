// Shared input-validation helpers for API routes.

/**
 * Clerk user ids are `user_` followed by a base62-ish id (letters/digits).
 * Used to reject non-id strings before they're stored or, worse, string-
 * concatenated into a raw PostgREST filter (e.g. `.not(col, "in", "(...)")`,
 * which does no escaping of its own — see src/app/api/profiles/route.ts).
 */
const CLERK_USER_ID_RE = /^user_[A-Za-z0-9]+$/;

export function isValidClerkUserId(value: unknown): value is string {
  return typeof value === "string" && CLERK_USER_ID_RE.test(value);
}
