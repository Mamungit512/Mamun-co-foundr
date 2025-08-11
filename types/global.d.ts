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
}
