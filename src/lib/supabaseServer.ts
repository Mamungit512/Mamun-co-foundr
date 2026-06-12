import { auth } from "@clerk/nextjs/server";
import { createSupabaseClientWithToken } from "./supabaseClient";

/**
 * Server-side Supabase client that runs AS THE SIGNED-IN USER, so RLS applies.
 * Swap-in for the SERVICE_ROLE_KEY clients (which bypass RLS) when converting a
 * route to enforce org isolation in the DB. `getToken()` is template-less on
 * purpose — that's the native Clerk↔Supabase integration; it only takes effect
 * once `[auth.third_party.clerk]` is enabled. Keep app-layer org filters too.
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    throw new Error(
      "createServerSupabaseClient: no Clerk session token (caller must be authenticated)",
    );
  }
  return createSupabaseClientWithToken(token);
}
