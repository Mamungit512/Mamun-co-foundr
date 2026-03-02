"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";

type StartupEssentialsData = {
  hasStartup: "yes" | "no";
  startupName?: string;
  startupDescription?: string;
};

function StartupEssentialsForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: StartupEssentialsData) => void;
  onBack: () => void;
  defaultValues?: Partial<StartupEssentialsData>;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StartupEssentialsData>({
    defaultValues,
  });

  const hasStartup = useWatch({ control, name: "hasStartup" });
  const startupDescriptionValue = watch("startupDescription") || "";

  const onSubmit = (data: StartupEssentialsData) => {
    onNext(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 flex flex-col gap-y-4"
    >
      <h2 className="heading-6">Startup or Idea</h2>

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
            <textarea
              rows={3}
              placeholder="Tell us what it's about in 1–2 sentences"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
              {...register("startupDescription")}
            />
            <AIWriter
              text={startupDescriptionValue}
              fieldType="startupDescription"
              onAccept={(suggestion) =>
                setValue("startupDescription", suggestion)
              }
            />
          </div>
        </>
      )}

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

export default StartupEssentialsForm;
