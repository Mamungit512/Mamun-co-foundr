import FormInput from "@/components/ui/FormInput";
import React from "react";

function OnboardingSocialsForm() {
  return (
    <div className="mt-14 flex flex-col gap-y-3">
      <h3 className="heading-6 mb-3">Socials</h3>
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
    </div>
  );
}

export default OnboardingSocialsForm;
