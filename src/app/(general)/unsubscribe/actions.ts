"use server";

import { readUnsubscribeParams, unsubscribeEmail } from "@/lib/email/unsubscribe";

export type UnsubscribeState = { status: "idle" | "done" | "error" };

/** Form action for the Unsubscribe button. Re-verifies the signed link. */
export async function confirmUnsubscribe(
  _prev: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const email = readUnsubscribeParams(
    formData.get("e")?.toString(),
    formData.get("t")?.toString(),
  );
  if (!email) return { status: "error" };
  return { status: (await unsubscribeEmail(email)) ? "done" : "error" };
}
