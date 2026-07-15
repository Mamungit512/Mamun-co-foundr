import type { useSignIn, useAuth } from "@clerk/nextjs";
import type { useRouter } from "next/navigation";
import { assignSchoolOrg } from "@/features/school/auth/school-auth";

type SetActive = NonNullable<ReturnType<typeof useSignIn>["setActive"]>;
type GetToken = ReturnType<typeof useAuth>["getToken"];
type Router = ReturnType<typeof useRouter>;

/**
 * Shared tail of every successful school auth flow (sign-in and password
 * reset): activate the Clerk session, (re-)assign the user to the school org,
 * refresh the JWT so the new org metadata is on the token, then redirect into
 * the portal. Returns `{ error }` when org assignment fails so the caller can
 * surface it in its error banner.
 */
export async function completeSchoolSignIn(opts: {
  setActive: SetActive;
  getToken: GetToken;
  router: Router;
  slug: string;
  sessionId: string | null;
  afterAuthRedirect?: string | null;
}): Promise<{ error?: string }> {
  const { setActive, getToken, router, slug, sessionId, afterAuthRedirect } =
    opts;

  await setActive({ session: sessionId });
  const assigned = await assignSchoolOrg(slug);
  if ("error" in assigned) {
    return { error: assigned.error };
  }
  await getToken({ skipCache: true });
  router.push(afterAuthRedirect ?? `/school/${slug}`);
  return {};
}
