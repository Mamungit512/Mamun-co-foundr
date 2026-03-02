"use client";

import React from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";

type YourBackgroundData = {
  gender?: string;
  birthdate?: string;
  accomplishments?: string;
  ummah: string;
  education: string;
  experience: string;
  schedulingUrl?: string;
};

function YourBackgroundForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: YourBackgroundData) => void;
  onBack: () => void;
  defaultValues?: Partial<YourBackgroundData>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<YourBackgroundData>({
    defaultValues,
  });

  const accomplishmentsValue = watch("accomplishments") || "";
  const ummahValue = watch("ummah") || "";
  const educationValue = watch("education") || "";
  const experienceValue = watch("experience") || "";

  const onSubmit = (data: YourBackgroundData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
      <h2 className="heading-6">Your Background</h2>

      {/* Optional personal details */}
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

      {/* Education — required */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="education">Education *</label>
        <textarea
          id="education"
          {...register("education", { required: "Education is required" })}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          rows={3}
          placeholder="Your degree, school, etc."
        />
        <AIWriter
          text={educationValue}
          fieldType="education"
          onAccept={(suggestion) => setValue("education", suggestion)}
        />
        {errors.education && (
          <p className="text-sm text-red-500">{errors.education.message}</p>
        )}
      </div>

      {/* Work Experience — required */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="experience">Work Experience *</label>
        <textarea
          id="experience"
          {...register("experience", { required: "Work experience is required" })}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          rows={3}
          placeholder="Current/previous job title(s)"
        />
        <AIWriter
          text={experienceValue}
          fieldType="experience"
          onAccept={(suggestion) => setValue("experience", suggestion)}
        />
        {errors.experience && (
          <p className="text-sm text-red-500">{errors.experience.message}</p>
        )}
      </div>

      {/* Accomplishments — optional */}
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

      {/* Ummah — required */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="ummah">
          If you were a civilizational engineer for the Ummah, what idea would
          you bring? *
        </label>
        <FormInput
          {...register("ummah", { required: "This field is required" })}
          type="text"
          placeholder="Your idea here"
        />
        <AIWriter
          text={ummahValue}
          fieldType="ummah"
          onAccept={(suggestion) => setValue("ummah", suggestion)}
        />
        {errors.ummah && (
          <p className="text-sm text-red-500">{errors.ummah.message}</p>
        )}
      </div>

      {/* Scheduling URL — optional */}
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

export default YourBackgroundForm;
