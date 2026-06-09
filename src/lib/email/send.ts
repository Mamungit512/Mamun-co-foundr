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
    const result = (await (
      resend.emails.create as unknown as (
        o: Record<string, unknown>,
      ) => Promise<{ data?: { id?: string } | null; error?: unknown }>
    )({
      from,
      to,
      template: { id: templateId, variables },
    }));

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
