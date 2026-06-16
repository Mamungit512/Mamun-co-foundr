import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/features/school/data/organizations";
import UtContactTabs from "@/features/school/components/contact/UtContactTabs";

export default async function UtContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);

  if (!org || slug !== "ut") notFound();

  return (
    <>
      <section className="section-padding flex-1 px-6 pt-16 pb-24" style={{ backgroundColor: "#d6d2c4" }}>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: "#333f48" }}>Contact</h1>
            <p style={{ color: "rgba(51,63,72,0.65)" }}>
              Get in touch with the UT co-foundr team.
            </p>
          </header>
          <UtContactTabs />
        </div>
      </section>
    </>
  );
}
