// Combine all individual form step types
export type OnboardingData = Partial<
  WhoYouAreFormData &
    IntroAccomplishmentsFormData &
    OnboardingSocialsFormData &
    StartupDetailsFormData &
    InterestsAndValuesFormData
>;

export type WhoYouAreFormData = {
  firstName: string;
  lastName: string;
  title: string;
  city: string;
  country: string;
  satisfaction: number;
  gender?: string;
  birthdate?: string;
};

export type InterestsAndValuesFormData = {
  interests?: string;
  priorityAreas?: string[];
  hobbies?: string;
  journey?: string;
  extra?: string;
};

export type IntroAccomplishmentsFormData = {
  personalIntro: string;
  accomplishments?: string;
  education: string;
  experience: string;
  isTechnical: "yes" | "no";
  schedulingUrl?: string;
};

export type OnboardingSocialsFormData = {
  linkedin: string;
  twitter: string;
  git: string;
  personalWebsite: string;
};

export type StartupDetailsFormData = {
  hasStartup: "yes" | "no";
  name?: string;
  description?: string;
  timeSpent?: string;
  funding?: string;
  coFounderStatus?: string;
  fullTimeTimeline?: string;
  responsibilities?: string[];
};
