import { Resend } from "resend";

let _client: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY);
  return _client;
}

export const EMAIL_FROM = "Mamun Co-Foundr <mamun@mamuncofoundr.com>";

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://mamuncofoundr.com";
}
