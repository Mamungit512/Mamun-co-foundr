"use client";

import React from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";

type BackgroundAndSocialsData = {
  gender?: string;
  birthdate?: string;
  accomplishments?: string;
  schedulingUrl?: string;
  linkedin?: string;
  twitter?: string;
  git?: string;
  personalWebsite?: string;
};

function BackgroundAndSocialsForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: BackgroundAndSocialsData) => void;
  onBack: () => void;
  defaultValues?: Partial<BackgroundAndSocialsData>;
}) {
  const { register, handleSubmit, watch, setValue } =
    useForm<BackgroundAndSocialsData>({
      defaultValues,
    });

  const accomplishmentsValue = watch("accomplishments") || "";

  const onSubmit = (data: BackgroundAndSocialsData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
      <h2 className="heading-6">Additional Details</h2>
      <p className="text-sm text-gray-400">
        All fields on this page are optional.
      </p>

      {/* --- Your Background --- */}
      <h3 className="heading-6 text-base">Your Background</h3>

      <div className="flex gap-x-6">
        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="gender">Gender</label>
          <FormInput
            type="text"
            placeholder="e.g. Female, Male, Non-binary"
            {...register("gender")}
          />
        </div>
        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="birthdate">Birthdate</label>
          <FormInput
            type="text"
            placeholder="MM/DD/YYYY"
            {...register("birthdate")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <label htmlFor="accomplishments">Impressive Accomplishments</label>
        <textarea
          id="accomplishments"
          {...register("accomplishments")}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          rows={4}
          placeholder={`Built an app used by 10k+ users\nLaunched a startup\nTop 5% LeetCode`}
        />
        <AIWriter
          text={accomplishmentsValue}
          fieldType="accomplishments"
          onAccept={(suggestion) => setValue("accomplishments", suggestion)}
        />
      </div>

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

      {/* --- Socials --- */}
      <h3 className="heading-6 mt-4 text-base">Socials</h3>

      <div className="flex w-full flex-col gap-x-20 gap-y-2">
        <label htmlFor="linkedin">LinkedIn URL</label>
        <FormInput
          type="text"
          placeholder="https://www.linkedin.com/in/your-name"
          {...register("linkedin")}
        />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="twitter">Twitter URL</label>
        <FormInput
          type="text"
          placeholder="https://twitter.com/yourhandle"
          {...register("twitter")}
        />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="git">GitHub/GitLab URL</label>
        <FormInput
          type="text"
          placeholder="https://github.com/yourusername"
          {...register("git")}
        />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="personalWebsite">Personal Website URL</label>
        <FormInput
          type="text"
          placeholder="https://yourportfolio.com"
          {...register("personalWebsite")}
        />
      </div>

      <div className="mt-6 flex justify-between">
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

export default BackgroundAndSocialsForm;
