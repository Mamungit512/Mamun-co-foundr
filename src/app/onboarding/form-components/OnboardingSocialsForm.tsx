import FormInput from "@/components/ui/FormInput";
import React from "react";
import { useForm } from "react-hook-form";

type OnboardingSocialsFormData = {
  linkedin: string;
  twitter: string;
  git: string;
  personalWebsite: string;
};

function OnboardingSocialsForm({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: OnboardingSocialsFormData) => void;
}) {
  const { register, handleSubmit } = useForm<OnboardingSocialsFormData>();

  const onSubmit = (data: OnboardingSocialsFormData) => {
    onNext(data);
  };
  return (
    <form
      className="mt-14 flex flex-col gap-y-3"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="heading-6 mb-3">Socials</h2>
      <div className="flex w-full flex-col gap-x-20 gap-y-2">
        <label htmlFor="linkedin">LinkedIn URL (Optional)</label>
        <FormInput type="text" {...register("linkedin")} />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="twitter">Twitter URL (Optional)</label>
        <FormInput type="text" {...register("twitter")} />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="git">GitHub/GitLab URL (Optional)</label>
        <FormInput type="text" {...register("git")} />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="personalWebsite">Personal Website URL (Optional)</label>
        <FormInput type="text" {...register("personalWebsite")} />
      </div>

      <div className="flex items-center gap-x-2">
        <button
          type="button"
          onClick={onBack}
          className="mt-6 cursor-pointer rounded bg-(--mist-white) px-4 py-2 text-(--charcoal-black)"
        >
          Back
        </button>
        <button
          type="submit"
          className="mt-6 cursor-pointer rounded bg-gray-400 px-4 py-2 text-(--charcoal-black)"
        >
          Next
        </button>
      </div>
    </form>
  );
}

export default OnboardingSocialsForm;
