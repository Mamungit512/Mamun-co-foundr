"use client";

import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import toast from "react-hot-toast";

import {
  useSchoolProfile,
  useSchoolProfileUpsert,
  useUserProfile,
  useProfileUpsert,
} from "@/features/profile/useProfile";
import { useSchool } from "@/features/school/components/SchoolContext";
import FormInput from "@/components/ui/FormInput";
import LocationSelector from "@/components/ui/LocationSelector";
import UTSchoolFields from "@/features/school/onboarding/components/UTSchoolFields";
import { trackEvent } from "@/lib/posthog-events";

const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  {
    ssr: false,
    loading: () => (
      <div className="flex animate-pulse items-center gap-2 text-[var(--ui-text-muted)]">
        <svg
          className="h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading AI model…
      </div>
    ),
  },
);

const CHAR_LIMIT = 500;

const PILL_RADIO_CLS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] transition-all duration-150 hover:border-[var(--ui-border-strong)] hover:bg-[var(--ui-surface)] has-[:checked]:border-[var(--ui-text-muted)] has-[:checked]:bg-[var(--ui-surface-active)] has-[:checked]:text-[var(--ui-text)]";

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <p className={`text-right text-xs ${(value?.length ?? 0) > max - 50 ? "text-amber-700" : "text-[var(--ui-text-subtle)]"}`}>
      {value?.length ?? 0} / {max}
    </p>
  );
}

