import { createClient } from "@supabase/supabase-js";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function getOrgSlug(orgId: string): Promise<string> {
  const { data, error } = await supabase()
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .single();
  if (error || !data) throw new Error("Organization not found");
  return data.slug as string;
}

// Throws if the row cannot be written, so the caller returns no file.
export async function recordAdminExport(entry: {
  orgId: string;
  userId: string;
  email: string;
  kind: string;
  rowCount: number;
}): Promise<void> {
  const { error } = await supabase().from("admin_exports").insert({
    organization_id: entry.orgId,
    admin_user_id: entry.userId,
    admin_email: entry.email,
    kind: entry.kind,
    row_count: entry.rowCount,
  });
  if (error) throw new Error("Failed to record export");
}
