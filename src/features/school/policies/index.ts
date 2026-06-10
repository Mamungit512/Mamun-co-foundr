import type { ComponentType } from "react";
import UTPolicy from "./ut";

const SCHOOL_POLICY_REGISTRY: Record<string, ComponentType<{ primaryColor: string }>> = {
  ut: UTPolicy,
};

export function getSchoolPolicyComponent(
  slug: string,
): ComponentType<{ primaryColor: string }> | null {
  return SCHOOL_POLICY_REGISTRY[slug] ?? null;
}
