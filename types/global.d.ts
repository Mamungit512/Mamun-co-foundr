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
    deleted_at: string | null; // Soft delete timestamp
    permanent_delete_at: string | null; // Permanent delete timestamp
    education: string;
    equity_expectation: number | null;
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
    pfp_url?: string | null;
    priority_areas: string[]; // array of strings

    responsibilities: string[] | null;
    satisfaction: "Happy" | "Content" | "Browsing" | "Unhappy";
    battery_level: "Energized" | "Content" | "Burnt out";
    startup_description: string | null;
    startup_funding: string | null;
    startup_name: string | null;
    startup_time_spent: string | null;
    title: string;
    twitter: string | null;
    updated_at: string;
    user_id: string;
    ummah: string;
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
    user_id?: string;
    firstName: string;
    lastName: string;
    pfp_url?: string;
    title: string;
    city: string;
    country: string;
    satisfaction: "Happy" | "Content" | "Browsing" | "Unhappy";
    batteryLevel: "Energized" | "Content" | "Burnt out";
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
    ummah: string;
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
    startupName?: string;
    startupDescription?: string;
    startupTimeSpent?: string;
    startupFunding?: string;
    coFounderStatus?: string;
    fullTimeTimeline?: string;
    responsibilities?: string[];
    equityExpectation?: number;
  };
}
