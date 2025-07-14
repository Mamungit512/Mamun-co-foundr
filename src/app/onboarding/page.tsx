"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./_actions";

export default function OnboardingComponent() {
  const [error, setError] = React.useState("");
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const res = await completeOnboarding(formData);
    if (res?.message) {
      // Reloads the user's data from the Clerk API
      await user?.reload();
      router.push("/");
    }
    if (res?.error) {
      setError(res?.error);
    }
  };
  return (
    <section className="section-height section-padding">
      <h1 className="heading-5">Welcome to Mamun Cofoundr Matching!</h1>
      <p className="heading-6 text-gray-600">
        To get started, tell us more about yourself
      </p>
      <form action={handleSubmit} className="mt-10">
        {/* --- Who You Are Section --- */}
        <h2 className="heading-6">Who You Are</h2>
        <div className="flex items-center gap-x-20">
          <label>First Name</label>
          <input type="text" name="firstName" required />
        </div>

        <div className="flex items-center gap-x-20">
          <label>Last Name</label>
          <input type="text" name="lastName" required />
        </div>

        <div className="flex items-center gap-x-20">
          <label>City</label>
          <input type="text" name="city" required />
        </div>

        <div className="flex items-center gap-x-20">
          <label>Country</label>
          <input type="text" name="country" required />
        </div>

        <div className="flex items-center gap-x-20">
          <label>Current Occupation Satisfaction (%)</label>
          <input type="number" name="country" required />
        </div>

        <div className="flex items-center gap-x-20">
          <label>Gender (Optional)</label>
          <input type="text" name="gender" />
        </div>

        <div className="flex items-center gap-x-20">
          <label>Birthdate (Optional)</label>
          <input type="text" name="birthdate" />
        </div>

        <div className="flex items-center gap-x-20">
          <label>LinkedIn URL (Optional)</label>
          <input type="text" name="linkedin" />
        </div>

        <div className="flex items-center gap-x-20">
          <label>Twitter URL (Optional)</label>
          <input type="text" name="twitter" />
        </div>

        <div className="flex items-center gap-x-20">
          <label>GitHub/GitLab URL (Optional)</label>
          <input type="text" name="github" />
        </div>

        <div className="flex items-center gap-x-20">
          <label>Personal Website URL (Optional)</label>
          <input type="text" name="website" />
        </div>

        <div>
          <label>Application Type</label>
          <p>Describe the type of your application.</p>
          <input type="text" name="applicationType" required />
        </div>

        {error && <p className="text-red-600">Error: {error}</p>}
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
