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
    watch, 
    setValue, 
    formState: { errors },
  } = useForm<StartupDetailsFormData>({
    defaultValues,
  });

  const hasStartup = useWatch({ control, name: "hasStartup" });
  
  const startupDescriptionValue = watch("startupDescription") || "";

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
            <select
              {...register("startupTimeSpent")}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
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

          <div className="flex flex-col gap-y-2">
            <label>Funding Info (if applicable)</label>
            <select
              {...register("startupFunding")}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
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

          <div className="flex flex-col gap-y-2">
            <label>Co-Founder Status</label>
            <div className="flex flex-col gap-y-2">
              {["Solo founder", "Have co-founder(s)", "Seeking co-founder"].map(
                (option) => (
                  <label key={option} className="flex items-center gap-x-2">
                    <input
                      type="radio"
                      value={option}
                      {...register("coFounderStatus")}
                      className="text-(--mist-white) focus:ring-(--mist-white)"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <label>Timeline for Going Full-Time</label>
            <select
              {...register("fullTimeTimeline")}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-white/30 focus:outline-none"
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
            {errors.equityExpectation && (
              <p className="text-sm text-red-500">
                {errors.equityExpectation.message}
              </p>
            )}
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