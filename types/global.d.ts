export {};

declare global {
  // PostHog on window
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      captureException: (error: unknown) => void;
      identify: (userId: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
      get_distinct_id: () => string;
      [key: string]: unknown;
    };
    // FirstPromoter tracking function
    fpr?: (
      action: string,
      data?: { email: string; uid?: string } | { cid: string } | string,
    ) => void;
  }

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
    state: string | null;
    created_at: string;
    deleted_at: string | null; // Soft delete timestamp
    permanent_delete_at: string | null; // Permanent delete timestamp
    education: string;
    equity_expectation: number | null;
    experience: string;
    first_name: string;
    fulltime_timeline: string | null;
    gender: string | null;
    git: string | null;
    has_startup: boolean;
    hobbies: string | null;
    id: number;
    interests: string | null;
    is_technical: boolean;
    last_name: string;
    linkedin: string | null;
    onboarding_complete: boolean;
    personal_intro: string;
    personal_website: string | null;
    pfp_url?: string | null;
    priority_areas: string[]; // array of strings
    looking_for: "technical" | "non-technical" | "either" | null;
    preferred_location: "same-city" | "same-country" | "remote" | null;

    responsibilities: string[] | null;
    satisfaction: "Happy" | "Content" | "Browsing";
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
    // Hiring feature fields
    is_hiring: boolean;
    hiring_email: string | null;
  };

  // Combine all individual form step types
  type OnboardingData = Partial<
    WhoYouAreFormData &
      IntroAccomplishmentsFormData &
      OnboardingSocialsFormData &
      StartupDetailsFormData &
      InterestsAndValuesFormData &
      Preferences &
      HiringSettingsFormData &
      ActivityFields
  >;

  type WhoYouAreFormData = {
    user_id?: string;
    firstName: string;
    lastName: string;
    pfp_url?: string;
    title: string;
    city: string;
    country: string;
    state?: string;
    satisfaction: "Happy" | "Content" | "Browsing";
    batteryLevel: "Energized" | "Content" | "Burnt out";
    gender?: string;
    birthdate?: string;
  };

  type InterestsAndValuesFormData = {
    interests?: string;
    priorityAreas?: string[];
    hobbies?: string;
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

  type Preferences = {
    lookingFor: "technical" | "non-technical" | "either";
    preferredLocation: "same-city" | "same-country" | "remote";
  };

  type HiringSettingsFormData = {
    isHiring: boolean;
    hiringEmail?: string;
  };

  // Activity Summary (synced from PostHog)
  type UserActivitySummary = {
    user_id: string;
    last_active_at: string | null;
    total_login_count: number;
    last_login_at: string | null;
    logins_last_7_days: number;
    logins_last_30_days: number;
    last_synced_at: string;
    created_at: string;
    updated_at: string;
  };

  // Activity fields for OnboardingData (when joined with activity_summary)
  type ActivityFields = {
    last_active_at?: string | null;
    total_login_count?: number;
    last_login_at?: string | null;
    logins_last_7_days?: number;
    logins_last_30_days?: number;
  };
}
