import FormInput from "@/components/ui/FormInput";
import React from "react";

function WhoYouAreForm() {
  return (
    <>
      <h2 className="heading-6 mb-6">Who You Are</h2>
      <div className="flex flex-col gap-y-3">
        <div className="flex gap-x-6">
          <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
            <label>First Name</label>
            <FormInput type="text" name="firstName" required />
          </div>

          <div className="flex w-full flex-col justify-between gap-x-20 gap-y-2">
            <label htmlFor="lastName">Last Name</label>
            <FormInput type="text" name="lastName" required />
          </div>
        </div>

        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="city">City</label>
          <FormInput type="text" name="city" required />
        </div>

        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="country">Country</label>
          <FormInput type="text" name="country" required />
        </div>

        <div className="flex w-full flex-col gap-x-20 gap-y-2">
          <label htmlFor="satisfaction">
            Current Occupation Satisfaction (%)
          </label>
          <FormInput type="number" name="satisfaction" required />
        </div>

        <div className="flex gap-x-6">
          <div className="flex w-full flex-col gap-x-20 gap-y-2">
            <label htmlFor="gender">Gender (Optional)</label>
            <FormInput type="text" name="gender" />
          </div>

          <div className="flex w-full flex-col gap-x-20 gap-y-2">
            <label htmlFor="birthdate">Birthdate (Optional)</label>
            <FormInput type="text" name="birthdate" />
          </div>
        </div>
      </div>
    </>
  );
}

export default WhoYouAreForm;
