export function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isEmailDomainAllowed(
  email: string,
  allowedDomains: string[],
): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  const domain = getEmailDomain(email);
  if (!domain) return false;
  return allowedDomains.some((d) => d.trim().toLowerCase() === domain);
}

export function formatAllowedDomainsForCopy(domains: string[]): string {
  const cleaned = domains.map((d) => `@${d}`);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} or ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, or ${cleaned[cleaned.length - 1]}`;
}