export default function SchoolProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isUT = slug === "ut";

  const { schoolName } = useSchool();
  const router = useRouter();
  const { session } = useSession();

  // Use UT hooks when on the UT school; fall back to general hooks for other schools
  const utProfile = useSchoolProfile();
  const generalProfile = useUserProfile();
  const { data: profileData, isLoading, isError, error } = isUT ? utProfile : generalProfile;

  const utUpsert = useSchoolProfileUpsert();
  const generalUpsert = useProfileUpsert();
  const { mutateAsync: upsertProfile } = isUT ? utUpsert : generalUpsert;

  const [validatedPhotoFile, setValidatedPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<Partial<OnboardingData>>({ defaultValues: profileData });

  useEffect(() => {
    if (profileData) reset(profileData);
  }, [profileData, reset]);

  const experienceValue = watch("experience") || "";
  const personalIntroValue = watch("personalIntro") || "";
  const archetypeValue = watch("archetype");
  const isTechnicalValue = watch("isTechnical");
  const hasStartupValue = watch("hasStartup");
  const intentValue = watch("intent");
  const coFounderStatusValue = watch("coFounderStatus");

  const onSubmit = async (formData: Partial<OnboardingData>) => {
    if (!profileData?.pfp_url) {
      toast.error("Please upload a profile picture before saving.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      await upsertProfile(formData as OnboardingData);
      trackEvent.profileUpdated({
        city: formData.city,
        country: formData.country,
        is_technical: formData.isTechnical,
        has_startup: !!formData.startupName,
        battery_level: formData.batteryLevel,
        satisfaction: formData.satisfaction,
      });
      router.push(`/school/${slug}/dashboard`);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handlePhotoUpload = async () => {
    if (!validatedPhotoFile) {
      setPhotoError("Please select a valid photo first.");
      return;
    }
    setIsUploadingPhoto(true);
    setPhotoError(null);
    setPhotoSuccess(null);
    try {
      const token = await session?.getToken();
      if (!token) throw new Error("Authentication required");

      const fd = new FormData();
      fd.append("file", validatedPhotoFile);

      const res = await fetch("/api/upload-profile-pic", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      trackEvent.profilePhotoUploaded({
        file_size: validatedPhotoFile.size,
        file_type: validatedPhotoFile.type,
      });

      setPhotoSuccess("Profile picture updated!");
      setValidatedPhotoFile(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--ui-text-muted)]">
        Loading profile…
      </div>
    );
  if (isError)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-red-400">
        Error: {error?.message}
      </div>
    );

  const sectionClass =
    "rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 space-y-5";
  const labelClass = "block text-sm font-medium text-[var(--ui-text-muted)]";
  const textareaClass =
    "w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-border)]";
  const selectClass =
    "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] focus:border-[var(--ui-border-strong)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-border)]";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
          Mamun &times; {schoolName}
        </p>
        <h1 className="mt-0.5 text-base font-semibold text-[var(--ui-text)]">Edit Your Profile</h1>
      </div>

      <Link
        href={`/school/${slug}/dashboard`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]"
      >
        <FaArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>

      {!profileData?.pfp_url && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          You must upload a profile picture before you can save changes.
        </div>
      )}

      <div className="space-y-5">
        {/* ── Profile Picture ── */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
            Profile Picture
          </h2>
          {profileData?.pfp_url && (
            <Image
              src={profileData.pfp_url}
              alt="Current profile photo"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border border-[var(--ui-border)] object-cover"
            />
          )}
          <FaceDetectionUploader
            onValidationSuccess={(file) => {
              setValidatedPhotoFile(file);
              setPhotoError(null);
              setPhotoSuccess(null);
            }}
            onValidationFail={(err) => {
              setValidatedPhotoFile(null);
              setPhotoError(err);
              setPhotoSuccess(null);
            }}
          />
          {validatedPhotoFile && (
            <button
              type="button"
              onClick={handlePhotoUpload}
              disabled={isUploadingPhoto}
              className="rounded-lg bg-[var(--ui-surface)] px-5 py-2 text-sm text-[var(--ui-text)] transition hover:bg-[var(--ui-surface)] disabled:opacity-50"
            >
              {isUploadingPhoto ? "Uploading…" : "Upload Photo"}
            </button>
          )}
          {photoError && <p className="text-sm text-red-400">{photoError}</p>}
          {photoSuccess && <p className="text-sm text-green-400">{photoSuccess}</p>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-24">
          {/* ── Basic Information ── */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>First Name *</label>
                <FormInput
                  placeholder="First Name"
                  {...register("firstName", { required: "Required" })}
                />
                {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Last Name *</label>
                <FormInput
                  placeholder="Last Name"
                  {...register("lastName", { required: "Required" })}
                />
                {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Title *</label>
              <FormInput
                placeholder="e.g. Software Engineer"
                {...register("title", { required: "Required" })}
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <input type="hidden" {...register("country", { required: true })} />
              <input type="hidden" {...register("city", { required: true })} />
              <input type="hidden" {...register("state")} />
              <LocationSelector
                countryValue={watch("country") || ""}
                stateValue={watch("state") || ""}
                cityValue={watch("city") || ""}
                onCountryChange={(v) => setValue("country", v, { shouldValidate: true })}
                onStateChange={(v) => setValue("state", v, { shouldValidate: true })}
                onCityChange={(v) => setValue("city", v, { shouldValidate: true })}
                errors={{
                  country: errors.country ? "Country is required" : undefined,
                  state: errors.state ? "State is required" : undefined,
                  city: errors.city ? "City is required" : undefined,
                }}
              />
            </div>
          </div>

          {/* ── School Details (UT only) ── */}
          {isUT && (
            <div className={sectionClass}>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
                School Details
              </h2>
              <UTSchoolFields
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            </div>
          )}

          {/* ── Professional ── */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
              Professional
            </h2>

            <div className="space-y-1.5">
              <label className={labelClass}>Work Experience *</label>
              <textarea
                rows={3}
                maxLength={CHAR_LIMIT}
                placeholder="Current/previous roles or internships"
                {...register("experience", { required: "Required", maxLength: { value: CHAR_LIMIT, message: `Max ${CHAR_LIMIT} characters` } })}
                className={textareaClass}
              />
              <CharCount value={experienceValue} max={CHAR_LIMIT} />
              {errors.experience && <p className="text-xs text-red-400">{errors.experience.message}</p>}
            </div>

            {/* Technical background */}
            <div className="space-y-2">
              <label className={labelClass}>Technical Background? *</label>
              <div className="flex gap-x-3">
                {(["yes", "no"] as const).map((val) => (
                  <label
                    key={val}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ${
                      isTechnicalValue === val
                        ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                        : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
                    }`}
                  >
                    <input
                      type="radio"
                      value={val}
                      {...register("isTechnical", { required: "Required" })}
                      className="sr-only"
                    />
                    {val === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </div>
              {errors.isTechnical && <p className="text-xs text-red-400">{errors.isTechnical.message}</p>}
            </div>

            {/* Satisfaction + battery only for non-UT schools */}
            {!isUT && (
              <>
                <div className="space-y-2">
                  <label className={labelClass}>Current Satisfaction *</label>
                  <div className="flex flex-wrap gap-4">
                    {["Happy", "Content", "Browsing"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input type="radio" value={opt} {...register("satisfaction", { required: "Required" })} className="h-4 w-4 accent-white" />
                        <span className="text-sm text-[var(--ui-text)]">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors.satisfaction && <p className="text-xs text-red-400">{errors.satisfaction.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Founder Battery Level *</label>
                  <div className="flex flex-wrap gap-4">
                    {["Energized", "Content", "Burnt out"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input type="radio" value={opt} {...register("batteryLevel", { required: "Required" })} className="h-4 w-4 accent-white" />
                        <span className="text-sm text-[var(--ui-text)]">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors.batteryLevel && <p className="text-xs text-red-400">{errors.batteryLevel.message}</p>}
                </div>
              </>
            )}
          </div>

          {/* ── Personal Story ── */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
              Personal Story
            </h2>

            <div className="space-y-1.5">
              <label className={labelClass}>Personal Introduction *</label>
              <textarea
                rows={4}
                maxLength={CHAR_LIMIT}
                placeholder="A short paragraph introducing yourself…"
                {...register("personalIntro", {
                  required: "Required",
                  minLength: { value: 10, message: "At least 10 characters" },
                  maxLength: { value: CHAR_LIMIT, message: `Max ${CHAR_LIMIT} characters` },
                })}
                className={textareaClass}
              />
              <CharCount value={personalIntroValue} max={CHAR_LIMIT} />
              {errors.personalIntro && <p className="text-xs text-red-400">{errors.personalIntro.message}</p>}
            </div>

            {/* Founder Archetype */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Founder Archetype *</label>
                <a
                  href="/founder-archetypes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--ui-text-subtle)] underline-offset-2 hover:text-[var(--ui-text-muted)] hover:underline"
                >
                  Learn more ↗
                </a>
              </div>
              <div className="flex flex-col gap-y-2">
                {(
                  [
                    { value: "the_scaler", label: "The Scaler", tooltip: "Speed and scale above all else. Uses AI and proprietary data to grow without headcount." },
                    { value: "the_steward", label: "The Steward", tooltip: "Values-driven and mission-first. Prioritizes ethical integrity and community trust." },
                    { value: "the_architect", label: "The Architect", tooltip: "Builds the infrastructure others run on. Creates platforms powered by network effects." },
                  ] as const
                ).map(({ value, label, tooltip }) => (
                  <label
                    key={value}
                    className={`${PILL_RADIO_CLS} relative`}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...register("archetype", { required: "Required" })}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                        archetypeValue === value
                          ? "border-[var(--ui-btn-bg)] bg-[var(--ui-btn-bg)]"
                          : "border-[var(--ui-border-strong)] bg-transparent"
                      }`}
                    />
                    <span className="flex-1">{label}</span>
                    <span className="group/tip relative ml-auto flex items-center" onClick={(e) => e.preventDefault()}>
                      <span className="flex h-5 w-5 cursor-default items-center justify-center rounded-full border border-[var(--ui-border-strong)] text-[10px] font-medium text-[var(--ui-text-subtle)] transition-colors group-hover/tip:border-white/35 group-hover/tip:text-[var(--ui-text-muted)]">
                        i
                      </span>
                      <span className="pointer-events-none absolute right-0 bottom-7 z-50 w-56 rounded-xl border border-[var(--ui-border)] bg-neutral-900 px-3.5 py-3 text-left text-xs leading-relaxed text-[var(--ui-text-muted)] opacity-0 shadow-2xl transition-opacity group-hover/tip:opacity-100">
                        {tooltip}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.archetype && <p className="text-xs text-red-400">{errors.archetype.message}</p>}
            </div>
          </div>

          {/* ── Startup & Co-Founder Intent ── */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
              Startup &amp; Co-Founder Intent
            </h2>

            <div className="space-y-2">
              <label className={labelClass}>Do you have a startup or idea? *</label>
              <div className="flex gap-x-3">
                {(["yes", "no"] as const).map((val) => (
                  <label
                    key={val}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ${
                      hasStartupValue === val
                        ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                        : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
                    }`}
                  >
                    <input
                      type="radio"
                      value={val}
                      {...register("hasStartup", { required: "Required" })}
                      className="sr-only"
                    />
                    {val === "yes" ? "Yes" : "No"}
                  </label>
                ))}
              </div>
              {errors.hasStartup && <p className="text-xs text-red-400">{errors.hasStartup.message}</p>}
            </div>

            {hasStartupValue === "yes" && (
              <>
                <div className="space-y-1.5">
                  <label className={labelClass}>Startup Name</label>
                  <FormInput placeholder="Your startup name" {...register("startupName")} />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Startup Description</label>
                  <textarea
                    rows={3}
                    placeholder="What does your startup do?"
                    {...register("startupDescription")}
                    className={textareaClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Time Spent on Startup</label>
                  <select {...register("startupTimeSpent")} className={selectClass}>
                    <option value="">Select…</option>
                    {["Just started", "1-3 months", "3-6 months", "6-12 months", "1-2 years", "2+ years"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Funding Stage</label>
                  <select {...register("startupFunding")} className={selectClass}>
                    <option value="">Select…</option>
                    {["Idea stage", "Bootstrapped", "Friends & Family", "Pre-seed", "Seed", "Series A+"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Co-founder status */}
                <div className="space-y-2">
                  <label className={labelClass}>Co-Founder Status *</label>
                  <div className="flex flex-col gap-y-2">
                    {["Solo founder", "Have co-founder(s)", "Seeking co-founder"].map((opt) => (
                      <label key={opt} className={PILL_RADIO_CLS}>
                        <input
                          type="radio"
                          value={opt}
                          {...register("coFounderStatus", { required: hasStartupValue === "yes" ? "Required" : false })}
                          className="sr-only"
                        />
                        <span
                          className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                            coFounderStatusValue === opt
                              ? "border-[var(--ui-btn-bg)] bg-[var(--ui-btn-bg)]"
                              : "border-[var(--ui-border-strong)] bg-transparent"
                          }`}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.coFounderStatus && <p className="text-xs text-red-400">{errors.coFounderStatus.message}</p>}
                </div>

                {/* Co-founder intent (UT-specific but shown for all when hasStartup) */}
                <div className="space-y-2">
                  <label className={labelClass}>Co-Founder Matching Intent *</label>
                  <div className="flex flex-col gap-y-2">
                    {[
                      { value: "join_me" as const, label: "Join me — I have a startup/idea" },
                      { value: "seeking_to_join" as const, label: "Seeking to join — I want to join someone else's project" },
                      { value: "no_preference" as const, label: "No preference — open to either" },
                    ].map(({ value, label }) => (
                      <label key={value} className={PILL_RADIO_CLS}>
                        <input
                          type="radio"
                          value={value}
                          {...register("intent", { required: "Required" })}
                          className="sr-only"
                        />
                        <span
                          className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                            intentValue === value
                              ? "border-[var(--ui-btn-bg)] bg-[var(--ui-btn-bg)]"
                              : "border-[var(--ui-border-strong)] bg-transparent"
                          }`}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  {errors.intent && <p className="text-xs text-red-400">{errors.intent.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Equity Expectation (%) *</label>
                  <FormInput
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 20"
                    {...register("equityExpectation", {
                      required: hasStartupValue === "yes" ? "Required" : false,
                      min: { value: 0, message: "At least 0%" },
                      max: { value: 100, message: "Max 100%" },
                    })}
                  />
                  {errors.equityExpectation && <p className="text-xs text-red-400">{errors.equityExpectation.message}</p>}
                </div>
              </>
            )}

            {/* Intent also visible when no startup */}
            {hasStartupValue === "no" && (
              <div className="space-y-2">
                <label className={labelClass}>Co-Founder Matching Intent *</label>
                <div className="flex flex-col gap-y-2">
                  {[
                    { value: "join_me" as const, label: "Join me — I have a startup/idea" },
                    { value: "seeking_to_join" as const, label: "Seeking to join — I want to join someone else's project" },
                    { value: "no_preference" as const, label: "No preference — open to either" },
                  ].map(({ value, label }) => (
                    <label key={value} className={PILL_RADIO_CLS}>
                      <input
                        type="radio"
                        value={value}
                        {...register("intent", { required: "Required" })}
                        className="sr-only"
                      />
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                          intentValue === value
                            ? "border-[var(--ui-btn-bg)] bg-[var(--ui-btn-bg)]"
                            : "border-[var(--ui-border-strong)] bg-transparent"
                        }`}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {errors.intent && <p className="text-xs text-red-400">{errors.intent.message}</p>}
              </div>
            )}
          </div>

          {/* ── Social Links ── */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--ui-text-muted)]">
              Social Links
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "LinkedIn", placeholder: "https://linkedin.com/in/username", field: "linkedin" as const },
                { label: "GitHub", placeholder: "https://github.com/username", field: "git" as const },
              ].map(({ label, placeholder, field }) => (
                <div key={field} className="space-y-1.5">
                  <label className={labelClass}>{label}</label>
                  <FormInput placeholder={placeholder} type="url" {...register(field)} />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>
                Scheduling Link{" "}
                <span className="font-normal text-[var(--ui-text-subtle)]">(Calendly, Cal.com…)</span>
              </label>
              <FormInput
                placeholder="https://calendly.com/your-link"
                type="url"
                {...register("schedulingUrl")}
              />
            </div>
          </div>

          {/* ── Sticky action bar ── */}
          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--ui-border)] bg-[var(--ui-bg)]/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
              <Link
                href={`/school/${slug}/dashboard`}
                className="cursor-pointer rounded-xl border border-[var(--ui-border-strong)] bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !profileData?.pfp_url}
                title={!profileData?.pfp_url ? "Upload a profile picture first" : undefined}
                className="cursor-pointer rounded-xl bg-[var(--ui-btn-bg)] px-8 py-2.5 text-sm font-medium text-[var(--ui-btn-text)] transition hover:bg-[var(--ui-btn-bg)]/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
