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
    <section className="bg-(--charcoal-black) text-(--mist-white)">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl rounded-lg p-8 text-white"
      >
        <h1 className="mb-8 text-3xl font-semibold">Edit Your Profile</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label>First Name *</label>
            <FormInput
              placeholder="First Name"
              {...register("firstName", { required: "First name is required" })}
            />
          </div>
          <div>
            <label>Last Name *</label>
            <FormInput
              placeholder="Last Name"
              {...register("lastName", { required: "Last name is required" })}
            />
          </div>

          <div>
            <label>Title *</label>
            <FormInput
              placeholder="Title: (Ex. Software Engineer)"
              {...register("title", { required: "Title is required" })}
            />
          </div>

          <label>
            City *
            <FormInput
              placeholder="City"
              {...register("city", { required: "City is required" })}
            />
          </label>

          <div>
            <label>Country *</label>
            <FormInput
              placeholder="Country"
              {...register("country", { required: "Country is required" })}
            />
          </div>

          <div>
            <label className="flex flex-col">Satisfaction (0-10) *</label>
            <FormInput
              type="number"
              placeholder="Satisfaction (0-100)"
              {...register("satisfaction", {
                required: "Satisfaction is required",
                min: { value: 0, message: "Minimum is 0" },
                max: { value: 100, message: "Maximum is 100" },
                valueAsNumber: true,
              })}
            />
            {errors.satisfaction && (
              <p className="text-sm text-red-500">
                {errors.satisfaction.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex flex-col">Gender</label>
            <FormInput
              type="text"
              placeholder="Gender"
              {...register("gender")}
            />
          </div>

          <div>
            <label className="flex flex-col">Birthdate</label>
            <FormInput
              type="date"
              placeholder="Birthdate"
              {...register("birthdate")}
            />
          </div>

          <div>
            <label className="flex flex-col">Education *</label>
            <FormInput
              placeholder="Education"
              {...register("education", { required: "Education is required" })}
            />
          </div>

          <div>
            <label className="flex flex-col">Experience *</label>
            <FormInput
              placeholder="Experience"
              {...register("experience", {
                required: "Experience is required",
              })}
            />
          </div>

          <div>
            <label className="flex flex-col">Scheduling URL</label>
            <FormInput
              placeholder="Scheduling URL"
              type="url"
              {...register("schedulingUrl")}
            />
          </div>

          <div>
            <label className="flex flex-col">LinkedIn URL</label>
            <FormInput
              placeholder="LinkedIn URL"
              type="url"
              {...register("linkedin")}
            />
          </div>

          <div>
            <label className="flex flex-col">Twitter URL</label>
            <FormInput
              placeholder="Twitter URL"
              type="url"
              {...register("twitter")}
            />
          </div>

          <div>
            <label className="flex flex-col">GitHub URL</label>
            <FormInput
              placeholder="GitHub URL"
              type="url"
              {...register("git")}
            />
          </div>

          <div>
            <label className="flex flex-col">Personal Website</label>
            <FormInput
              placeholder="Personal Website"
              type="url"
              {...register("personalWebsite")}
            />
          </div>

          <div>
            <label className="flex flex-col">Startup Name</label>
            <FormInput
              placeholder="Startup Name"
              {...register("startupName")}
            />
          </div>

          <div>
            <label className="flex flex-col">Time Spent on Startup</label>
            <FormInput
              placeholder="Time Spent on Startup"
              {...register("startupTimeSpent")}
            />
          </div>

          <div>
            <label className="flex flex-col">Startup Funding</label>
            <FormInput placeholder="Startup Funding" {...register("startupFunding")} />
          </div>

          <div>
            <FormInput
              placeholder="Cofounder Status"
              {...register("coFounderStatus")}
            />
            <label className="flex flex-col">Cofounder Status</label>
          </div>

          <div>
            <label className="flex flex-col">Full-time Timeline</label>
            <FormInput
              placeholder="Full-time Timeline"
              {...register("fullTimeTimeline")}
            />
          </div>
        </div>

        <div>
          <label className="mt-6 flex flex-col">Personal Introduction *</label>
          <textarea
            rows={4}
            placeholder="Personal Introduction"
            {...register("personalIntro", {
              required: "Personal intro is required",
            })}
            className="mt-1 w-full rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="mt-6 flex flex-col">Accomplishments</label>
          <textarea
            rows={3}
            placeholder="Accomplishments"
            {...register("accomplishments")}
            className="mt-1 w-full rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="mt-6 flex flex-col">
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
                  className="mt-1"
                />
              );
            }}
          />
        </div>

        <div>
          <label className="mt-6 flex flex-col">Interests</label>
          <textarea
            rows={3}
            placeholder="Interests"
            {...register("interests")}
            className="mt-1 w-full rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </div>

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

        <div>
          <label className="mt-6 flex flex-col">Hobbies</label>
          <textarea
            rows={3}
            placeholder="Hobbies"
            {...register("hobbies")}
            className="mt-1 w-full rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="mt-6 flex flex-col">Journey</label>
          <textarea
            rows={3}
            placeholder="Journey"
            {...register("journey")}
            className="mt-1 w-full rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="mt-6 flex flex-col">Extra</label>
          <textarea
            rows={3}
            placeholder="Extra"
            {...register("extra")}
            className="mt-1 w-full rounded-sm border border-white bg-transparent px-3 py-2 placeholder-gray-400"
          />
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded border border-white px-6 py-2 text-white transition hover:bg-white hover:text-black"
          >
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
