"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import type { OnboardingData } from "../onboarding/types";

import { useUserProfile } from "@/services/useProfile";

export default function EditProfile() {
  const { data: profileData, isLoading, isError, error } = useUserProfile();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Partial<OnboardingData>>({
    defaultValues: profileData,
  });

  useEffect(() => {
    if (profileData) reset(profileData);
  }, [profileData, reset]);

  const onSubmit = (formData: Partial<OnboardingData>) => {
    // mutation.mutate(formData);
    console.log(formData);
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (isError) return <p>Error loading profile: {error?.message}</p>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-3xl space-y-6 p-6"
    >
      <h1 className="mb-6 text-2xl font-bold">Edit Your Profile</h1>

      {/* WhoYouAreFormData */}
      <div>
        <label>First Name *</label>
        <input
          {...register("firstName", { required: "First name is required" })}
          className="input"
          type="text"
        />
        {errors.firstName && (
          <p className="error">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label>Last Name *</label>
        <input
          {...register("lastName", { required: "Last name is required" })}
          className="input"
          type="text"
        />
        {errors.lastName && <p className="error">{errors.lastName.message}</p>}
      </div>

      <div>
        <label>City *</label>
        <input
          {...register("city", { required: "City is required" })}
          className="input"
          type="text"
        />
        {errors.city && <p className="error">{errors.city.message}</p>}
      </div>

      <div>
        <label>Country *</label>
        <input
          {...register("country", { required: "Country is required" })}
          className="input"
          type="text"
        />
        {errors.country && <p className="error">{errors.country.message}</p>}
      </div>

      <div>
        <label>Satisfaction (0-10) *</label>
        <input
          {...register("satisfaction", {
            required: "Satisfaction is required",
            min: { value: 0, message: "Minimum is 0" },
            max: { value: 10, message: "Maximum is 10" },
            valueAsNumber: true,
          })}
          className="input"
          type="number"
          min={0}
          max={10}
        />
        {errors.satisfaction && (
          <p className="error">{errors.satisfaction.message}</p>
        )}
      </div>

      <div>
        <label>Gender</label>
        <input {...register("gender")} className="input" type="text" />
      </div>

      <div>
        <label>Birthdate</label>
        <input {...register("birthdate")} className="input" type="date" />
      </div>

      {/* IntroAccomplishmentsFormData */}
      <div>
        <label>Personal Introduction *</label>
        <textarea
          {...register("personalIntro", {
            required: "Personal intro is required",
          })}
          className="input"
          rows={4}
        />
        {errors.personalIntro && (
          <p className="error">{errors.personalIntro.message}</p>
        )}
      </div>

      <div>
        <label>Accomplishments</label>
        <textarea {...register("accomplishments")} className="input" rows={3} />
      </div>

      <div>
        <label>Education *</label>
        <input
          {...register("education", { required: "Education is required" })}
          className="input"
          type="text"
        />
        {errors.education && (
          <p className="error">{errors.education.message}</p>
        )}
      </div>

      <div>
        <label>Experience *</label>
        <input
          {...register("experience", { required: "Experience is required" })}
          className="input"
          type="text"
        />
        {errors.experience && (
          <p className="error">{errors.experience.message}</p>
        )}
      </div>

      <div>
        <label>Are you technical? *</label>
        <select
          {...register("isTechnical", {
            required: "Please select technical status",
            validate: (v) => v === "yes" || v === "no" || "Must be yes or no",
          })}
          className="input"
        >
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        {errors.isTechnical && (
          <p className="error">{errors.isTechnical.message}</p>
        )}
      </div>

      <div>
        <label>Scheduling URL</label>
        <input {...register("schedulingUrl")} className="input" type="url" />
      </div>

      {/* OnboardingSocialsFormData */}
      <div>
        <label>LinkedIn</label>
        <input {...register("linkedin")} className="input" type="url" />
      </div>

      <div>
        <label>Twitter</label>
        <input {...register("twitter")} className="input" type="url" />
      </div>

      <div>
        <label>GitHub</label>
        <input {...register("git")} className="input" type="url" />
      </div>

      <div>
        <label>Personal Website</label>
        <input {...register("personalWebsite")} className="input" type="url" />
      </div>

      {/* StartupDetailsFormData */}
      <div>
        <label>Do you have a startup? *</label>
        <select
          {...register("hasStartup", {
            required: "Please select an option",
            validate: (v) => v === "yes" || v === "no" || "Must be yes or no",
          })}
          className="input"
        >
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        {errors.hasStartup && (
          <p className="error">{errors.hasStartup.message}</p>
        )}
      </div>

      <div>
        <label>Startup Name</label>
        <input {...register("name")} className="input" type="text" />
      </div>

      <div>
        <label>Startup Description</label>
        <textarea {...register("description")} className="input" rows={3} />
      </div>

      <div>
        <label>Time Spent on Startup</label>
        <input {...register("timeSpent")} className="input" type="text" />
      </div>

      <div>
        <label>Startup Funding</label>
        <input {...register("funding")} className="input" type="text" />
      </div>

      <div>
        <label>Cofounder Status</label>
        <input {...register("coFounderStatus")} className="input" type="text" />
      </div>

      <div>
        <label>Full-time Timeline</label>
        <input
          {...register("fullTimeTimeline")}
          className="input"
          type="text"
        />
      </div>

      <div>
        <label>Responsibilities (comma separated)</label>
        <Controller
          control={control}
          name="responsibilities"
          render={({ field }) => {
            const value = Array.isArray(field.value)
              ? field.value.join(", ")
              : "";
            return (
              <input
                className="input"
                type="text"
                value={value}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  field.onChange(arr);
                }}
              />
            );
          }}
        />
      </div>

      {/* InterestsAndValuesFormData */}
      <div>
        <label>Interests</label>
        <textarea {...register("interests")} className="input" rows={3} />
      </div>

      <div>
        <label>Priority Areas (comma separated)</label>
        <Controller
          control={control}
          name="priorityAreas"
          render={({ field }) => {
            const value = Array.isArray(field.value)
              ? field.value.join(", ")
              : "";
            return (
              <input
                className="input"
                type="text"
                value={value}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  field.onChange(arr);
                }}
              />
            );
          }}
        />
      </div>

      <div>
        <label>Hobbies</label>
        <textarea {...register("hobbies")} className="input" rows={3} />
      </div>

      <div>
        <label>Journey</label>
        <textarea {...register("journey")} className="input" rows={3} />
      </div>

      <div>
        <label>Extra</label>
        <textarea {...register("extra")} className="input" rows={3} />
      </div>

      <button
        type="submit"
        // disabled={isSaving}
        className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
      >
        Save Changes
        {/* {isSaving ? "Saving..." : "Save Changes"} */}
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        // disabled={isSubmitting || mutation.isLoading}
        className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
      >
        Save Changes
        {/* {mutation.isLoading ? "Saving..." : "Save Changes"} */}
      </button>
    </form>
  );
}
