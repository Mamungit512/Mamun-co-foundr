import { readUnsubscribeParams } from "@/lib/email/unsubscribe";
import AutoUnsubscribe from "./AutoUnsubscribe";
import Card from "./Card";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

const CONTACT = "support@mamuncofoundr.com";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

/**
 * Landing page for the footer Unsubscribe link. Opening it unsubscribes the
 * address (added to Resend's suppression list and flagged in Clerk) and
 * confirms it. No sign-in and no extra click.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e, t } = await searchParams;
  const email = readUnsubscribeParams(e, t);

  if (!email) {
    return (
      <Card title="This link doesn't work">
        <p>It may have been cut off when it was copied.</p>
        <p>
          Email <a className="text-[#bf5700] underline" href={`mailto:${CONTACT}?subject=Unsubscribe`}>{CONTACT}</a>{" "}
          and we&apos;ll unsubscribe you.
        </p>
      </Card>
    );
  }

  return <AutoUnsubscribe e={e!} t={t!} maskedEmail={maskEmail(email)} contact={CONTACT} />;
}
