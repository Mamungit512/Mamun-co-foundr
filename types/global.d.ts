export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
    };
  }

  type UserProfileFromDb = {
    accomplishments: string | null;
    birthdate: string | null;
    city: string;
    cofounder_status: string | null;
    country: string;
    created_at: string;
    education: string;
    experience: string;
    extra: string | null;
    first_name: string;
    fulltime_timeline: string | null;
    gender: string | null;
    git: string | null;
    has_startup: boolean;
    hobbies: string | null;
    id: number;
    interests: string | null;
    is_technical: boolean;
    journey: string | null;
    last_name: string;
    linkedin: string | null;
    onboarding_complete: boolean;
    personal_intro: string;
    personal_website: string | null;
    priority_areas: string[]; // array of strings
    responsibilities: string[] | null;
    satisfaction: number;
    startup_description: string | null;
    startup_funding: string | null;
    startup_name: string | null;
    startup_time_spent: string | null;
    title: string;
    twitter: string | null;
    updated_at: string;
    user_id: string;
  };

  // Combine all individual form step types
  type OnboardingData = Partial<
    WhoYouAreFormData &
      IntroAccomplishmentsFormData &
      OnboardingSocialsFormData &
      StartupDetailsFormData &
      InterestsAndValuesFormData
  >;

  type WhoYouAreFormData = {
    firstName: string;
    lastName: string;
    title: string;
    city: string;
    country: string;
    satisfaction: number;
    gender?: string;
    birthdate?: string;
  };

  type InterestsAndValuesFormData = {
    interests?: string;
    priorityAreas?: string[];
    hobbies?: string;
    journey?: string;
    extra?: string;
  };

  type IntroAccomplishmentsFormData = {
    personalIntro: string;
    accomplishments?: string;
    education: string;
    experience: string;
    isTechnical: "yes" | "no";
    schedulingUrl?: string;
  };

  type OnboardingSocialsFormData = {
    linkedin: string;
    twitter: string;
    git: string;
    personalWebsite: string;
  };

  type StartupDetailsFormData = {
    hasStartup: "yes" | "no";
    name?: string;
    description?: string;
    timeSpent?: string;
    funding?: string;
    coFounderStatus?: string;
    fullTimeTimeline?: string;
    responsibilities?: string[];
  };
}
