// --- Service backend functions that relate to user authorization (e.g. checking if user is an admin) ---

import { createSupabaseClientWithToken } from "@/lib/supabaseClient";

// Check if user is an admin
export async function isUserAdmin(
  userId: string,
  token: string,
): Promise<{ success: boolean; error?: string; is_admin?: boolean }> {
  if (!userId) return { success: false, error: "Missing user ID" };

  const supabase = createSupabaseClientWithToken(token);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Failed to check admin status:", error);
    throw error;
    return { success: false };
  }

  return { success: true, is_admin: profile?.is_admin };
}
