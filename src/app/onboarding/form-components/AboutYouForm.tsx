"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import AIWriter from "@/components/ui/AIWriter";
import LocationSelector from "@/components/ui/LocationSelector";
import { useStepEntry, useErrorShake } from "@/hooks/useOnboardingAnimation";

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

const TEXTAREA_CLS =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white/90 placeholder-white/30 transition-all duration-200 focus:border-white/25 focus:bg-white/8 focus:ring-2 focus:ring-white/15 focus:outline-none hover:border-white/20 resize-none";

const LABEL_CLS = "text-xs font-semibold tracking-widest text-white/45 uppercase";

const PILL_RADIO_CLS =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all duration-150 hover:border-white/20 hover:bg-white/8 has-[:checked]:border-white/40 has-[:checked]:bg-white/15 has-[:checked]:text-white";

function AboutYouForm({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: AboutYouData) => void;
  onBack: () => void;
  defaultValues?: Partial<AboutYouData>;
}) {
  const fieldsRef = useStepEntry();
  const { formRef, triggerShake } = useErrorShake();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AboutYouData>({ defaultValues });

  const titleValue = watch("title") || "";
  const educationValue = watch("education") || "";
  const experienceValue = watch("experience") || "";
  const personalIntroValue = watch("personalIntro") || "";
  const ummahValue = watch("ummah") || "";
  const isTechnicalValue = watch("isTechnical");

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const errCount = Object.keys(errors).length;
  useEffect(() => {
    if (errCount > 0) triggerShake();
  }, [errCount, triggerShake]);

  const onSubmit = (data: AboutYouData) => onNext(data);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      {/*
       * Outer container: gap-y-8 (32px) between logical groups.
       * Header gets pb-4 → effective opener = 32+16 = 48px.
       * Nav gets pt-10 → effective CTA gap = 32+40 = 72px.
       */}
      <div ref={fieldsRef} className="flex flex-col gap-y-8">

        {/* ── Header ── */}
        <div className="pb-4">
          <p className="mb-1 text-xs font-semibold tracking-widest text-white/40 uppercase">
            Step 2 of 6
          </p>
          <h2 className="text-2xl font-bold text-white">About you</h2>
          <p className="mt-1.5 text-sm text-white/50">
            Help potential co-founders understand who you are.
          </p>
        </div>

        {/* ── Identity: Name + Title ── */}
        <div className="flex flex-col gap-y-5">
          {/* Name row */}
          <div className="flex gap-x-4">
            <div className="flex w-full flex-col gap-y-1.5">
              <label className={LABEL_CLS}>First Name *</label>
              <FormInput
                type="text"
                placeholder="e.g. Teslim"
                {...register("firstName", { required: true })}
              />
              {errors.firstName && (
                <p className="text-xs text-red-400">First name is required</p>
              )}
            </div>
            <div className="flex w-full flex-col gap-y-1.5">
              <label className={LABEL_CLS}>Last Name *</label>
              <FormInput
                type="text"
                placeholder="e.g. Deen"
                {...register("lastName", { required: true })}
              />
              {errors.lastName && (
                <p className="text-xs text-red-400">Last name is required</p>
              )}
            </div>
          </div>

          {/* Job Title */}
          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>Job Title *</label>
            <FormInput
              type="text"
              placeholder="e.g. UX Designer, Software Engineer"
              {...register("title", { required: true })}
            />
            <AIWriter
              text={titleValue}
              fieldType="title"
              onAccept={(s) => setValue("title", s)}
            />
            {errors.title && (
              <p className="text-xs text-red-400">Job title is required</p>
            )}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="flex flex-col gap-y-1.5">
          <input type="hidden" {...register("country", { required: true })} />
          <input type="hidden" {...register("city", { required: true })} />
          <input type="hidden" {...register("state")} />
          <LocationSelector
            countryValue={watch("country") || ""}
            stateValue={watch("state") || ""}
            cityValue={watch("city") || ""}
            onCountryChange={(v) =>
              setValue("country", v, { shouldValidate: true })
            }
            onStateChange={(v) =>
              setValue("state", v, { shouldValidate: true })
            }
            onCityChange={(v) =>
              setValue("city", v, { shouldValidate: true })
            }
            errors={{
              country: errors.country ? "Country is required" : undefined,
              state: errors.state ? "State is required" : undefined,
              city: errors.city ? "City is required" : undefined,
            }}
          />
        </div>

        {/* ── Professional Background: Education + Experience ── */}
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>Education *</label>
            <textarea
              {...register("education", { required: "Education is required" })}
              className={TEXTAREA_CLS}
              rows={3}
              placeholder="Your degree, school, etc."
            />
            <AIWriter
              text={educationValue}
              fieldType="education"
              onAccept={(s) => setValue("education", s)}
            />
            {errors.education && (
              <p className="text-xs text-red-400">{errors.education.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label className={LABEL_CLS}>Work Experience *</label>
            <textarea
              {...register("experience", {
                required: "Work experience is required",
              })}
              className={TEXTAREA_CLS}
              rows={3}
              placeholder="Current/previous job title(s)"
            />
            <AIWriter
              text={experienceValue}
              fieldType="experience"
              onAccept={(s) => setValue("experience", s)}
            />
            {errors.experience && (
              <p className="text-xs text-red-400">
                {errors.experience.message}
              </p>
            )}
          </div>
        </div>

        {/* ── Personal Intro ── */}
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Personal Introduction *</label>
          <textarea
            {...register("personalIntro", {
              required: "Your introduction cannot be empty.",
              minLength: {
                value: 10,
                message: "Must be at least 10 characters.",
              },
            })}
            className={TEXTAREA_CLS}
            rows={4}
            placeholder="Write a short paragraph introducing yourself…"
          />
          <AIWriter
            text={personalIntroValue}
            fieldType="personalIntro"
            onAccept={(s) => setValue("personalIntro", s)}
          />
          {errors.personalIntro && (
            <p className="text-xs text-red-400">
              {errors.personalIntro.message}
            </p>
          )}
        </div>

        {/* ── Ummah Vision ── */}
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Ummah Vision *</label>
          <p className="text-xs leading-relaxed text-white/40">
            If you were a civilizational engineer for the Ummah, what idea would
            you bring?
          </p>
          <FormInput
            {...register("ummah", { required: "This field is required" })}
            type="text"
            placeholder="Your idea here"
          />
          <AIWriter
            text={ummahValue}
            fieldType="ummah"
            onAccept={(s) => setValue("ummah", s)}
          />
          {errors.ummah && (
            <p className="text-xs text-red-400">{errors.ummah.message}</p>
          )}
        </div>

        {/* ── Mindset: Satisfaction + Battery + Technical ── */}
        <div className="flex flex-col gap-y-5">
          {/* Satisfaction */}
          <div className="flex flex-col gap-y-3">
            <label className={LABEL_CLS}>Current Occupation Satisfaction *</label>
            <div className="flex flex-col gap-y-2">
              {(["Happy", "Content", "Browsing"] as const).map((option) => (
                <label key={option} className={PILL_RADIO_CLS}>
                  <input
                    type="radio"
                    value={option}
                    {...register("satisfaction", { required: true })}
                    className="sr-only"
                  />
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-150 ${
                      watch("satisfaction") === option
                        ? "border-white bg-white"
                        : "border-white/30 bg-transparent"
                    }`}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors.satisfaction && (
              <p className="text-xs text-red-400">Please select an option</p>
            )}
          </div>

          {/* Battery Level */}
          <div className="flex flex-col gap-y-3">
            <label className={LABEL_CLS}>Founder&apos;s Battery Level *</label>
            <div className="flex flex-col gap-y-2">
              {(["Energized", "Content", "Burnt out"] as const).map(
                (option) => (
                  <label key={option} className={PILL_RADIO_CLS}>
                    <input
                      type="radio"
                      value={option}
                      {...register("batteryLevel", { required: true })}
                      className="sr-only"
                    />
                    <span
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-150 ${
                        watch("batteryLevel") === option
                          ? "border-white bg-white"
                          : "border-white/30 bg-transparent"
                      }`}
                    />
                    {option}
                  </label>
                ),
              )}
            </div>
            {errors.batteryLevel && (
              <p className="text-xs text-red-400">Please select an option</p>
            )}
          </div>

          {/* Technical */}
          <div className="flex flex-col gap-y-3">
            <label className={LABEL_CLS}>Technical Background? *</label>
            <div className="flex gap-x-3">
              {(["yes", "no"] as const).map((val) => (
                <label
                  key={val}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ${
                    isTechnicalValue === val
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  <input
                    type="radio"
                    value={val}
                    {...register("isTechnical", { required: true })}
                    className="sr-only"
                  />
                  {val === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
            {errors.isTechnical && (
              <p className="text-xs text-red-400">Please select an option</p>
            )}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-4 pt-10 border-t border-white/8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/60 transition-all duration-200 hover:border-white/30 hover:text-white"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:bg-white/90 active:scale-[0.98] sm:flex-none"
          >
            Continue →
          </button>
        </div>

      </div>
    </form>
  );
}

export default AboutYouForm;
