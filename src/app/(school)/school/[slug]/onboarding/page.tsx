"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

import { completeOnboarding } from "@/app/(general)/onboarding/_actions";
import { useUserProfile } from "@/features/profile/useProfile";
import { useStepTransition } from "@/hooks/useOnboardingAnimation";
import { useSchool } from "@/features/school/components/SchoolContext";
import { getOrgConfig } from "@/features/school/registry/registry";
import {
  getGatedFeatureLabel,
  resolvePostOnboardingRedirect,
} from "@/features/school/onboarding/onboardingRedirect";
import { DEFAULT_LOCATION, SHELL_COPY, type FlowStep } from "@/features/school/onboarding/quick/constants";
import DoneScreen from "@/features/school/onboarding/quick/DoneScreen";
import FitCard from "@/features/school/onboarding/quick/FitCard";
import { Banner, PreviewPanel, QuickShell, StepCard } from "@/features/school/onboarding/quick/QuickShell";
import StepAbout from "@/features/school/onboarding/quick/StepAbout";
import StepBring from "@/features/school/onboarding/quick/StepBring";
import StepLooking from "@/features/school/onboarding/quick/StepLooking";
import { BTN_GHOST_SMALL_CLS, BTN_SMALL_CLS, FOCUS_CLS, useToast } from "@/features/school/onboarding/quick/ui";
import { useQuickDraft } from "@/features/school/onboarding/quick/useQuickDraft";
import {
  firstIncompleteStep,
  formatMissing,
  missingFor,
  normalizeUi,
  type QuickUi,
} from "@/features/school/onboarding/quick/validation";

const STEP_COPY: Record<FlowStep, { title: string; help: string; primary: string }> = {
  2: {
    title: "About you",
    help: "How UT counts founders in the cohort, plus how you show up on your card.",
    primary: "Continue",
  },
  3: {
    title: "What do you bring to a founding team?",
    help: "This fills the “Brings” box on your Fit Card.",
    primary: "Continue",
  },
  4: {
    title: "What are you looking for?",
    help: "This shapes who shows up in your matches.",
    primary: "Finish my profile",
  },
};

const SAVED_FLASH_MS = 1400;

