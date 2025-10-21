"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useProfileUpsert,
  useUserProfile,
} from "@/features/profile/useProfile";
import FormInput from "@/components/ui/FormInput";
import HiringSettings from "@/components/HiringSettings";

export default function EditProfile() {
  const { data: profileData, isLoading, isError, error } = useUserProfile();
  const { mutateAsync: upsertProfileMutationFn } = useProfileUpsert();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<Partial<OnboardingData>>({
    defaultValues: profileData,
  });

  useEffect(() => {
    if (profileData) reset(profileData);
  }, [profileData, reset]);

  const onSubmit = async (formData: Partial<OnboardingData>) => {
    // -- Upsert editted profile data into DB --
    await upsertProfileMutationFn(formData);
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
                  {["Happy", "Content", "Browsing", "Unhappy"].map((option) => (
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
              disabled={isSubmitting}
              className="cursor-pointer rounded-md bg-blue-600 px-8 py-3 text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
