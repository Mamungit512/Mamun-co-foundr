import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import AcceptInviteClient from "./AcceptInviteClient";

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const { userId } = await auth();

  const supabase = supa();

  const { data: invite } = await supabase
    .from("cofounder_invites")
    .select("id, inviter_user_id, organization_id, status, expires_at, invitee_role, note")
    .eq("token", token)
    .single();

  if (!invite) notFound();

  // Expired/revoked/declined invites → show a clear message
  if (invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#e8e4dc] bg-white p-8 text-center shadow-sm">
          <p className="text-base font-semibold" style={{ color: "#333f48" }}>
            This invite is no longer valid
          </p>
          <p className="mt-2 text-sm" style={{ color: "#9cadb7" }}>
            It may have expired, been revoked, or already accepted.
          </p>
          <Link
            href={`/school/${slug}/dashboard`}
            className="mt-6 inline-block cursor-pointer rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#bf5700" }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Load inviter profile for preview
  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name, title, pfp_url")
    .eq("user_id", invite.inviter_user_id)
    .single();

  const inviterName =
    [inviterProfile?.first_name, inviterProfile?.last_name].filter(Boolean).join(" ") ||
    "Someone";

  // Signed out — prompt to sign in, then return here
  if (!userId) {
    const returnUrl = `/school/${slug}/invite/${token}`;
    const signInUrl = `/school/${slug}/sign-in?redirect=${encodeURIComponent(returnUrl)}`;
    const signUpUrl = `/school/${slug}/sign-up?redirect=${encodeURIComponent(returnUrl)}`;
    const initials = inviterName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#e8e4dc] bg-white p-8 text-center shadow-sm">
          {inviterProfile?.pfp_url ? (
            <Image
              src={inviterProfile.pfp_url}
              alt={inviterName}
              width={72}
              height={72}
              className="mx-auto mb-4 rounded-full object-cover"
            />
          ) : (
            <div
              className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: "#bf5700", width: 72, height: 72 }}
            >
              {initials}
            </div>
          )}
          <h1 className="text-xl font-semibold" style={{ color: "#333f48" }}>
            {inviterName} wants to link as co-founders
          </h1>
          {inviterProfile?.title && (
            <p className="mt-1 text-sm" style={{ color: "#9cadb7" }}>
              {inviterProfile.title}
            </p>
          )}
          <p className="mt-4 text-sm" style={{ color: "#9cadb7" }}>
            Sign in or create an account to accept this invite.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={signInUrl}
              className="cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#bf5700" }}
            >
              Sign in
            </Link>
            <Link
              href={signUpUrl}
              className="cursor-pointer rounded-xl border border-[#e8e4dc] px-4 py-3 text-sm font-medium transition hover:bg-[#faf8f4]"
              style={{ color: "#333f48" }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Inviter can't accept their own invite
  if (userId === invite.inviter_user_id) {
    redirect(`/school/${slug}/dashboard`);
  }

  return (
    <AcceptInviteClient
      slug={slug}
      token={token}
      inviterName={inviterName}
      inviterTitle={inviterProfile?.title ?? null}
      inviterPfpUrl={inviterProfile?.pfp_url ?? null}
      inviteeRole={invite.invitee_role ?? null}
      note={invite.note ?? null}
    />
  );
}
