"use client";

import React from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";

type IntroAccomplishmentsFormData = {
  personalIntro: string;
  accomplishments?: string;
  education: string;
  experience: string;
  isTechnical: "yes" | "no";
  schedulingUrl?: string;
};

function IntroAccomplishments({
  onNext,
  onBack,
}: {
  onNext: (data: IntroAccomplishmentsFormData) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntroAccomplishmentsFormData>();

  const onSubmit = (data: IntroAccomplishmentsFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
      <h2 className="heading-6">Your Story</h2>

      {/* Personal Intro */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="personalIntro">Personal Introduction</label>
        <textarea
          id="personalIntro"
          {...register("personalIntro", { required: true })}
          className="rounded-sm border border-gray-400 bg-gray-700 px-2 py-1 text-white"
          rows={4}
          placeholder="Write a short paragraph or two introducing yourself..."
        />
        {errors.personalIntro && (
          <p className="text-sm text-red-500">Intro is required</p>
        )}
      </div>

      {/* Accomplishments */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="accomplishments">Impressive Accomplishments</label>
        <textarea
          id="accomplishments"
          {...register("accomplishments")}
          className="rounded-sm border border-gray-400 bg-gray-700 px-2 py-1 text-white"
          rows={4}
          placeholder={`Built an app used by 10k+ users\nLaunched a startup\nTop 5% LeetCode`}
        />
        {errors.accomplishments && (
          <p className="text-sm text-red-500">
            At least one accomplishment is required
          </p>
        )}
      </div>

      {/* Education */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="education">Education</label>
        <FormInput
          {...register("education", { required: true })}
          type="text"
          placeholder="Your degree, school, etc."
        />
        {errors.education && (
          <p className="text-sm text-red-500">Education is required</p>
        )}
      </div>

      {/* Experience */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="experience">Work Experience</label>
        <FormInput
          {...register("experience", { required: true })}
          type="text"
          placeholder="Current/previous job title(s)"
        />
        {errors.experience && (
          <p className="text-sm text-red-500">Experience is required</p>
        )}
      </div>

      {/* Technical Yes/No */}
      <div className="flex flex-col gap-y-2">
        <label>Do you have a technical background?</label>
        <div className="flex gap-x-4">
          <label>
            <input
              type="radio"
              value="yes"
              {...register("isTechnical", { required: true })}
            />
            <span className="ml-2">Yes</span>
          </label>
          <label>
            <input
              type="radio"
              value="no"
              {...register("isTechnical", { required: true })}
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
          className="rounded border border-white px-4 py-2 text-white"
        >
          Back
        </button>
        <button type="submit" className="rounded bg-white px-4 py-2 text-black">
          Next
        </button>
      </div>
    </form>
  );
}

export default IntroAccomplishments;
