import { NextResponse } from "next/server";
import { requireOrgAdmin } from "@/features/school/auth/org-admin";
import { isMeetupsEnabled } from "../flag";
import { getOrgSlugById } from "./data";
import { notFound } from "./guard";

/**
 * Guard for the school-admin meetups routes. Returns { userId, orgId, email },
 * or a response to return early:
 *   401 signed out, 403 not an admin of a school (both from requireOrgAdmin)
 *   404 the meetups flag is off for the admin's school
 * Admin first, so a non-admin learns nothing about the flag.
 */
export async function requireMeetupsAdmin(): Promise<
  { userId: string; orgId: string; email: string } | NextResponse
> {
  const admin = await requireOrgAdmin();
  if (admin instanceof NextResponse) return admin;

  const slug = await getOrgSlugById(admin.orgId);
  if (!slug || !isMeetupsEnabled(slug)) return notFound();
  return admin;
}
