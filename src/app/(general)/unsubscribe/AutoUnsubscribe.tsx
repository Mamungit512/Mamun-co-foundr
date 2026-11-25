"use client";

import { useEffect, useState } from "react";
import Card from "./Card";

/**
 * Unsubscribes as soon as the page opens in a browser, then confirms it.
 * The request runs from the browser (not the server render), so mail
 * security scanners that only fetch the link don't unsubscribe anyone.
 */
export default function AutoUnsubscribe({
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
  const [status, setStatus] = useState<"working" | "done" | "error">("working");

  useEffect(() => {
    const query = new URLSearchParams({ e, t }).toString();
    fetch(`/api/unsubscribe?${query}`, { method: "POST" })
      .then((res) => setStatus(res.ok ? "done" : "error"))
      .catch(() => setStatus("error"));
  }, [e, t]);

  if (status === "working") {
    return (
      <Card title="Unsubscribing…">
        <p>One moment.</p>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card title="Something went wrong">
        <p>
          Please try again, or email{" "}
          <a className="text-[#bf5700] underline" href={`mailto:${contact}?subject=Unsubscribe`}>
            {contact}
          </a>{" "}
          and we&apos;ll unsubscribe you.
        </p>
      </Card>
    );
  }

  return (
    <Card title="You've been unsubscribed">
      <p>We won&apos;t send any more emails to {maskedEmail}.</p>
      <p>
        Changed your mind? Email{" "}
        <a className="text-[#bf5700] underline" href={`mailto:${contact}`}>{contact}</a>.
      </p>
    </Card>
  );
}
