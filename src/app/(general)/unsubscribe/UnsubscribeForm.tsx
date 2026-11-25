"use client";

import { useActionState } from "react";
import Card from "./Card";
import { confirmUnsubscribe, type UnsubscribeState } from "./actions";

const initial: UnsubscribeState = { status: "idle" };

export default function UnsubscribeForm({
  e,
  t,
  maskedEmail,
  contact,
}: {
  e: string;
  t: string;
  maskedEmail: string;
  contact: string;
}) {
  const [state, action, pending] = useActionState(confirmUnsubscribe, initial);

  if (state.status === "done") {
    return (
      <Card title="You're unsubscribed">
        <p>We won&apos;t send any more emails to {maskedEmail}.</p>
        <p>Your profile stays as it is, and you can still log in anytime.</p>
        <p>
          Changed your mind? Email{" "}
          <a className="text-[#bf5700] underline" href={`mailto:${contact}`}>{contact}</a>.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Unsubscribe from all emails?">
      <p>
        You&apos;ll stop getting every email from UT co-foundr matching at{" "}
        <strong className="font-semibold text-gray-900">{maskedEmail}</strong>: newsletters,
        reminders, weekly summaries, and match and meetup alerts.
      </p>
      <form action={action} className="pt-2">
        <input type="hidden" name="e" value={e} />
        <input type="hidden" name="t" value={t} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#bf5700] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white hover:bg-[#a34a00] disabled:opacity-60"
        >
          {pending ? "Unsubscribing…" : "Unsubscribe"}
        </button>
      </form>
      {state.status === "error" && (
        <p className="text-sm text-red-700">
          Something went wrong. Please try again, or email{" "}
          <a className="underline" href={`mailto:${contact}?subject=Unsubscribe`}>{contact}</a>.
        </p>
      )}
      <p className="text-sm text-gray-500">Your profile stays as it is, and you can still log in anytime.</p>
    </Card>
  );
}
