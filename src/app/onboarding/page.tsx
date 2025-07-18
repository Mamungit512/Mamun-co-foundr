"use client";

import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { completeOnboarding } from "./_actions";
import WhoYouAreForm from "./form-components/WhoYouAreForm";
import OnboardingSocialsForm from "./form-components/OnboardingSocialsForm";
import IntroAccomplishments from "./form-components/IntroAccomplishments";
import StartupDetailsForm from "./form-components/StartupDetailsForm";
import InterestsAndValuesForm from "./form-components/InterestsAndValuesForm";
import ReviewForm from "./form-components/ReviewForm";
import { OnboardingData } from "./types";

export default function OnboardingComponent() {
  const [stepNumber, setStepNumber] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({});
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  const handleBack = () => {
    setStepNumber((prev) => prev - 1);
  };

  const handleEditStep = (step: number) => {
    setStepNumber(step);
  };

  // Convert OnboardingData into Supabase-compliant format
  const transformFormDataForDb = (data: OnboardingData) => {
    return {
      first_name: data.firstName || null,
      last_name: data.lastName || null,
      city: data.city || null,
      country: data.country || null,
      satisfaction: data.satisfaction ?? null,
      gender: data.gender || null,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,

      personal_intro: data.personalIntro || null,
      accomplishments: data.accomplishments || null,
      education: data.education || null,
      experience: data.experience || null,
      is_technical: data.isTechnical === "yes",

      linkedin: data.linkedin || null,
      twitter: data.twitter || null,
      git: data.git || null,
      personal_website: data.personalWebsite || null,

      has_startup: data.hasStartup === "yes",
      startup_name: data.name || null,
      startup_description: data.description || null,
      startup_time_spent: data.timeSpent || null,
      startup_funding: data.funding || null,
      cofounder_status: data.coFounderStatus || null,
      fulltime_timeline: data.fullTimeTimeline || null,
      responsibilities: data.responsibilities || null,

      interests: data.interests || null,
      priority_areas: data.priorityAreas || null,
      hobbies: data.hobbies || null,
      journey: data.journey || null,
      extra: data.extra || null,

      onboarding_complete: true,
    };
  };

  const handleSubmit = async () => {
    try {
      // Upsert into supabase
      const userId = user?.id;
      const token = await session?.getToken();
      console.log("JWT ------>", token);
      if (!userId) {
        return { message: "No Logged In User" };
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`, // your Clerk JWT token
            },
          },
        },
      );

      // -- Upsert into Supabase "profiles" table --
      const dbData = transformFormDataForDb(formData);

      const { error: dbError } = await supabase.from("profiles").upsert({
        user_id: userId,
        ...dbData,
      });

      if (dbError) {
        console.error("Supabase returned an error:", dbError);
        throw new Error(`Error saving profile: ${dbError.message}`);
      }

      // -- Complete Onboarding -> Update Clerk Metadata --
      const res = await completeOnboarding(formData);

      if (res?.error) {
        setError(res.error);
      } else {
        await user?.reload();
        router.push("/cofoundr-matching");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <section className="section-height section-padding bg-(--charcoal-black) text-(--mist-white)">
      <h1 className="heading-5">Welcome to Mamun Cofoundr Matching!</h1>
      <p className="heading-6 text-gray-500">
        To get started, tell us more about yourself
      </p>

      {error && <p className="text-red-500">{error}</p>}

      {stepNumber === 1 && (
        <WhoYouAreForm
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(2);
          }}
          defaultValues={formData} // pass current saved data here to pre-fill form
        />
      )}
      {stepNumber === 2 && (
        <IntroAccomplishments
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(3);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 3 && (
        <OnboardingSocialsForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(4);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 4 && (
        <StartupDetailsForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(5);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 5 && (
        <InterestsAndValuesForm
          onBack={handleBack}
          onNext={(newData) => {
            setFormData((prev) => ({ ...prev, ...newData }));
            setStepNumber(6);
          }}
          defaultValues={formData}
        />
      )}
      {stepNumber === 6 && (
        <ReviewForm
          data={formData}
          onBack={handleBack}
          onEdit={handleEditStep}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
