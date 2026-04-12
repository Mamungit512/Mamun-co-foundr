import { redirect } from "next/navigation";

// School users edit their profile through the same API-backed form.
// We redirect to the general edit-profile page which is API-driven and org-agnostic.
export default async function SchoolProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The edit-profile page uses API routes that already respect organization_id.
  // We redirect back to the school dashboard after saving via a returnUrl param.
  redirect(`/edit-profile?returnUrl=/school/${slug}/dashboard`);
}
