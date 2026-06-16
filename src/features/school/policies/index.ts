import type { ComponentType } from "react";
import UTPolicy from "./ut";
import UTTerms from "./ut-terms";

const SCHOOL_POLICY_REGISTRY: Record<string, ComponentType<{ primaryColor: string }>> = {
  ut: UTPolicy,
};

const SCHOOL_TERMS_REGISTRY: Record<string, ComponentType<{ primaryColor: string }>> = {
  ut: UTTerms,
};

export function getSchoolPolicyComponent(
  slug: string,
): ComponentType<{ primaryColor: string }> | null {
  return SCHOOL_POLICY_REGISTRY[slug] ?? null;
}

export function getSchoolTermsComponent(
  slug: string,
): ComponentType<{ primaryColor: string }> | null {
  return SCHOOL_TERMS_REGISTRY[slug] ?? null;
}
