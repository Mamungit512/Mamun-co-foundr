const STORAGE_KEY = "onboarding_draft";

type OnboardingDraft = {
  step: number;
  data: OnboardingData;
};

export function useOnboardingDraft() {
  const load = (): OnboardingDraft | null => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const save = (step: number, data: OnboardingData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
    } catch {
      // Storage full or unavailable — fail silently
    }
  };

  const clear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // fail silently
    }
  };

  return { load, save, clear };
}
