import { createClient } from "@supabase/supabase-js";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  type: string;
  allowed_email_domains: string[];
  ferpa_dpa_signed_at: string | null;
  suppress_tracking: boolean;
  settings: Record<string, unknown> | null;
};

export async function getOrganizationBySlug(
  slug: string,
): Promise<Organization | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .eq("type", "school")
    .single();

  return data ?? null;
}
