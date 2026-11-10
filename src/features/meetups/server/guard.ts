import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isMeetupsEnabled } from "../flag";
import { getOrgSlugById } from "./data";

export type MeetupsContext = { userId: string; orgId: string; slug: string };

export const notFound = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });

/**
 * Guard for the student meetups routes. Returns the caller's context, or a
 * response to return early:
 *   401 signed out
 *   404 flag off for the caller's school, or no school (the feature "does not exist")
 * Pair membership is checked per route, after this.
 */
export async function requireMeetupsAccess(): Promise<MeetupsContext | NextResponse> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = sessionClaims?.metadata?.organization_id as string | undefined;
  if (!orgId) return notFound();

  const slug = await getOrgSlugById(orgId);
  if (!slug || !isMeetupsEnabled(slug)) return notFound();

  return { userId, orgId, slug };
}
