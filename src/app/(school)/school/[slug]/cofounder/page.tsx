import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import CoFounderPanel from "@/features/cofounder/CoFounderPanel";
import { getOrganizationBySlug } from "@/features/school/data/organizations";

export default async function CoFounderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-base font-semibold text-[var(--ui-text)]">Co-Founders</h1>
      </div>

      <Link
        href={`/school/${slug}/dashboard`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
      >
        <FaArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>

      <CoFounderPanel slug={slug} allowedDomains={org?.allowed_email_domains ?? []} />
    </div>
  );
}
