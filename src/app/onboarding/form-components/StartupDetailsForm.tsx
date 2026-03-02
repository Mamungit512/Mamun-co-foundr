"use client";

import React from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";

type StartupAdditionalData = {
  startupTimeSpent?: string;
  startupFunding?: string;
  coFounderStatus?: string;
  fullTimeTimeline?: string;
  responsibilities?: string[];
  equityExpectation?: number;
};

const RESPONSIBILITY_OPTIONS = [
  "Ops",
  "Sales",
  "Design",
  "Engineering",
  "Product",
];

function StartupDetailsForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: StartupAdditionalData) => void;
  onBack: () => void;
  defaultValues?: Partial<StartupAdditionalData>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartupAdditionalData>({
    defaultValues,
  });

  const onSubmit = (data: StartupAdditionalData) => {
    onNext(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 flex flex-col gap-y-4"
    >
      <h2 className="heading-6">More Startup Details</h2>
      <p className="text-sm text-gray-400">
        Optional details that help co-founders understand your startup better.
      </p>

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
        <label>Funding Info</label>
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
          {RESPONSIBILITY_OPTIONS.map((area) => (
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