export default function SchoolOnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const orgConfig = getOrgConfig(slug);

  const { orgId } = useSchool();
  const { user, isLoaded: userLoaded } = useUser();
  const { session } = useSession();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [gatedRedirectNotice, setGatedRedirectNotice] = useState(() => Boolean(redirectParam));
  const { data: existingProfile, isLoading: profileLoading } = useUserProfile();
  const draft = useQuickDraft(slug, user?.id);
  const { containerRef, transition } = useStepTransition();
  const { toast, toastNode } = useToast();

  const [step, setStep] = useState<FlowStep>(2);
  const [data, setData] = useState<OnboardingData>({});
  const [ui, setUi] = useState<QuickUi>({});
  const [initialized, setInitialized] = useState(false);
  const [done, setDone] = useState(false);
  const [resumeBanner, setResumeBanner] = useState<FlowStep | null>(null);
  const [preFilledNotice, setPreFilledNotice] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const baseDataRef = useRef<OnboardingData>({});
  const pendingSaveRef = useRef(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigatedRef = useRef(false);

  // Seed answers from (in order) the existing profile, the Clerk account and
  // UT defaults, then layer any saved draft on top.
  useEffect(() => {
    if (initialized || !userLoaded || profileLoading) return;

    const hasProfile = !!(
      existingProfile &&
      (existingProfile.firstName || existingProfile.personalIntro || existingProfile.pfp_url)
    );
    const base: OnboardingData = { ...(hasProfile ? existingProfile : {}) };
    base.firstName ||= user?.firstName ?? undefined;
    base.lastName ||= user?.lastName ?? undefined;
    if (!base.city && !base.country) Object.assign(base, DEFAULT_LOCATION);
    baseDataRef.current = base;

    const savedDraft = draft.load();
    if (savedDraft) {
      const merged = { ...base, ...savedDraft.data };
      const restoredUi = normalizeUi(merged, savedDraft.ui);
      const firstIncomplete = firstIncompleteStep(merged, restoredUi);
      const resumeAt =
        firstIncomplete !== null && firstIncomplete < savedDraft.step ? firstIncomplete : savedDraft.step;
      setData(merged);
      setUi(restoredUi);
      setStep(resumeAt);
      setResumeBanner(resumeAt);
    } else {
      setData(base);
      setUi(normalizeUi(base, {}));
      setPreFilledNotice(hasProfile);
    }
    setInitialized(true);
  }, [initialized, userLoaded, profileLoading, existingProfile, user, draft]);

  const update = useCallback((patch: Partial<OnboardingData>, uiPatch?: Partial<QuickUi>) => {
    pendingSaveRef.current = true;
    setData((prev) => ({ ...prev, ...patch }));
    if (uiPatch) setUi((prev) => ({ ...prev, ...uiPatch }));
  }, []);

  // Every answer saves immediately; the "Saved" flash only follows user edits.
  useEffect(() => {
    if (!initialized || done) return;
    const ok = draft.save(step, data, ui);
    if (ok && pendingSaveRef.current) {
      pendingSaveRef.current = false;
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), SAVED_FLASH_MS);
    }
  }, [initialized, done, step, data, ui, draft]);

  useEffect(() => () => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
  }, []);

  // Focus the step heading and bring the card into view after each step change.
  useEffect(() => {
    if (!initialized || done) return;
    headingRef.current?.focus({ preventScroll: true });
    if (hasNavigatedRef.current) {
      containerRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [initialized, done, step, containerRef]);

  const goTo = (next: FlowStep, dir: "forward" | "back") => {
    hasNavigatedRef.current = true;
    setResumeBanner(null);
    transition(dir, () => setStep(next));
  };

  const postProfile = async (payload: OnboardingData): Promise<string | null> => {
    const token = await session?.getToken();
    if (!user?.id || !token) return "Session expired. Please refresh and try again.";

    const endpoint = orgConfig?.onboarding.apiEndpoint ?? "/api/profile";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) return result.error || "Failed to save profile. Please try again.";
    return null;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const saveError = await postProfile(data);
      if (saveError) {
        setError(saveError);
        return;
      }

      await completeOnboarding(data, { kind: "school", orgId });
      await user?.reload();
      // Force a fresh session JWT so middleware's schoolOnboarding check sees this
      // completion immediately — otherwise the next navigation can bounce right back
      // into onboarding on a stale token.
      await session?.getToken({ skipCache: true });

      draft.clear();
      setDone(true);
      window.scrollTo(0, 0);
      toast(
        <>
          <b>You’re in the founder pool.</b> Your matches are ready.
        </>,
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Done-screen boosts re-save the whole profile with the new field merged in.
  const saveBoost = async (patch: Partial<OnboardingData>) => {
    const merged = { ...data, ...patch };
    try {
      if (await postProfile(merged)) return false;
    } catch {
      return false;
    }
    setData(merged);
    return true;
  };

  const startOver = () => {
    draft.clear();
    pendingSaveRef.current = false;
    setData(baseDataRef.current);
    setUi(normalizeUi(baseDataRef.current, {}));
    setResumeBanner(null);
    if (step !== 2) goTo(2, "back");
  };

  if (!initialized) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ui-border)] border-t-[var(--org-primary)]" />
      </div>
    );
  }

  const missing = missingFor(step, data, ui);
  const firstName = data.firstName?.trim();

  const dismiss = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-label="Dismiss"
      className={`cursor-pointer rounded px-1 text-[var(--ui-text-subtle)] hover:text-[var(--ui-text-muted)] ${FOCUS_CLS}`}
    >
      ✕
    </button>
  );

  const banners = !done && (
    <>
      {gatedRedirectNotice && (
        <Banner actions={dismiss(() => setGatedRedirectNotice(false))}>
          Finish setting up your profile before you can {getGatedFeatureLabel(redirectParam)}.
        </Banner>
      )}
      {resumeBanner && (
        <Banner
          actions={
            <>
              <button type="button" onClick={() => setResumeBanner(null)} className={BTN_SMALL_CLS}>
                Continue
              </button>
              <button type="button" onClick={startOver} className={BTN_GHOST_SMALL_CLS}>
                Start over
              </button>
            </>
          }
        >
          <b className="text-sm text-[var(--ui-text)]">
            Welcome back{firstName ? `, ${firstName}` : ""}.
          </b>
          <br />
          You stopped on step {resumeBanner} of 4. Your answers are saved.
        </Banner>
      )}
      {preFilledNotice && (
        <Banner actions={dismiss(() => setPreFilledNotice(false))}>
          Some fields were pre-filled from your existing profile. Review and update as needed.
        </Banner>
      )}
    </>
  );

  return (
    <>
      <QuickShell
        title={done ? SHELL_COPY.doneTitle : SHELL_COPY.title}
        sub={done ? SHELL_COPY.doneSub : SHELL_COPY.sub}
        banner={banners}
        side={
          done ? undefined : (
            <PreviewPanel>
              <FitCard data={data} />
            </PreviewPanel>
          )
        }
      >
        {done ? (
          <DoneScreen
            data={data}
            matchesHref={resolvePostOnboardingRedirect(slug, redirectParam)}
            onSave={saveBoost}
            onEditAnswers={() => {
              setDone(false);
              setStep(2);
            }}
            toast={toast}
          />
        ) : (
          <div ref={containerRef} className="scroll-mt-20 will-change-transform">
            <StepCard
              ref={headingRef}
              step={step}
              saved={saved}
              title={STEP_COPY[step].title}
              help={STEP_COPY[step].help}
              // Step 1 (consent) is already recorded, so step 2 has no Back.
              onBack={step > 2 ? () => goTo((step - 1) as FlowStep, "back") : undefined}
              primaryLabel={STEP_COPY[step].primary}
              onPrimary={() => {
                if (missing.length) return;
                if (step === 4) handleSubmit();
                else goTo((step + 1) as FlowStep, "forward");
              }}
              primaryDisabled={missing.length > 0}
              busy={submitting}
              missing={formatMissing(missing)}
              error={error}
            >
              {step === 2 && <StepAbout data={data} ui={ui} update={update} />}
              {step === 3 && <StepBring data={data} ui={ui} update={update} />}
              {step === 4 && (
                <StepLooking
                  data={data}
                  ui={ui}
                  update={update}
                  onLimit={(max) => toast(`Pick up to ${max}. Tap one to remove it first.`)}
                />
              )}
            </StepCard>
          </div>
        )}
      </QuickShell>
      {toastNode}
    </>
  );
}
