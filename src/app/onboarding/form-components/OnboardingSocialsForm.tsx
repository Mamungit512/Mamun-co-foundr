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

      {/* LinkedIn */}
      <div className="flex w-full flex-col gap-x-20 gap-y-2">
        <label htmlFor="linkedin">LinkedIn URL (Optional)</label>
        <FormInput
          type="text"
          placeholder="https://www.linkedin.com/in/your-name"
          {...register("linkedin")}
        />
      </div>

      {/* Twitter */}
      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="twitter">Twitter URL (Optional)</label>
        <FormInput
          type="text"
          placeholder="https://twitter.com/yourhandle"
          {...register("twitter")}
        />
      </div>

      {/* GitHub / GitLab */}
      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="git">GitHub/GitLab URL (Optional)</label>
        <FormInput
          type="text"
          placeholder="https://github.com/yourusername"
          {...register("git")}
        />
      </div>

      {/* Personal Website */}
      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="personalWebsite">Personal Website URL (Optional)</label>
        <FormInput
          type="text"
          placeholder="https://yourportfolio.com"
          {...register("personalWebsite")}
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
          Next
        </button>
      </div>
    </form>
  );
}

export default OnboardingSocialsForm;
