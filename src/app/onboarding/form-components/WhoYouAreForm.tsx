"use client";
// File to edit for redeployment

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import FormInput from "@/components/ui/FormInput";

function WhoYouAreForm({
  onNext,
  defaultValues,
}: {
  onNext: (data: WhoYouAreFormData) => void;
  defaultValues?: Partial<WhoYouAreFormData>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WhoYouAreFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: WhoYouAreFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="heading-6 mb-6">Your Profile Basics</h2>
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-6">
          {/* First Name */}
          <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
            <label>First Name *</label>
            <FormInput
              type="text"
              placeholder="e.g. Teslim"
              {...register("firstName", { required: true })}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">First name is required</p>
            )}
          </div>

          {/* Last Name */}
          <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
            <label htmlFor="lastName">Last Name *</label>
            <FormInput
              type="text"
              placeholder="e.g. Deen"
              {...register("lastName", { required: true })}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">Last name is required</p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
          <label htmlFor="lastName">Job Title *</label>
          <FormInput
            type="text"
            placeholder="e.g. UX Designer, Software Engineer, etc"
            {...register("title", { required: true })}
          />
          {errors.title && (
            <p className="text-sm text-red-500">Job title is required</p>
          )}
        </div>

        {/* City */}
        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="city">City *</label>
          <FormInput
            type="text"
            placeholder="e.g. Austin"
            {...register("city", { required: true })}
          />
          {errors.city && (
            <p className="text-sm text-red-500">City is required</p>
          )}
        </div>

        {/* Country */}
        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="country">Country *</label>
          <FormInput
            type="text"
            placeholder="e.g. United States"
            {...register("country", { required: true })}
          />
          {errors.country && (
            <p className="text-sm text-red-500">Country is required</p>
          )}
        </div>

        {/* Current Occupation Satisfaction */}
        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="satisfaction">
            Current Occupation Satisfaction *
          </label>
          <div className="flex flex-col gap-y-2">
            {["Happy", "Content", "Browsing"].map((option) => (
              <label key={option} className="flex items-center gap-x-2">
                <input
                  type="radio"
                  value={option}
                  {...register("satisfaction", { required: true })}
                  className="text-(--mist-white) focus:ring-(--mist-white)"
                />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
          {errors.satisfaction && (
            <p className="text-sm text-red-500">
              Please select your current occupation satisfaction level
            </p>
          )}
        </div>

        {/* Battery Level */}
        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="batteryLevel">Founder&apos;s Battery Level *</label>
          <div className="flex flex-col gap-y-2">
            {["Energized", "Content", "Burnt out"].map((option) => (
              <label key={option} className="flex items-center gap-x-2">
                <input
                  type="radio"
                  value={option}
                  {...register("batteryLevel", { required: true })}
                  className="text-(--mist-white) focus:ring-(--mist-white)"
                />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
          {errors.batteryLevel && (
            <p className="text-sm text-red-500">
              Please select your current battery level
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="flex gap-x-6">
          <div className="flex w-full flex-col gap-x-20 gap-y-2">
            <label htmlFor="gender">Gender (Optional)</label>
            <FormInput
              type="text"
              placeholder="e.g. Female, Male, Non-binary"
              {...register("gender")}
            />
          </div>

          {/* Birthdate */}
          <div className="flex w-full flex-col gap-x-20 gap-y-2">
            <label htmlFor="birthdate">Birthdate (Optional)</label>
            <FormInput
              type="text"
              placeholder="MM/DD/YYYY"
              {...register("birthdate")}
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 cursor-pointer rounded bg-(--mist-white) px-4 py-2 text-(--charcoal-black)"
      >
        Next
      </button>
    </form>
  );
}

export default WhoYouAreForm;
