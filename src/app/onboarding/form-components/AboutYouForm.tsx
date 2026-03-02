"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import LocationSelector from "@/components/ui/LocationSelector";

type AboutYouData = {
  firstName: string;
  lastName: string;
  title: string;
  city: string;
  country: string;
  state?: string;
  education: string;
  experience: string;
  personalIntro: string;
  ummah: string;
  satisfaction: "Happy" | "Content" | "Browsing";
  batteryLevel: "Energized" | "Content" | "Burnt out";
  isTechnical: "yes" | "no";
};

function AboutYouForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: AboutYouData) => void;
  onBack: () => void;
  defaultValues?: Partial<AboutYouData>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AboutYouData>({
    defaultValues,
  });

  const titleValue = watch("title") || "";
  const educationValue = watch("education") || "";
  const experienceValue = watch("experience") || "";
  const personalIntroValue = watch("personalIntro") || "";
  const ummahValue = watch("ummah") || "";
  const isTechnicalValue = watch("isTechnical");

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: AboutYouData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="heading-6 mb-6">About You</h2>
      <div className="flex flex-col gap-y-3">
        {/* Name */}
        <div className="flex gap-x-6">
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

        {/* Job Title */}
        <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
          <label htmlFor="title">Job Title *</label>
          <FormInput
            type="text"
            placeholder="e.g. UX Designer, Software Engineer, etc"
            {...register("title", { required: true })}
          />
          <AIWriter
            text={titleValue}
            fieldType="title"
            onAccept={(suggestion) => setValue("title", suggestion)}
          />
          {errors.title && (
            <p className="text-sm text-red-500">Job title is required</p>
          )}
        </div>

        {/* Location */}
        <input type="hidden" {...register("country", { required: true })} />
        <input type="hidden" {...register("city", { required: true })} />
        <input type="hidden" {...register("state")} />

        <LocationSelector
          countryValue={watch("country") || ""}
          stateValue={watch("state") || ""}
          cityValue={watch("city") || ""}
          onCountryChange={(country) =>
            setValue("country", country, { shouldValidate: true })
          }
          onStateChange={(state) =>
            setValue("state", state, { shouldValidate: true })
          }
          onCityChange={(city) =>
            setValue("city", city, { shouldValidate: true })
          }
          errors={{
            country: errors.country ? "Country is required" : undefined,
            state: errors.state ? "State is required" : undefined,
            city: errors.city ? "City is required" : undefined,
          }}
        />

        {/* Education */}
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

        {/* Work Experience */}
        <div className="flex flex-col gap-y-2">
          <label htmlFor="experience">Work Experience *</label>
          <textarea
            id="experience"
            {...register("experience", {
              required: "Work experience is required",
            })}
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

        {/* Personal Intro */}
        <div className="flex flex-col gap-y-2">
          <label htmlFor="personalIntro">Personal Introduction *</label>
          <textarea
            id="personalIntro"
            {...register("personalIntro", {
              required:
                "Your bio/introduction cannot be empty. Please write a short paragraph introducing yourself.",
              minLength: {
                value: 10,
                message: "Your bio must be at least 10 characters long.",
              },
            })}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
            rows={4}
            placeholder="Write a short paragraph or two introducing yourself..."
          />
          <AIWriter
            text={personalIntroValue}
            fieldType="personalIntro"
            onAccept={(suggestion) => setValue("personalIntro", suggestion)}
          />
          {errors.personalIntro && (
            <p className="text-sm text-red-500">
              {errors.personalIntro.message}
            </p>
          )}
        </div>

        {/* Ummah */}
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

        {/* Satisfaction */}
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

        {/* Technical */}
        <div className="flex flex-col gap-y-2">
          <label>Do you have a technical background? *</label>
          <div className="flex gap-x-4">
            <label>
              <input
                type="radio"
                value="yes"
                {...register("isTechnical", { required: true })}
                checked={isTechnicalValue === "yes"}
              />
              <span className="ml-2">Yes</span>
            </label>
            <label>
              <input
                type="radio"
                value="no"
                {...register("isTechnical", { required: true })}
                checked={isTechnicalValue === "no"}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
          {errors.isTechnical && (
            <p className="text-sm text-red-500">Please select an option</p>
          )}
        </div>
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
          className="cursor-pointer rounded bg-(--mist-white) px-4 py-2 text-(--charcoal-black)"
        >
          Next
        </button>
      </div>
    </form>
  );
}

export default AboutYouForm;
