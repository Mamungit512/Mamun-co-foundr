const STORAGE_KEY = "onboarding_draft";

// The profile photo is step 1 in both the standard and school onboarding flows.
const PHOTO_STEP = 1;

type OnboardingDraft = {
  step: number;
  data: OnboardingData;
};

// The profile photo must never be cached in localStorage. The photo forms treat
// a cached pfp_url/photoUploaded as "already uploaded" and skip the upload + face
// validation, which would let a different account on the same browser bypass the
// required photo. It must be re-uploaded every session.
function stripPhoto(data: OnboardingData): OnboardingData {
  const sanitized: OnboardingData & { photoUploaded?: boolean } = { ...data };
  delete sanitized.pfp_url;
  delete sanitized.photoUploaded;
  return sanitized;
}

export function useOnboardingDraft() {
  const load = (): OnboardingDraft | null => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: OnboardingDraft | null = raw ? JSON.parse(raw) : null;
      if (!parsed) return null;

      // Strip the photo even on read so legacy drafts (saved before this guard)
      // can't pre-fill it. Since the photo is never restored, drop the user back
      // to the photo step to force a re-upload — all other answers are preserved.
      const data = stripPhoto(parsed.data ?? {});
      return { step: PHOTO_STEP, data };
    } catch {
      return null;
    }
  };

  const save = (step: number, data: OnboardingData) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, data: stripPhoto(data) }),
      );
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
