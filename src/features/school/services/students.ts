import { createClient } from "@supabase/supabase-js";

export type StudentRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  education: string | null;
  city: string | null;
  country: string | null;
  is_technical: boolean | null;
  created_at: string;
  deleted_at: string | null;
};

export async function getStudents(orgId: string): Promise<StudentRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "user_id, first_name, last_name, title, education, city, country, is_technical, created_at, deleted_at",
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch students");
  return data ?? [];
}
