import { clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { sendWeeklyProfileViewsEmail } from "../emails/weeklyProfileViews";
import type { LifecycleResult } from "./index";

/**
 * Sends the weekly "X users viewed your profile" email to all users who had
 * at least one first-time engaged view (dwell >10s AND scroll-to-bottom) in
 * the last 7 days. Only the week the first-ever view lands counts — returning
 * viewers never recount.
 */
export async function runWeeklyProfileViews(): Promise<LifecycleResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const cutoff = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Each row is a unique (viewer, target) pair — no DISTINCT needed.
  const { data: viewRows, error } = await supabase
    .from("profile_views")
    .select("target_user_id")
    .gte("viewed_at", cutoff);

  if (error) {
    console.error("[weeklyProfileViews] failed to query profile_views:", error);
    return { name: "weeklyProfileViews", candidates: 0, sent: 0, skipped: 0, failed: 1 };
  }

  // Aggregate view counts per target user.
  const viewCountByUser = new Map<string, number>();
  for (const row of viewRows ?? []) {
    viewCountByUser.set(
      row.target_user_id,
      (viewCountByUser.get(row.target_user_id) ?? 0) + 1,
    );
  }

  if (viewCountByUser.size === 0) {
    return { name: "weeklyProfileViews", candidates: 0, sent: 0, skipped: 0, failed: 0 };
  }

  const targetUserIds = [...viewCountByUser.keys()];

  // Resolve Clerk user details in one batched call.
  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({
    userId: targetUserIds,
    limit: targetUserIds.length,
  });

  type Candidate = {
    userId: string;
    email: string;
    firstName: string | null;
    organizationId: string | null;
    viewCount: number;
  };

  const candidates: Candidate[] = [];
  for (const user of users) {
    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
    if (!email) continue;

    candidates.push({
      userId: user.id,
      email,
      firstName: user.firstName ?? null,
      organizationId:
        (user.publicMetadata?.organization_id as string | undefined) ?? null,
      viewCount: viewCountByUser.get(user.id) ?? 1,
    });
  }

  // Batch-resolve org slugs for school-branded emails.
  const orgIds = [
    ...new Set(
      candidates
        .map((c) => c.organizationId)
        .filter((id): id is string => !!id),
    ),
  ];
  const orgSlugById = new Map<string, string>();
  if (orgIds.length > 0) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, slug")
      .in("id", orgIds);
    for (const org of orgs ?? []) {
      if (org.slug) orgSlugById.set(org.id, org.slug);
    }
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of candidates) {
    const result = await sendWeeklyProfileViewsEmail({
      userId: c.userId,
      email: c.email,
      firstName: c.firstName,
      viewCount: c.viewCount,
      orgSlug: c.organizationId
        ? (orgSlugById.get(c.organizationId) ?? null)
        : null,
    });
    if (result === "sent") sent++;
    else if (result === "skipped") skipped++;
    else failed++;
  }

  return {
    name: "weeklyProfileViews",
    candidates: candidates.length,
    sent,
    skipped,
    failed,
  };
}
