import { useCallback, useMemo } from "react";
import { FLOW_STEPS, type FlowStep } from "@/features/school/onboarding/quick/constants";
import type { QuickUi } from "@/features/school/onboarding/quick/validation";

export type QuickDraft = {
  userId: string;
  step: FlowStep;
  data: OnboardingData;
  ui: QuickUi;
};

const storageKey = (slug: string) => `school_quick_onboarding:${slug}`;

// Saves progress to localStorage on every change. Unlike useOnboardingDraft
// (which drops the photo so another account on the same browser can't reuse
// it), drafts here are keyed to the Clerk user and ignored for anyone else,
// so the face-checked pfp_url can be kept and a returning user isn't sent
// back to re-upload it.
export function useQuickDraft(slug: string, userId: string | null | undefined) {
  const load = useCallback((): QuickDraft | null => {
    if (!userId) return null;
    try {
      const raw = localStorage.getItem(storageKey(slug));
      const parsed: QuickDraft | null = raw ? JSON.parse(raw) : null;
      if (!parsed || parsed.userId !== userId) return null;
      return {
        userId,
        step: FLOW_STEPS.includes(parsed.step) ? parsed.step : 2,
        data: parsed.data ?? {},
        ui: parsed.ui ?? {},
      };
    } catch {
      return null;
    }
  }, [slug, userId]);

  const save = useCallback(
    (step: FlowStep, data: OnboardingData, ui: QuickUi): boolean => {
      if (!userId) return false;
      try {
        const draft: QuickDraft = { userId, step, data, ui };
        localStorage.setItem(storageKey(slug), JSON.stringify(draft));
        return true;
      } catch {
        // Storage full or unavailable
        return false;
      }
    },
    [slug, userId],
  );

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(slug));
    } catch {
      // fail silently
    }
  }, [slug]);

  return useMemo(() => ({ load, save, clear }), [load, save, clear]);
}
