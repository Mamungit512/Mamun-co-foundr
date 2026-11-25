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

/**
 * Base URL for links in a school's emails: the school's own subdomain
 * (e.g. https://ut.mamuncofoundr.com), where middleware serves /school/<slug>/*
 * at the root. Falls back to the general app URL when there is no school.
 */
export function getOrgAppUrl(orgSlug?: string | null): string {
  return orgSlug ? `https://${orgSlug}.mamuncofoundr.com` : getAppUrl();
}
