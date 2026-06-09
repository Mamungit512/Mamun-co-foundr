import { getResendClient, EMAIL_FROM } from "./client";
import { EMAIL_CATALOG, EmailType, EmailVariablesByType } from "./catalog";

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "no_api_key" | "send_error" };

export async function sendTemplateEmail<T extends EmailType>({
  type,
  to,
  variables,
  from = EMAIL_FROM,
}: {
  type: T;
  to: string;
  variables: EmailVariablesByType[T];
  from?: string;
}): Promise<SendResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[email] no_api_key — skipping ${type} to ${to}`);
    return { ok: false, reason: "no_api_key" };
  }

  const { templateId } = EMAIL_CATALOG[type];

  try {
    await (
      resend.emails.create as unknown as (
        o: Record<string, unknown>,
      ) => Promise<unknown>
    )({
      from,
      to,
      template: { id: templateId, variables },
    });
    console.log(`[email] sent ${type} to ${to}`);
    return { ok: true };
  } catch (err) {
    console.error(`[email] send_error for ${type} to ${to}:`, err);
    return { ok: false, reason: "send_error" };
  }
}
