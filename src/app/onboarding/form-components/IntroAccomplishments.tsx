"use client";

import React from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";

function IntroAccomplishments({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: IntroAccomplishmentsFormData) => void;
  onBack: () => void;
  defaultValues?: Partial<IntroAccomplishmentsFormData>;
}) {
  // Pass defaultValues to useForm for pre-filling inputs
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IntroAccomplishmentsFormData>({
    defaultValues,
  });

  // Watch isTechnical for radio checked state
  const isTechnicalValue = watch("isTechnical");

  const onSubmit = (data: IntroAccomplishmentsFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
      <h2 className="heading-6">Your Story</h2>

      {/* Personal Intro */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="personalIntro">Personal Introduction *</label>
        <textarea
          id="personalIntro"
          {...register("personalIntro", {
            required:
              "Your bio/introduction cannot be empty. Please write a short paragraph introducing yourself.",
            minLength: {
              value: 10,
              message: "Your bio must be at least 10 characters long.",
            },
          })}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          rows={4}
          placeholder="Write a short paragraph or two introducing yourself..."
        />
        {errors.personalIntro && (
          <p className="text-sm text-red-500">{errors.personalIntro.message}</p>
        )}
      </div>

      {/* Accomplishments */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="accomplishments">Impressive Accomplishments</label>
        <textarea
          id="accomplishments"
          {...register("accomplishments")}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          rows={4}
          placeholder={`Built an app used by 10k+ users\nLaunched a startup\nTop 5% LeetCode`}
        />
        {/* No validation error needed here unless you want it */}
      </div>

      {/* Ummah Question */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="ummah">
          If you were a civilizational engineer for the Ummah, what idea would
          you bring? *
        </label>
        <FormInput
          {...register("ummah", { required: true })}
          type="text"
          placeholder="Your idea here"
        />
        {errors.ummah && (
          <p className="text-sm text-red-500">
            &quot;If you were a civilizational engineer...&quot; is required
          </p>
        )}
      </div>

      {/* Education */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="education">Education *</label>
        <textarea
          id="education"
          {...register("education", { required: true })}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          rows={3}
          placeholder="Your degree, school, etc."
        />
        {errors.education && (
          <p className="text-sm text-red-500">Education is required</p>
        )}
      </div>

      {/* Experience */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="experience">Work Experience *</label>
        <textarea
          id="experience"
          {...register("experience", { required: true })}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          rows={3}
          placeholder="Current/previous job title(s)"
        />
        {errors.experience && (
          <p className="text-sm text-red-500">Experience is required</p>
        )}
      </div>

      {/* Technical Yes/No */}
      <div className="flex flex-col gap-y-2">
        <label>Do you have a technical background? *</label>
        <div className="flex gap-x-4">
          <label>
            <input
              type="radio"
              value="yes"
              {...register("isTechnical", { required: true })}
              checked={isTechnicalValue === "yes"}
            />
            <span className="ml-2">Yes</span>
          </label>
          <label>
            <input
              type="radio"
              value="no"
              {...register("isTechnical", { required: true })}
              checked={isTechnicalValue === "no"}
            />
            <span className="ml-2">No</span>
          </label>
        </div>
        {errors.isTechnical && (
          <p className="text-sm text-red-500">Please select an option</p>
        )}
      </div>

      {/* Scheduling URL (optional) */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="schedulingUrl">
          Scheduling Link (Calendly, Google Calendar)
        </label>
        <FormInput
          {...register("schedulingUrl")}
          type="url"
          placeholder="https://calendly.com/your-link"
        />
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded border border-white px-4 py-2 text-white"
        >
          Back
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded bg-white px-4 py-2 text-black"
        >
          Next
        </button>
      </div>
    </form>
  );
}

export default IntroAccomplishments;
