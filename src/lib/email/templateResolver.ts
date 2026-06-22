import { getOrgConfig } from "@/features/school/registry/registry";
import { EMAIL_CATALOG, EmailType } from "./catalog";

export function resolveTemplateId(
  type: EmailType,
  orgSlug?: string | null,
): string {
  if (orgSlug) {
    const override = getOrgConfig(orgSlug)?.emailTemplates?.[type];
    if (override) return override;
  }
  return EMAIL_CATALOG[type].templateId;
}
