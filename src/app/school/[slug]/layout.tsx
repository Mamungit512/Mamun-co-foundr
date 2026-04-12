import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import SchoolHeader from "@/components/school/SchoolHeader";

async function getOrganizationBySlug(slug: string): Promise<OrganizationFromDb | null> {
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

export default async function SchoolSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-(--charcoal-black) text-(--mist-white)">
      <SchoolHeader slug={slug} schoolName={org.name} />
      <main>{children}</main>
    </div>
  );
}
