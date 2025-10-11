"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";

function StartupDetailsForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: StartupDetailsFormData) => void;
  onBack: () => void;
  defaultValues?: Partial<StartupDetailsFormData>;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<StartupDetailsFormData>({
    defaultValues,
  });

  const hasStartup = useWatch({ control, name: "hasStartup" });

  const startupDescriptionValue = watch("startupDescription") || "";
  const startupTimeSpentValue = watch("startupTimeSpent") || "";
  const startupFundingValue = watch("startupFunding") || "";
  const coFounderStatusValue = watch("coFounderStatus") || "";
  const fullTimeTimelineValue = watch("fullTimeTimeline") || "";

  const onSubmit = (data: StartupDetailsFormData) => {
    onNext(data);
  };

  const responsibilityOptions = [
    "Ops",
    "Sales",
    "Design",
    "Engineering",
    "Product",
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 flex flex-col gap-y-4"
    >
      <h2 className="heading-6">Startup or Idea</h2>

      {/* Yes/No question */}
      <div className="flex flex-col gap-y-2">
        <label>Do you already have a startup or idea? *</label>
        <div className="flex gap-x-4">
          <label>
            <input
              type="radio"
              value="yes"
              {...register("hasStartup", { required: true })}
            />
            <span className="ml-2">Yes</span>
          </label>
          <label>
            <input
              type="radio"
              value="no"
              {...register("hasStartup", { required: true })}
            />
            <span className="ml-2">No</span>
          </label>
        </div>
        {errors.hasStartup && (
          <p className="text-sm text-red-500">This field is required</p>
        )}
      </div>

      {/* Conditional Fields */}
      {hasStartup === "yes" && (
        <>
          <div className="flex flex-col gap-y-2">
            <label>Company or Project Name</label>
            <FormInput
              type="text"
              placeholder="e.g. Cohub, FinTrack"
              {...register("startupName")}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Brief Description</label>
            <AIWriter
              text={startupDescriptionValue}
              fieldType="startupDescription"
              onAccept={(suggestion) =>
                setValue("startupDescription", suggestion)
              }
            />
            <textarea
              rows={3}
              placeholder="Tell us what it's about in 1–2 sentences"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
              {...register("startupDescription")}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Time Spent & Progress</label>
            <AIWriter
              text={startupTimeSpentValue}
              fieldType="startupTimeSpent"
              onAccept={(suggestion) => setValue("startupTimeSpent", suggestion)}
            />
            <FormInput
              type="text"
              placeholder="e.g. 3 months in, MVP built and 5 users"
              {...register("startupTimeSpent")}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Funding Info (if applicable)</label>
            <AIWriter
              text={startupFundingValue}
              fieldType="startupFunding"
              onAccept={(suggestion) => setValue("startupFunding", suggestion)}
            />
            <FormInput
              type="text"
              placeholder="e.g. Bootstrapped, Pre-seed, $20k grant"
              {...register("startupFunding")}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Co-founder Status</label>
            <AIWriter
              text={coFounderStatusValue}
              fieldType="coFounderStatus"
              onAccept={(suggestion) =>
                setValue("coFounderStatus", suggestion)
              }
            />
            <FormInput
              type="text"
              placeholder="e.g. Solo founder, Seeking co-founder, Already partnered"
              {...register("coFounderStatus")}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Timeline for Going Full-Time</label>
            <AIWriter
              text={fullTimeTimelineValue}
              fieldType="fullTimeTimeline"
              onAccept={(suggestion) =>
                setValue("fullTimeTimeline", suggestion)
              }
            />
            <FormInput
              type="text"
              placeholder="e.g. Within 3 months, Already full-time"
              {...register("fullTimeTimeline")}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Equity Expectation (%)</label>
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
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Responsibility Areas</label>
            <div className="flex flex-wrap gap-3">
              {responsibilityOptions.map((area) => (
                <label key={area} className="flex items-center gap-x-2">
                  <input
                    type="checkbox"
                    value={area}
                    {...register("responsibilities")}
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Navigation Buttons */}
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

export default StartupDetailsForm;
