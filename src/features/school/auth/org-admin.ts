import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function getVerifiedPrimaryEmail(
  userId: string,
): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    );
    if (!primary || primary.verification?.status !== "verified") return null;
    return primary.emailAddress.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Global platform-admin emails configured via env var, comma-separated.
 * Lets us grant admin access without a DB migration/PR.
 */
export function getEnvAdminEmails(): string[] {
  return (
    process.env.ADMIN_EMAILS?.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

export async function getOrgAdminEmails(orgId: string): Promise<string[]> {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", orgId)
    .single();
  const dbEmails: string[] = data?.settings?.admin_emails ?? [];
  const emails = [...dbEmails.map((e) => e.trim().toLowerCase()), ...getEnvAdminEmails()];
  return Array.from(new Set(emails));
}

export async function isOrgAdmin({
  orgId,
  email,
}: {
  orgId: string;
  email: string;
}): Promise<boolean> {
  const adminEmails = await getOrgAdminEmails(orgId);
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Server-side guard for org-admin API routes.
 * Returns { userId, orgId, email } on success, or a NextResponse (401/403) to return early.
 */
export async function requireOrgAdmin(): Promise<
  { userId: string; orgId: string; email: string } | NextResponse
> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = sessionClaims?.metadata?.organization_id as string | undefined;
  if (!orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const email = await getVerifiedPrimaryEmail(userId);
  if (!email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await isOrgAdmin({ orgId, email }))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { userId, orgId, email };
}
