"use client";

import React from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";

export type InterestsAndValuesFormData = {
  interests?: string;
  priorityAreas?: string[];
  hobbies?: string;
  journey?: string;
  extra?: string;
};

function InterestsAndValuesForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: InterestsAndValuesFormData) => void;
}) {
  const { register, handleSubmit } = useForm<InterestsAndValuesFormData>();

  const onSubmit = (data: InterestsAndValuesFormData) => {
    onNext(data);
  };

  const priorityOptions = [
    "Emerging Tech",
    "AI",
    "Healthcare",
    "Fintech",
    "Circular Economy",
    "Climate",
    "Education",
    "Consumer",
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 flex flex-col gap-y-4"
    >
      <h2 className="heading-6">Your Interests & Values</h2>

      {/* Topics/Industries of Interest */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="interests">
          Topics or Industries You&apos;re Interested In
        </label>
        <FormInput
          type="text"
          placeholder="e.g. AI in mental health, fintech for creators"
          {...register("interests")}
        />
      </div>

      {/* MAMUN Priority List */}
      <div className="flex flex-col gap-y-2">
        <label>MAMUN Priority Areas (Choose any that apply)</label>
        <div className="flex flex-wrap gap-3">
          {priorityOptions.map((area) => (
            <label key={area} className="flex items-center gap-x-2">
              <input
                type="checkbox"
                value={area}
                {...register("priorityAreas")}
              />
              <span>{area}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hobbies and Interests */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="hobbies">Hobbies and Interests</label>
        <textarea
          rows={2}
          placeholder="e.g. Rock climbing, journaling, strategy games"
          className="rounded-sm border border-gray-400 bg-gray-700 px-2 py-1 text-white"
          {...register("hobbies")}
        />
      </div>

      {/* Life Journey & Values */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="journey">Life Journey & Values</label>
        <textarea
          rows={3}
          placeholder="Share a few sentences that reflect who you are and what you care about"
          className="rounded-sm border border-gray-400 bg-gray-700 px-2 py-1 text-white"
          {...register("journey")}
        />
      </div>

      {/* Anything else you'd like to add */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="extra">Anything else you&apos;d like to add?</label>
        <textarea
          rows={3}
          placeholder="Open space for anything we didn’t cover"
          className="rounded-sm border border-gray-400 bg-gray-700 px-2 py-1 text-white"
          {...register("extra")}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-white px-4 py-2 text-white"
        >
          Back
        </button>
        <button type="submit" className="rounded bg-white px-4 py-2 text-black">
          Finish
        </button>
      </div>
    </form>
  );
}

export default InterestsAndValuesForm;
