import { getResendClient, EMAIL_FROM } from "./client";
import { EmailType, EmailVariablesByType } from "./catalog";
import { resolveTemplateId } from "./templateResolver";
import {
  buildUnsubscribeUrls,
  isEmailUnsubscribed,
  UNSUBSCRIBE_MAILTO,
} from "./unsubscribe";

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "no_api_key" | "send_error" | "unsubscribed" };

export async function sendTemplateEmail<T extends EmailType>({
  type,
  to,
  variables,
  orgSlug,
  from = EMAIL_FROM,
  subject,
  idempotencyKey,
}: {
  type: T;
  to: string;
  variables: EmailVariablesByType[T];
  orgSlug?: string | null;
  from?: string;
  /** Overrides the subject stored on the hosted template. */
  subject?: string;
  /** Sent as Resend's Idempotency-Key header so a repeated call is not sent twice. */
  idempotencyKey?: string;
}): Promise<SendResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[email] no_api_key — skipping ${type} to ${to}`);
    return { ok: false, reason: "no_api_key" };
  }

  // The recipient opted out of all email on the unsubscribe page.
  if (await isEmailUnsubscribed(to)) {
    console.log(`[email] skipping ${type}: recipient unsubscribed`);
    return { ok: false, reason: "unsubscribed" };
  }

  const templateId = resolveTemplateId(type, orgSlug);
  const unsubscribe = buildUnsubscribeUrls(to);
  // Every template's footer links to {{{unsubscribeUrl}}}, the UT newsletter
  // (sent through the admin announcement tool) included.
  const templateVariables = {
    ...variables,
    unsubscribeUrl: unsubscribe?.pageUrl ?? UNSUBSCRIBE_MAILTO,
  };
  // Lets Gmail, Apple Mail and Outlook show their own Unsubscribe button.
  const headers = unsubscribe
    ? {
        "List-Unsubscribe": `<${unsubscribe.oneClickUrl}>, <${UNSUBSCRIBE_MAILTO}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      }
    : undefined;

  try {
    const result = (await (
      resend.emails.create as unknown as (
        o: Record<string, unknown>,
        opts?: { idempotencyKey?: string },
      ) => Promise<{ data?: { id?: string } | null; error?: unknown }>
    )(
      {
        from,
        to,
        ...(subject ? { subject } : {}),
        template: { id: templateId, variables: templateVariables },
        ...(headers ? { headers } : {}),
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    ));

    // Resend does NOT throw on API errors — it returns { data, error }.
    if (result?.error) {
      console.error(`[email] send_error for ${type} to ${to}:`, result.error);
      return { ok: false, reason: "send_error" };
    }

    console.log(`[email] sent ${type} to ${to} (id: ${result?.data?.id ?? "unknown"})`);
    return { ok: true };
  } catch (err) {
    console.error(`[email] send_error for ${type} to ${to}:`, err);
    return { ok: false, reason: "send_error" };
  }
}
