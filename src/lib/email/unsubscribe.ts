import { createHmac, timingSafeEqual } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * One-click unsubscribe for every email the app sends.
 *
 * Each email carries a link to /unsubscribe with the recipient's address and
 * an HMAC of it, so no sign-in is needed and nobody can unsubscribe someone
 * else. Opting out stops ALL app email to that address: the opt-out is stored
 * on the Clerk user (privateMetadata) and checked before every send, and the
 * address is also added to Resend's suppression list so broadcasts skip it.
 */

/** Always the apex: on a school subdomain /unsubscribe would be rewritten to a school page. */
export const UNSUBSCRIBE_BASE_URL = "https://mamuncofoundr.com";
export const UNSUBSCRIBE_MAILTO =
  "mailto:mamun@mamuncofoundr.com?subject=Unsubscribe";
/** Clerk privateMetadata key holding the ISO time the user opted out. */
export const UNSUBSCRIBED_AT_KEY = "emailUnsubscribedAt";

const TOKEN_VERSION = "unsubscribe:v1:";

function signingSecret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || null;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function signEmail(email: string): string | null {
  const secret = signingSecret();
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(TOKEN_VERSION + normalize(email))
    .digest("base64url");
}

export function verifyEmailToken(email: string, token: string): boolean {
  const expected = signEmail(email);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function encodeEmail(email: string): string {
  return Buffer.from(normalize(email)).toString("base64url");
}

export function decodeEmail(encoded: string): string | null {
  try {
    const email = Buffer.from(encoded, "base64url").toString("utf8");
    return email.includes("@") ? normalize(email) : null;
  } catch {
    return null;
  }
}

/**
 * Links for one recipient: `pageUrl` for the footer link (opens a confirm
 * page, so mail scanners that prefetch links can't unsubscribe anyone) and
 * `oneClickUrl` for the List-Unsubscribe header (mail apps POST to it).
 * Null when no signing secret is configured.
 */
export function buildUnsubscribeUrls(
  email: string,
): { pageUrl: string; oneClickUrl: string } | null {
  const token = signEmail(email);
  if (!token) return null;
  const query = `e=${encodeEmail(email)}&t=${token}`;
  return {
    pageUrl: `${UNSUBSCRIBE_BASE_URL}/unsubscribe?${query}`,
    oneClickUrl: `${UNSUBSCRIBE_BASE_URL}/api/unsubscribe?${query}`,
  };
}

/** Parses and verifies `e` and `t` from an unsubscribe link. */
export function readUnsubscribeParams(
  e: string | null | undefined,
  t: string | null | undefined,
): string | null {
  if (!e || !t) return null;
  const email = decodeEmail(e);
  if (!email || !verifyEmailToken(email, t)) return null;
  return email;
}

async function usersForEmail(email: string) {
  const clerk = await clerkClient();
  const { data } = await clerk.users.getUserList({ emailAddress: [email] });
  return data;
}

/**
 * Whether this address opted out. Fails open (returns false) if Clerk can't be
 * reached, since Resend's suppression list still blocks the send.
 */
export async function isEmailUnsubscribed(email: string): Promise<boolean> {
  try {
    const users = await usersForEmail(normalize(email));
    return users.some((u) => !!u.privateMetadata?.[UNSUBSCRIBED_AT_KEY]);
  } catch (err) {
    console.error("[unsubscribe] opt-out lookup failed — sending anyway:", err);
    return false;
  }
}

/** Adds the address to Resend's suppression list. Best effort. */
async function suppressInResend(email: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/suppressions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      console.error(`[unsubscribe] Resend suppression returned ${res.status}`);
    }
    return res.ok;
  } catch (err) {
    console.error("[unsubscribe] Resend suppression failed:", err);
    return false;
  }
}

/**
 * Opts the address out of all app email. Idempotent. Returns false only when
 * the opt-out could not be recorded anywhere.
 */
export async function unsubscribeEmail(email: string): Promise<boolean> {
  const address = normalize(email);
  let recorded = false;

  try {
    const clerk = await clerkClient();
    const users = await usersForEmail(address);
    const now = new Date().toISOString();
    for (const user of users) {
      if (user.privateMetadata?.[UNSUBSCRIBED_AT_KEY]) {
        recorded = true;
        continue;
      }
      await clerk.users.updateUserMetadata(user.id, {
        privateMetadata: { [UNSUBSCRIBED_AT_KEY]: now },
      });
      recorded = true;
    }
  } catch (err) {
    console.error("[unsubscribe] could not record opt-out in Clerk:", err);
  }

  const suppressed = await suppressInResend(address);
  console.log(
    `[unsubscribe] opt-out recorded clerk=${recorded} resend=${suppressed}`,
  );
  return recorded || suppressed;
}
