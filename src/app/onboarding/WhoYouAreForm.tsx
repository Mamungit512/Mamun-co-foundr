"use client";

import React from "react";
import { useForm } from "react-hook-form";

import FormInput from "@/components/ui/FormInput";

type WhoYouAreFormData = {
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  satisfaction: number;
  gender?: string;
  birthdate?: string;
};

function WhoYouAreForm({
  onNext,
}: {
  onNext: (data: WhoYouAreFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WhoYouAreFormData>();

  const onSubmit = (data: WhoYouAreFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="heading-6 mb-6">Who You Are</h2>
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-6">
          <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
            <label>First Name</label>
            <FormInput
              type="text"
              {...register("firstName", { required: true })}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">First name is required</p>
            )}
          </div>

          <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
            <label htmlFor="lastName">Last Name</label>
            <FormInput
              type="text"
              {...register("lastName", { required: true })}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">Last name is required</p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="city">City</label>
          <FormInput type="text" {...register("city", { required: true })} />
          {errors.city && (
            <p className="text-sm text-red-500">City is required</p>
          )}
        </div>

        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="country">Country</label>
          <FormInput type="text" {...register("country", { required: true })} />
          {errors.country && (
            <p className="text-sm text-red-500">Country is required</p>
          )}
        </div>

        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="satisfaction">
            Current Occupation Satisfaction (%)
          </label>
          <FormInput
            type="number"
            {...register("satisfaction", {
              required: true,
              min: 0,
              max: 100,
              valueAsNumber: true,
            })}
          />
          {errors.satisfaction && (
            <p className="text-sm text-red-500">
              Please enter a number between 0 and 100
            </p>
          )}
        </div>

        <div className="flex gap-x-6">
          <div className="flex w-full flex-col gap-x-20 gap-y-2">
            <label htmlFor="gender">Gender (Optional)</label>
            <FormInput type="text" {...register("gender")} />
          </div>

          <div className="flex w-full flex-col gap-x-20 gap-y-2">
            <label htmlFor="birthdate">Birthdate (Optional)</label>
            <FormInput type="text" {...register("birthdate")} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 rounded bg-white px-4 py-2 text-black"
      >
        Next
      </button>
    </form>
  );
}

export default WhoYouAreForm;
