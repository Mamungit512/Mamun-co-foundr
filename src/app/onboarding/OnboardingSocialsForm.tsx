import FormInput from "@/components/ui/FormInput";
import React from "react";

function OnboardingSocialsForm({ onBack }: { onBack: () => void }) {
  return (
    <form className="mt-14 flex flex-col gap-y-3">
      <h2 className="heading-6 mb-3">Socials</h2>
      <div className="flex w-full flex-col gap-x-20 gap-y-2">
        <label htmlFor="linkedin">LinkedIn URL (Optional)</label>
        <FormInput type="text" name="linkedin" />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="twitter">Twitter URL (Optional)</label>
        <FormInput type="text" name="twitter" />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="github">GitHub/GitLab URL (Optional)</label>
        <FormInput type="text" name="github" />
      </div>

      <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
        <label htmlFor="website">Personal Website URL (Optional)</label>
        <FormInput type="text" name="website" />
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
          Submit
        </button>
      </div>
    </form>
  );
}

export default OnboardingSocialsForm;
