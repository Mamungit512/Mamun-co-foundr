"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { useSession } from "@clerk/nextjs";
import {
  useProfileUpsert,
  useUserProfile,
} from "@/features/profile/useProfile";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import HiringSettings from "@/components/HiringSettings";

// Dynamically import with SSR disabled (required for face-api.js)
const FaceDetectionUploader = dynamic(
  () => import("@/components/FaceDetectionUploader"),
  {
    ssr: false,
    loading: () => (
      <div className="flex animate-pulse items-center gap-2 text-gray-400">
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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading AI Model...
      </div>
    ),
  },
);

export default function EditProfile() {
  const { data: profileData, isLoading, isError, error } = useUserProfile();
  const { mutateAsync: upsertProfileMutationFn } = useProfileUpsert();
  const { session } = useSession();

  const [validatedPhotoFile, setValidatedPhotoFile] = useState<File | null>(
    null,
  );
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<Partial<OnboardingData>>({
    defaultValues: profileData,
  });

  // Watch values for AI Writer
  const titleValue = watch("title") || "";
  const educationValue = watch("education") || "";
  const experienceValue = watch("experience") || "";
  const personalIntroValue = watch("personalIntro") || "";
  const accomplishmentsValue = watch("accomplishments") || "";
  const ummahValue = watch("ummah") || "";
  const interestsValue = watch("interests") || "";
  const hobbiesValue = watch("hobbies") || "";
  const startupTimeSpentValue = watch("startupTimeSpent") || "";
  const startupFundingValue = watch("startupFunding") || "";
  const coFounderStatusValue = watch("coFounderStatus") || "";
  const fullTimeTimelineValue = watch("fullTimeTimeline") || "";

  useEffect(() => {
    if (profileData) reset(profileData);
  }, [profileData, reset]);

  const onSubmit = async (formData: Partial<OnboardingData>) => {
    // Validate that user has a profile picture before saving
    if (!profileData?.pfp_url) {
      setPhotoError("Please upload a profile picture before saving your profile.");
      // Scroll to the top where the photo upload section is
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // -- Upsert editted profile data into DB --
    await upsertProfileMutationFn(formData);
  };

  const handlePhotoUpload = async () => {
    if (!validatedPhotoFile) {
      setPhotoError("Please select a valid photo first");
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError(null);
    setPhotoSuccess(null);

    try {
      const token = await session?.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("file", validatedPhotoFile);

      const response = await fetch("/api/upload-profile-pic", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      setPhotoSuccess("Profile picture updated successfully!");
      setValidatedPhotoFile(null);

      // Refresh the page after a short delay to show the new image
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setPhotoError(
        err instanceof Error
          ? err.message
          : "Failed to upload photo. Please try again.",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (isError) return <p>Error loading profile: {error?.message}</p>;

  return (
    <section className="min-h-screen bg-(--charcoal-black) py-4 sm:py-6 md:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Edit Your Profile
          </h1>
          <p className="mt-2 text-sm text-gray-400 sm:text-base">
            Update your information to help others find you
          </p>
        </div>

        {/* Warning Banner if no profile picture */}
        {!profileData?.pfp_url && (
          <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold text-red-400">
                  Profile Picture Required
                </p>
                <p className="text-sm text-red-300">
                  You must upload a profile picture before you can save changes to your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="mb-8 rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-500/20 p-2">
              <span className="text-lg">📸</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Profile Picture
              </h2>
              <p className="text-sm text-gray-400">
                Upload a clear photo of yourself. AI will verify it&apos;s a real
                human face.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Profile Picture */}
            {profileData?.pfp_url && (
              <div>
                <p className="mb-2 text-sm text-gray-400">Current Photo:</p>
                <img
                  src={profileData.pfp_url}
                  alt="Current profile"
                  className="h-32 w-32 rounded-full border-2 border-gray-600 object-cover"
                />
              </div>
            )}

            {/* Face Detection Uploader */}
            <div>
              <FaceDetectionUploader
                onValidationSuccess={(file) => {
                  console.log("Valid face detected:", file);
                  setValidatedPhotoFile(file);
                  setPhotoError(null);
                  setPhotoSuccess(null);
                }}
                onValidationFail={(error) => {
                  console.warn("Face validation failed:", error);
                  setValidatedPhotoFile(null);
                  setPhotoError(error);
                  setPhotoSuccess(null);
                }}
              />
            </div>

            {/* Upload Button */}
            {validatedPhotoFile && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {isUploadingPhoto ? "Uploading..." : "Upload New Photo"}
              </button>
            )}

            {/* Error Message */}
            {photoError && (
              <div className="rounded-lg border border-red-500 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{photoError}</p>
              </div>
            )}

            {/* Success Message */}
            {photoSuccess && (
              <div className="rounded-lg border border-green-500 bg-green-500/10 p-3">
                <p className="text-sm text-green-400">{photoSuccess}</p>
              </div>
            )}
          </div>
        </div>

        {/* Hiring Settings Section */}
        <div className="mb-8 rounded-lg border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-yellow-500/20 p-2">
              <span className="text-lg text-yellow-300">💼</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Hiring Settings
              </h2>
              <p className="text-sm text-gray-400">
                Attract top talent with a professional hiring badge
              </p>
            </div>
          </div>
          <HiringSettings
            isHiring={profileData?.isHiring || false}
            hiringEmail={profileData?.hiringEmail}
            onUpdate={async (hiringData) => {
              const updatedData = {
                ...profileData,
                ...hiringData,
              };
              await upsertProfileMutationFn(updatedData);
            }}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 sm:space-y-8"
        >
          {/* Basic Information Section */}
          <div className="rounded-lg bg-gray-800 p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white sm:mb-6 sm:text-xl">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  First Name *
                </label>
                <FormInput
                  placeholder="First Name"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Last Name *
                </label>
                <FormInput
                  placeholder="Last Name"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Title *
                </label>
                <AIWriter
                  text={titleValue}
                  fieldType="title"
                  onAccept={(suggestion) => setValue("title", suggestion)}
                />
                <FormInput
                  placeholder="Title: (Ex. Software Engineer)"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  City *
                </label>
                <FormInput
                  placeholder="City"
                  {...register("city", { required: "City is required" })}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Country *
                </label>
                <FormInput
                  placeholder="Country"
                  {...register("country", { required: "Country is required" })}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Gender
                </label>
                <FormInput
                  type="text"
                  placeholder="Gender"
                  {...register("gender")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Birthdate
                </label>
                <FormInput
                  type="date"
                  placeholder="Birthdate"
                  {...register("birthdate")}
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Professional Information
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Education *
                </label>
                <AIWriter
                  text={educationValue}
                  fieldType="education"
                  onAccept={(suggestion) => setValue("education", suggestion)}
                />
                <textarea
                  rows={3}
                  placeholder="Your degree, school, etc."
                  {...register("education", {
                    required: "Education is required",
                  })}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {errors.education && (
                  <p className="text-sm text-red-500">
                    {errors.education.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Experience *
                </label>
                <AIWriter
                  text={experienceValue}
                  fieldType="experience"
                  onAccept={(suggestion) => setValue("experience", suggestion)}
                />
                <textarea
                  rows={3}
                  placeholder="Current/previous job title(s)"
                  {...register("experience", {
                    required: "Experience is required",
                  })}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {errors.experience && (
                  <p className="text-sm text-red-500">
                    {errors.experience.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Current Occupation Satisfaction *
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Happy", "Content", "Browsing"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={option}
                        {...register("satisfaction", {
                          required: "Satisfaction is required",
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.satisfaction && (
                  <p className="text-sm text-red-500">
                    {errors.satisfaction.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Founder&apos;s Battery Level *
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Energized", "Content", "Burnt out"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={option}
                        {...register("batteryLevel", {
                          required: "Battery level is required",
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.batteryLevel && (
                  <p className="text-sm text-red-500">
                    {errors.batteryLevel.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Story Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Personal Story
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Personal Introduction *
                </label>
                <AIWriter
                  text={personalIntroValue}
                  fieldType="personalIntro"
                  onAccept={(suggestion) => setValue("personalIntro", suggestion)}
                />
                <textarea
                  rows={4}
                  placeholder="Write a short paragraph or two introducing yourself..."
                  {...register("personalIntro", {
                    required:
                      "Your bio/introduction cannot be empty. Please write a short paragraph introducing yourself.",
                    minLength: {
                      value: 10,
                      message: "Your bio must be at least 10 characters long.",
                    },
                  })}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {errors.personalIntro && (
                  <p className="text-sm text-red-500">
                    {errors.personalIntro.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Accomplishments
                </label>
                <AIWriter
                  text={accomplishmentsValue}
                  fieldType="accomplishments"
                  onAccept={(suggestion) => setValue("accomplishments", suggestion)}
                />
                <textarea
                  rows={3}
                  placeholder="Built an app used by 10k+ users, Launched a startup, Top 5% LeetCode"
                  {...register("accomplishments")}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  If you were a civilizational engineer for the Ummah, what idea
                  would you bring?
                </label>
                <AIWriter
                  text={ummahValue}
                  fieldType="ummah"
                  onAccept={(suggestion) => setValue("ummah", suggestion)}
                />
                <textarea
                  rows={3}
                  placeholder="Your idea here"
                  {...register("ummah")}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Social Links
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  LinkedIn URL
                </label>
                <FormInput
                  placeholder="https://linkedin.com/in/username"
                  type="url"
                  {...register("linkedin")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Twitter URL
                </label>
                <FormInput
                  placeholder="https://twitter.com/username"
                  type="url"
                  {...register("twitter")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  GitHub URL
                </label>
                <FormInput
                  placeholder="https://github.com/username"
                  type="url"
                  {...register("git")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Personal Website
                </label>
                <FormInput
                  placeholder="https://yourwebsite.com"
                  type="url"
                  {...register("personalWebsite")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Scheduling URL
                </label>
                <FormInput
                  placeholder="https://calendly.com/username"
                  type="url"
                  {...register("schedulingUrl")}
                />
              </div>
            </div>
          </div>

          {/* Startup Information Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Startup Information
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Startup Name
                </label>
                <FormInput
                  placeholder="Startup Name"
                  {...register("startupName")}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Time Spent on Startup
                </label>
                <AIWriter
                  text={startupTimeSpentValue}
                  fieldType="startupTimeSpent"
                  onAccept={(suggestion) => setValue("startupTimeSpent", suggestion)}
                />
                <FormInput
                  placeholder="e.g. 3 months in, MVP built"
                <select
                  {...register("startupTimeSpent")}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select time spent...</option>
                  <option value="Just started">Just started</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2+ years">2+ years</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Startup Funding
                </label>
                <AIWriter
                  text={startupFundingValue}
                  fieldType="startupFunding"
                  onAccept={(suggestion) => setValue("startupFunding", suggestion)}
                />
                <FormInput
                  placeholder="e.g. Bootstrapped, Pre-seed, $20k grant"
                <select
                  {...register("startupFunding")}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select funding status...</option>
                  <option value="Bootstrapped">Bootstrapped</option>
                  <option value="Pre-seed">Pre-seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A+">Series A+</option>
                  <option value="Grant funded">Grant funded</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Co-founder Status
                </label>
                <AIWriter
                  text={coFounderStatusValue}
                  fieldType="coFounderStatus"
                  onAccept={(suggestion) => setValue("coFounderStatus", suggestion)}
                />
                <FormInput
                  placeholder="e.g. Solo founder, Seeking co-founder"
                  {...register("coFounderStatus")}
                />
                <div className="flex flex-wrap gap-4">
                  {[
                    "Solo founder",
                    "Have co-founder(s)",
                    "Seeking co-founder",
                  ].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={option}
                        {...register("coFounderStatus")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Full-time Timeline
                </label>
                <AIWriter
                  text={fullTimeTimelineValue}
                  fieldType="fullTimeTimeline"
                  onAccept={(suggestion) => setValue("fullTimeTimeline", suggestion)}
                />
                <FormInput
                  placeholder="e.g. Within 3 months, Already full-time"
                <select
                  {...register("fullTimeTimeline")}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select timeline...</option>
                  <option value="Already full-time">Already full-time</option>
                  <option value="Within 1 month">Within 1 month</option>
                  <option value="Within 3 months">Within 3 months</option>
                  <option value="Within 6 months">Within 6 months</option>
                  <option value="Within 1 year">Within 1 year</option>
                  <option value="Unsure">Unsure</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Equity Expectation (%)
                </label>
                <FormInput
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 20, 25.5"
                  {...register("equityExpectation", {
                    min: { value: 0, message: "Equity must be at least 0%" },
                    max: { value: 100, message: "Equity cannot exceed 100%" },
                  })}
                />
                {errors.equityExpectation && (
                  <p className="text-sm text-red-500">
                    {errors.equityExpectation.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Interests & Values Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Interests & Values
            </h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Responsibility Areas
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Ops", "Sales", "Design", "Engineering", "Product"].map(
                    (area) => (
                      <label key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={area}
                          {...register("responsibilities")}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">{area}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Priority Areas
                </label>
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
                    <label key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={area}
                        {...register("priorityAreas")}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Interests
                </label>
                <AIWriter
                  text={interestsValue}
                  fieldType="interests"
                  onAccept={(suggestion) => setValue("interests", suggestion)}
                />
                <textarea
                  rows={3}
                  placeholder="Your interests and passions"
                  {...register("interests")}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Hobbies
                </label>
                <AIWriter
                  text={hobbiesValue}
                  fieldType="hobbies"
                  onAccept={(suggestion) => setValue("hobbies", suggestion)}
                />
                <textarea
                  rows={3}
                  placeholder="Your hobbies and activities"
                  {...register("hobbies")}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !profileData?.pfp_url}
              className="cursor-pointer rounded-md bg-blue-600 px-8 py-3 text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              title={!profileData?.pfp_url ? "Please upload a profile picture first" : ""}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}