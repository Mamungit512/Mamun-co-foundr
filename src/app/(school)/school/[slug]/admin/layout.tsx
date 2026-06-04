import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getVerifiedPrimaryEmail, isOrgAdmin } from "@/features/school/auth/org-admin";

async function getOrgBySlug(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();
  return data as { id: string } | null;
}

export default async function SchoolAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrgBySlug(slug);
  if (!org) notFound();

  const { userId } = await auth();
  if (!userId) notFound();

  const email = await getVerifiedPrimaryEmail(userId);
  if (!email) notFound();

  const allowed = await isOrgAdmin({ orgId: org.id, email });
  if (!allowed) notFound();

  return <>{children}</>;
}
