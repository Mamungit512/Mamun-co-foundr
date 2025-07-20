"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUserProfile } from "@/services/useProfile";
import FormInput from "@/components/ui/FormInput";
import type { OnboardingData } from "../onboarding/types";

export default function EditProfile() {
  const { data: profileData, isLoading, isError, error } = useUserProfile();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<Partial<OnboardingData>>({
    defaultValues: profileData,
  });

  useEffect(() => {
    if (profileData) reset(profileData);
  }, [profileData, reset]);

  const onSubmit = (formData: Partial<OnboardingData>) => {
    console.log(formData);
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (isError) return <p>Error loading profile: {error?.message}</p>;

  return (
    <section className="bg-(--charcoal-black) text-(--mist-white)">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl rounded-lg p-8 text-white"
      >
        <h1 className="mb-8 text-3xl font-semibold">Edit Your Profile</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex flex-col">
            First Name *
            <FormInput
              placeholder="First Name"
              {...register("firstName", { required: "First name is required" })}
            />
          </label>

          <label className="flex flex-col">
            Last Name *
            <FormInput
              placeholder="Last Name"
              {...register("lastName", { required: "Last name is required" })}
            />
          </label>

          <label className="flex flex-col">
            City *
            <FormInput
              placeholder="City"
              {...register("city", { required: "City is required" })}
            />
          </label>

          <label className="flex flex-col">
            Country *
            <FormInput
              placeholder="Country"
              {...register("country", { required: "Country is required" })}
            />
          </label>

          <label className="flex flex-col">
            Satisfaction (0-10) *
            <FormInput
              type="number"
              placeholder="Satisfaction (0-10)"
              {...register("satisfaction", {
                required: "Satisfaction is required",
                min: { value: 0, message: "Minimum is 0" },
                max: { value: 10, message: "Maximum is 10" },
                valueAsNumber: true,
              })}
            />
          </label>

          <label className="flex flex-col">
            Gender
            <FormInput
              type="text"
              placeholder="Gender"
              {...register("gender")}
            />
          </label>

          <label className="flex flex-col">
            Birthdate
            <FormInput
              type="date"
              placeholder="Birthdate"
              {...register("birthdate")}
            />
          </label>

          <label className="flex flex-col">
            Education *
            <FormInput
              placeholder="Education"
              {...register("education", { required: "Education is required" })}
            />
          </label>

          <label className="flex flex-col">
            Experience *
            <FormInput
              placeholder="Experience"
              {...register("experience", {
                required: "Experience is required",
              })}
            />
          </label>

          <label className="flex flex-col">
            Scheduling URL
            <FormInput
              placeholder="Scheduling URL"
              type="url"
              {...register("schedulingUrl")}
            />
          </label>

          <label className="flex flex-col">
            LinkedIn URL
            <FormInput
              placeholder="LinkedIn URL"
              type="url"
              {...register("linkedin")}
            />
          </label>

          <label className="flex flex-col">
            Twitter URL
            <FormInput
              placeholder="Twitter URL"
              type="url"
              {...register("twitter")}
            />
          </label>

          <label className="flex flex-col">
            GitHub URL
            <FormInput
              placeholder="GitHub URL"
              type="url"
              {...register("git")}
            />
          </label>

          <label className="flex flex-col">
            Personal Website
            <FormInput
              placeholder="Personal Website"
              type="url"
              {...register("personalWebsite")}
            />
          </label>

          <label className="flex flex-col">
            Startup Name
            <FormInput placeholder="Startup Name" {...register("name")} />
          </label>

          <label className="flex flex-col">
            Time Spent on Startup
            <FormInput
              placeholder="Time Spent on Startup"
              {...register("timeSpent")}
            />
          </label>

          <label className="flex flex-col">
            Startup Funding
            <FormInput placeholder="Startup Funding" {...register("funding")} />
          </label>

          <label className="flex flex-col">
            Cofounder Status
            <FormInput
              placeholder="Cofounder Status"
              {...register("coFounderStatus")}
            />
          </label>

          <label className="flex flex-col">
            Full-time Timeline
            <FormInput
              placeholder="Full-time Timeline"
              {...register("fullTimeTimeline")}
            />
          </label>
        </div>

        <label className="mt-6 flex flex-col">
          Personal Introduction *
          <textarea
            rows={4}
            placeholder="Personal Introduction"
            {...register("personalIntro", {
              required: "Personal intro is required",
            })}
            className="mt-1 rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </label>

        <label className="mt-6 flex flex-col">
          Accomplishments
          <textarea
            rows={3}
            placeholder="Accomplishments"
            {...register("accomplishments")}
            className="mt-1 rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </label>

        <label className="mt-6 flex flex-col">
          Responsibilities (comma separated)
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
                  className="mt-1"
                />
              );
            }}
          />
        </label>

        <label className="mt-6 flex flex-col">
          Interests
          <textarea
            rows={3}
            placeholder="Interests"
            {...register("interests")}
            className="mt-1 rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </label>

        <label className="mt-6 flex flex-col">
          Priority Areas (comma separated)
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
                  className="mt-1"
                />
              );
            }}
          />
        </label>

        <label className="mt-6 flex flex-col">
          Hobbies
          <textarea
            rows={3}
            placeholder="Hobbies"
            {...register("hobbies")}
            className="mt-1 rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </label>

        <label className="mt-6 flex flex-col">
          Journey
          <textarea
            rows={3}
            placeholder="Journey"
            {...register("journey")}
            className="mt-1 rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </label>

        <label className="mt-6 flex flex-col">
          Extra
          <textarea
            rows={3}
            placeholder="Extra"
            {...register("extra")}
            className="mt-1 rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </label>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded border border-white px-6 py-2 text-white transition hover:bg-white hover:text-black"
          >
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
