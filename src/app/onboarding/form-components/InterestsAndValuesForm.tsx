"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";

function InterestsAndValuesForm({
  onBack,
  onNext,
  defaultValues,
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

  const [showOtherInput, setShowOtherInput] = React.useState(false);
  const [otherPriority, setOtherPriority] = React.useState("");

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<InterestsAndValuesFormData>({
      defaultValues,
    });

  const interestsValue = watch("interests") || "";
  const hobbiesValue = watch("hobbies") || "";

  useEffect(() => {
    if (defaultValues?.priorityAreas) {
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
      reset(defaultValues);
    }
  }, [defaultValues, reset, priorityOptions]);

  const onSubmit = (data: InterestsAndValuesFormData) => {
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
        <AIWriter
          text={interestsValue}
          fieldType="interests"
          onAccept={(suggestion) => setValue("interests", suggestion)}
        />
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
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
              value={otherPriority}
              onChange={(e) => setOtherPriority(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Hobbies and Interests */}
      <div className="flex flex-col gap-y-2">
        <label htmlFor="hobbies">Hobbies and Interests</label>
        <AIWriter
          text={hobbiesValue}
          fieldType="hobbies"
          onAccept={(suggestion) => setValue("hobbies", suggestion)}
        />
        <textarea
          rows={2}
          placeholder="e.g. Rock climbing, journaling, strategy games"
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
          {...register("hobbies")}
        />
      </div>

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
          Finish
        </button>
      </div>
    </form>
  );
}

export default InterestsAndValuesForm;