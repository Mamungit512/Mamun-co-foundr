// Mapping Functions to Convert Data to/from Database
export function mapProfileToOnboardingData(
  profile: UserProfileFromDb,
): OnboardingData {
  return {
    // WhoYouAreFormData
    firstName: profile.first_name,
    lastName: profile.last_name,
    title: profile.title,
    city: profile.city,
    country: profile.country,
    satisfaction: profile.satisfaction,
    batteryLevel: profile.battery_level,
    gender: profile.gender ?? undefined,
    birthdate: profile.birthdate ?? undefined,
    pfp_url: profile.pfp_url ?? undefined,

    // IntroAccomplishmentsFormData
    personalIntro: profile.personal_intro,
    accomplishments: profile.accomplishments ?? undefined,
    ummah: profile.ummah ?? undefined,
    education: profile.education,
    experience: profile.experience,
    isTechnical: profile.is_technical ? "yes" : "no",
    schedulingUrl: undefined, // No field provided in DB object, set to undefined

    // OnboardingSocialsFormData
    linkedin: profile.linkedin ?? "",
    twitter: profile.twitter ?? "",
    git: profile.git ?? "",
    personalWebsite: profile.personal_website ?? "",

    // StartupDetailsFormData
    hasStartup: profile.has_startup ? "yes" : "no",
    startupName: profile.startup_name ?? undefined,
    startupDescription: profile.startup_description ?? undefined,
    startupTimeSpent: profile.startup_time_spent ?? undefined,
    startupFunding: profile.startup_funding ?? undefined,
    coFounderStatus: profile.cofounder_status ?? undefined,
    fullTimeTimeline: profile.fulltime_timeline ?? undefined,
    responsibilities: profile.responsibilities ?? undefined,
    equityExpectation: profile.equity_expectation ?? undefined,

    // InterestsAndValuesFormData
    interests: profile.interests ?? undefined,
    priorityAreas: profile.priority_areas ?? [],
    hobbies: profile.hobbies ?? undefined,
    journey: profile.journey ?? undefined,
    extra: profile.extra ?? undefined,
  };
}

// Convert OnboardingData into Supabase-compliant format
export function mapOnboardingDatatoProfileDB(data: OnboardingData) {
  return {
    first_name: data.firstName || null,
    last_name: data.lastName || null,
    title: data.title,
    city: data.city || null,
    country: data.country || null,
    satisfaction: data.satisfaction ?? null,
    battery_level: data.batteryLevel ?? null,
    gender: data.gender || null,
    birthdate: data.birthdate ? new Date(data.birthdate) : null,
    pfp_url: data.pfp_url,

    personal_intro: data.personalIntro || null,
    accomplishments: data.accomplishments || null,
    ummah: data.ummah || null,
    education: data.education || null,
    experience: data.experience || null,
    is_technical: data.isTechnical === "yes",

    linkedin: data.linkedin || null,
    twitter: data.twitter || null,
    git: data.git || null,
    personal_website: data.personalWebsite || null,

    has_startup: data.hasStartup === "yes",
    startup_name: data.startupName || null,
    startup_description: data.startupDescription || null,
    startup_time_spent: data.startupTimeSpent || null,
    startup_funding: data.startupFunding || null,
    cofounder_status: data.coFounderStatus || null,
    fulltime_timeline: data.fullTimeTimeline || null,
    responsibilities: data.responsibilities || null,
    equity_expectation: data.equityExpectation || null,

    interests: data.interests || null,
    priority_areas: data.priorityAreas || null,
    hobbies: data.hobbies || null,
    journey: data.journey || null,
    extra: data.extra || null,

    onboarding_complete: true,
  };
}
