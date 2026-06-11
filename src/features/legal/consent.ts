// Edge-safe source of truth for which legal documents a school user must accept
// and the version currently in force. Imported by `src/middleware.ts`, which runs
// on the edge — this module MUST NOT import React/.tsx (e.g. school/policies, which
// pulls in ut.tsx) or any Node-only API. It only deals in plain version strings.
//
// `getOrgConfig` is safe here: src/features/school/registry/registry.ts has only
// type-level imports and exports plain config objects.

import { getOrgConfig } from "@/features/school/registry/registry";

export type ConsentDocument = "privacy_policy"; // future: | "terms_of_service"

export type RequiredConsent = {
  document: ConsentDocument;
  version: string;
};

/** Fallback when an org config doesn't pin a privacy-policy version. */
export const DEFAULT_PRIVACY_POLICY_VERSION = "2026-06-01";

/**
 * The documents a user of `slug` must accept, paired with the version currently in
 * force. Returns a list so Terms & Conditions can be added later (push another entry
 * + a second metadata flag) without rearchitecting. Bump a version — here or in the
 * org config — to force every affected user to re-consent.
 */
export function getRequiredConsents(slug: string): RequiredConsent[] {
  const cfg = getOrgConfig(slug);
  const version = cfg?.privacyPolicy?.version ?? DEFAULT_PRIVACY_POLICY_VERSION;
  return [{ document: "privacy_policy", version }];
}

/** The single privacy-policy version a user of `slug` must currently have accepted. */
export function getRequiredPrivacyPolicyVersion(slug: string): string {
  const required = getRequiredConsents(slug).find(
    (c) => c.document === "privacy_policy",
  );
  return required?.version ?? DEFAULT_PRIVACY_POLICY_VERSION;
}

/**
 * True when the user has already accepted the privacy-policy version in force.
 * Null/undefined (no row yet, or DB unreachable) → false → fail-closed.
 */
export function isConsentSatisfied(
  acceptedVersion: string | null | undefined,
  requiredVersion: string,
): boolean {
  return acceptedVersion === requiredVersion;
}
