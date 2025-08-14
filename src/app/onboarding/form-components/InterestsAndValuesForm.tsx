"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";


function InterestsAndValuesForm({
  onBack,
  onNext,
  defaultValues, // add this prop
}: {
  onBack: () => void;
  onNext: (data: InterestsAndValuesFormData) => void;
  defaultValues?: Partial<InterestsAndValuesFormData>;
}) {
  const priorityOptions = useMemo(
    () => [
      "Emerging Tech",
      "AI",
      "Healthcare",
      "Fintech",
      "Circular Economy",
      "Climate",
      "Education",
      "Consumer",
    ],
    [],
  );

  // States for the "Other" priority input visibility and value
  const [showOtherInput, setShowOtherInput] = React.useState(false);
  const [otherPriority, setOtherPriority] = React.useState("");

  const { register, handleSubmit, reset } = useForm<InterestsAndValuesFormData>(
    {
      defaultValues,
    },
  );

  // When defaultValues change (or on mount), check if "Other" should be shown and prefilled
  useEffect(() => {
    if (defaultValues?.priorityAreas) {
      // Filter priorityAreas to those not in preset options
      const others = defaultValues.priorityAreas.filter(
        (area) => !priorityOptions.includes(area),
      );
      if (others.length > 0) {
        setShowOtherInput(true);
        setOtherPriority(others[0]);
      } else {
        setShowOtherInput(false);
        setOtherPriority("");
      }
      // Reset form with new defaultValues
      reset(defaultValues);
    }
  }, [defaultValues, reset, priorityOptions]);

  const onSubmit = (data: InterestsAndValuesFormData) => {
    // Combine checked priorities with the "Other" if shown and filled
    const mergedPriorityAreas = [
      ...(data.priorityAreas || []),
      ...(showOtherInput && otherPriority ? [otherPriority] : []),
    ];
    onNext({ ...data, priorityAreas: mergedPriorityAreas });
  };

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
                defaultChecked={defaultValues?.priorityAreas?.includes(area)}
              />
              <span>{area}</span>
            </label>
          ))}

          {/* "Other" checkbox */}
          <label className="flex items-center gap-x-2">
            <input
              type="checkbox"
              checked={showOtherInput}
              onChange={(e) => setShowOtherInput(e.target.checked)}
            />
            <span>Other</span>
          </label>

          {showOtherInput && (
            <input
              type="text"
              placeholder="Please specify"
              className="rounded-sm border border-gray-400 bg-gray-700 px-2 py-1 text-white"
              value={otherPriority}
              onChange={(e) => setOtherPriority(e.target.value)}
            />
          )}
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
