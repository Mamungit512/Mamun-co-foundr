"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import toast from "react-hot-toast";

import { useProfileUpsert, useUserProfile } from "@/features/profile/useProfile";
import { useSchool } from "@/components/school/SchoolContext";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import LocationSelector from "@/components/ui/LocationSelector";
import { trackEvent } from "@/lib/posthog-events";

const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  {
    ssr: false,
    loading: () => (
      <div className="flex animate-pulse items-center gap-2 text-white/40">
        <svg
          className="h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Loading AI model…
      </div>
    ),
  },
);

export default function SchoolProfilePage() {
  const { slug, schoolName } = useSchool();
  const router = useRouter();
  const { session } = useSession();
  const { data: profileData, isLoading, isError, error } = useUserProfile();
  const { mutateAsync: upsertProfile } = useProfileUpsert();

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

  const titleValue = watch("title") || "";
  const educationValue = watch("education") || "";
  const experienceValue = watch("experience") || "";
  const personalIntroValue = watch("personalIntro") || "";
  const accomplishmentsValue = watch("accomplishments") || "";
  const interestsValue = watch("interests") || "";
  const hobbiesValue = watch("hobbies") || "";

  const onSubmit = async (formData: Partial<OnboardingData>) => {
    if (!profileData?.pfp_url) {
      toast.error("Please upload a profile picture before saving.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      await upsertProfile(formData);
      trackEvent.profileUpdated({
        city: formData.city,
        country: formData.country,
        is_technical: formData.isTechnical,
        has_startup: !!formData.startupName,
        battery_level: formData.batteryLevel,
        satisfaction: formData.satisfaction,
      });
      toast.success("Profile saved!");
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
      setPhotoError(
        err instanceof Error ? err.message : "Failed to upload photo.",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/40">
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
    "rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5";
  const labelClass = "block text-sm font-medium text-white/60";
  const textareaClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Branding header */}
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
          Mamun &times; {schoolName}
        </p>
        <h1 className="mt-0.5 text-base font-semibold text-white/80">
          Edit Your Profile
        </h1>
      </div>

      {/* Back link */}
      <Link
        href={`/school/${slug}/dashboard`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70"
      >
        <FaArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>

      {/* No photo warning */}
      {!profileData?.pfp_url && (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          You must upload a profile picture before you can save changes.
        </div>
      )}

      <div className="space-y-5">
        {/* Profile picture */}
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
            Profile Picture
          </h2>
          {profileData?.pfp_url && (
            <Image
              src={profileData.pfp_url}
              alt="Current profile photo"
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border border-white/10 object-cover"
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
              className="rounded-lg bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              {isUploadingPhoto ? "Uploading…" : "Upload Photo"}
            </button>
          )}
          {photoError && <p className="text-sm text-red-400">{photoError}</p>}
          {photoSuccess && (
            <p className="text-sm text-green-400">{photoSuccess}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic information */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Basic Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>First Name *</label>
                <FormInput
                  placeholder="First Name"
                  {...register("firstName", { required: "Required" })}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Last Name *</label>
                <FormInput
                  placeholder="Last Name"
                  {...register("lastName", { required: "Required" })}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Title *</label>
              <AIWriter
                text={titleValue}
                onAccept={(s) => setValue("title", s)}
                fieldType="title"
              />
              <FormInput
                placeholder="e.g. Software Engineer"
                {...register("title", { required: "Required" })}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <input
                type="hidden"
                {...register("country", { required: true })}
              />
              <input
                type="hidden"
                {...register("city", { required: true })}
              />
              <input type="hidden" {...register("state")} />
              <LocationSelector
                countryValue={watch("country") || ""}
                stateValue={watch("state") || ""}
                cityValue={watch("city") || ""}
                onCountryChange={(v) =>
                  setValue("country", v, { shouldValidate: true })
                }
                onStateChange={(v) =>
                  setValue("state", v, { shouldValidate: true })
                }
                onCityChange={(v) =>
                  setValue("city", v, { shouldValidate: true })
                }
                errors={{
                  country: errors.country ? "Country is required" : undefined,
                  state: errors.state ? "State is required" : undefined,
                  city: errors.city ? "City is required" : undefined,
                }}
              />
            </div>
          </div>

          {/* Professional information */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Professional Information
            </h2>

            <div className="space-y-1.5">
              <label className={labelClass}>Education *</label>
              <AIWriter
                text={educationValue}
                onAccept={(s) => setValue("education", s)}
                fieldType="education"
              />
              <textarea
                rows={3}
                placeholder="Your degree, school, etc."
                {...register("education", { required: "Required" })}
                className={textareaClass}
              />
              {errors.education && (
                <p className="text-xs text-red-400">
                  {errors.education.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Experience *</label>
              <AIWriter
                text={experienceValue}
                onAccept={(s) => setValue("experience", s)}
                fieldType="experience"
              />
              <textarea
                rows={3}
                placeholder="Current/previous roles"
                {...register("experience", { required: "Required" })}
                className={textareaClass}
              />
              {errors.experience && (
                <p className="text-xs text-red-400">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Current Satisfaction *</label>
              <div className="flex flex-wrap gap-4">
                {["Happy", "Content", "Browsing"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={opt}
                      {...register("satisfaction", { required: "Required" })}
                      className="h-4 w-4 accent-white"
                    />
                    <span className="text-sm text-white/70">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.satisfaction && (
                <p className="text-xs text-red-400">
                  {errors.satisfaction.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Founder Battery Level *</label>
              <div className="flex flex-wrap gap-4">
                {["Energized", "Content", "Burnt out"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={opt}
                      {...register("batteryLevel", { required: "Required" })}
                      className="h-4 w-4 accent-white"
                    />
                    <span className="text-sm text-white/70">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.batteryLevel && (
                <p className="text-xs text-red-400">
                  {errors.batteryLevel.message}
                </p>
              )}
            </div>
          </div>

          {/* Personal story */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Personal Story
            </h2>

            <div className="space-y-1.5">
              <label className={labelClass}>Personal Introduction *</label>
              <AIWriter
                text={personalIntroValue}
                onAccept={(s) => setValue("personalIntro", s)}
                fieldType="personalIntro"
              />
              <textarea
                rows={4}
                placeholder="A short paragraph introducing yourself…"
                {...register("personalIntro", {
                  required: "Required",
                  minLength: { value: 10, message: "At least 10 characters" },
                })}
                className={textareaClass}
              />
              {errors.personalIntro && (
                <p className="text-xs text-red-400">
                  {errors.personalIntro.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Accomplishments</label>
              <AIWriter
                text={accomplishmentsValue}
                onAccept={(s) => setValue("accomplishments", s)}
                fieldType="accomplishments"
              />
              <textarea
                rows={3}
                placeholder="Built an app used by 10k+ users, Top 5% LeetCode…"
                {...register("accomplishments")}
                className={textareaClass}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Founder Archetype</label>
                <a
                  href="/founder-archetypes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/30 underline-offset-2 hover:text-white/60 hover:underline"
                >
                  Learn more ↗
                </a>
              </div>
              <div className="flex flex-col gap-y-2">
                {(
                  [
                    {
                      value: "the_scalar",
                      label: "The Scalar",
                      tooltip:
                        "Speed and scale above all else. Uses AI and proprietary data to grow without headcount.",
                    },
                    {
                      value: "the_steward",
                      label: "The Steward",
                      tooltip:
                        "Values-driven and mission-first. Prioritizes ethical integrity and community trust.",
                    },
                    {
                      value: "the_architect",
                      label: "The Architect",
                      tooltip:
                        "Builds the infrastructure others run on. Creates platforms powered by network effects.",
                    },
                  ] as const
                ).map(({ value, label, tooltip }) => (
                  <label
                    key={value}
                    className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:border-white/20 hover:bg-white/8 has-[:checked]:border-white/40 has-[:checked]:bg-white/15"
                  >
                    <input
                      type="radio"
                      value={value}
                      {...register("archetype")}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                        watch("archetype") === value
                          ? "border-white bg-white"
                          : "border-white/30 bg-transparent"
                      }`}
                    />
                    <span className="flex-1">{label}</span>
                    <span
                      className="group/tip relative ml-auto flex items-center"
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className="flex h-5 w-5 cursor-default items-center justify-center rounded-full border border-white/15 text-[10px] font-medium text-white/30 transition-colors group-hover/tip:border-white/35 group-hover/tip:text-white/60">
                        i
                      </span>
                      <span className="pointer-events-none absolute right-0 bottom-7 z-50 w-56 rounded-xl border border-white/10 bg-neutral-900 px-3.5 py-3 text-left text-xs leading-relaxed text-white/60 opacity-0 shadow-2xl transition-opacity group-hover/tip:opacity-100">
                        {tooltip}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Social Links
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "LinkedIn", placeholder: "https://linkedin.com/in/username", field: "linkedin" as const },
                { label: "Twitter", placeholder: "https://twitter.com/username", field: "twitter" as const },
                { label: "GitHub", placeholder: "https://github.com/username", field: "git" as const },
                { label: "Personal Website", placeholder: "https://yourwebsite.com", field: "personalWebsite" as const },
                { label: "Scheduling URL", placeholder: "https://calendly.com/username", field: "schedulingUrl" as const },
              ].map(({ label, placeholder, field }) => (
                <div key={field} className="space-y-1.5">
                  <label className={labelClass}>{label}</label>
                  <FormInput
                    placeholder={placeholder}
                    type="url"
                    {...register(field)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Interests & values */}
          <div className={sectionClass}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
              Interests &amp; Values
            </h2>

            <div className="space-y-2">
              <label className={labelClass}>Responsibility Areas</label>
              <div className="flex flex-wrap gap-4">
                {["Ops", "Sales", "Design", "Engineering", "Product"].map(
                  (area) => (
                    <label key={area} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={area}
                        {...register("responsibilities")}
                        className="h-4 w-4 accent-white"
                      />
                      <span className="text-sm text-white/70">{area}</span>
                    </label>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Priority Areas</label>
              <div className="flex flex-wrap gap-4">
                {[
                  "Emerging Tech",
                  "AI",
                  "Healthcare",
                  "Fintech",
                  "Circular Economy",
                  "Climate",
                  "Education",
                  "Consumer",
                ].map((area) => (
                  <label key={area} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={area}
                      {...register("priorityAreas")}
                      className="h-4 w-4 accent-white"
                    />
                    <span className="text-sm text-white/70">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Interests</label>
              <AIWriter
                text={interestsValue}
                onAccept={(s) => setValue("interests", s)}
                fieldType="interests"
              />
              <textarea
                rows={3}
                placeholder="Your interests and passions"
                {...register("interests")}
                className={textareaClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Hobbies</label>
              <AIWriter
                text={hobbiesValue}
                onAccept={(s) => setValue("hobbies", s)}
                fieldType="hobbies"
              />
              <textarea
                rows={3}
                placeholder="Your hobbies and activities"
                {...register("hobbies")}
                className={textareaClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pb-8">
            <Link
              href={`/school/${slug}/dashboard`}
              className="text-sm text-white/40 hover:text-white/70"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !profileData?.pfp_url}
              title={
                !profileData?.pfp_url
                  ? "Upload a profile picture first"
                  : undefined
              }
              className="rounded-xl bg-white/10 px-8 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
