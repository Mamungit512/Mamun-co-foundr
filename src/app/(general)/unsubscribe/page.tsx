import {
  isEmailUnsubscribed,
  readUnsubscribeParams,
} from "@/lib/email/unsubscribe";
import Card from "./Card";
import UnsubscribeForm from "./UnsubscribeForm";

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
 * Landing page for the footer Unsubscribe link. Opting out needs one button
 * press (not just opening the page), so link scanners can't unsubscribe anyone.
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

  if (await isEmailUnsubscribed(email)) {
    return (
      <Card title="You're already unsubscribed">
        <p>We don&apos;t send any emails to {maskEmail(email)}.</p>
        <p>
          Changed your mind? Email{" "}
          <a className="text-[#bf5700] underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </Card>
    );
  }

  return <UnsubscribeForm e={e!} t={t!} maskedEmail={maskEmail(email)} contact={CONTACT} />;
}
