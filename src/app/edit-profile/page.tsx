"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  useProfileUpsert,
  useUserProfile,
} from "@/features/profile/useProfile";
import FormInput from "@/components/ui/FormInput";

export default function EditProfile() {
  const { data: profileData, isLoading, isError, error } = useUserProfile();
  const { mutateAsync: upsertProfileMutationFn } = useProfileUpsert();

  const {
    register,
    handleSubmit,
    reset,
    control,
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
    <section className="min-h-screen bg-(--charcoal-black) py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Edit Your Profile</h1>
          <p className="mt-2 text-gray-400">
            Update your information to help others find you
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <div className="rounded-lg bg-gray-800 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Time Spent on Startup
                </label>
                <FormInput
                  placeholder="e.g. 3 months in, MVP built"
                  {...register("startupTimeSpent")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Startup Funding
                </label>
                <FormInput
                  placeholder="e.g. Bootstrapped, Pre-seed, $20k grant"
                  {...register("startupFunding")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Co-founder Status
                </label>
                <FormInput
                  placeholder="e.g. Solo founder, Seeking co-founder"
                  {...register("coFounderStatus")}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Full-time Timeline
                </label>
                <FormInput
                  placeholder="e.g. Within 3 months, Already full-time"
                  {...register("fullTimeTimeline")}
                />
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Responsibilities (comma separated)
                </label>
                <Controller
                  control={control}
                  name="responsibilities"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(", ")
                      : "";
                    return (
                      <FormInput
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const arr = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          field.onChange(arr);
                        }}
                        placeholder="e.g. Engineering, Product, Sales"
                      />
                    );
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Priority Areas (comma separated)
                </label>
                <Controller
                  control={control}
                  name="priorityAreas"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? field.value.join(", ")
                      : "";
                    return (
                      <FormInput
                        value={value}
                        onChange={(e) => {
                          const arr = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          field.onChange(arr);
                        }}
                        placeholder="e.g. AI, Healthcare, Fintech"
                      />
                    );
                  }}
                />
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
