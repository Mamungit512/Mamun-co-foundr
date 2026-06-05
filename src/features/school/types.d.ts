export {};

declare global {
  type OrganizationFromDb = {
    id: string;
    name: string;
    slug: string;
    type: string;
    ferpa_dpa_signed_at: string | null;
    suppress_tracking: boolean;
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };

  // Mirrors the school_profiles DB row. The persistence layer is generic across
  // schools; the form/dashboard layer still uses UT-prefixed names below
  // (UTProfileData / utCollege / utSectorInterests) for back-compat — translation
  // happens in the API routes.
  type SchoolProfileFromDb = {
    id: number;
    user_id: string;
    organization_id: string;
    school_status: "student" | "alumni";
    graduation_year: number | null;
    college: string | null;
    degree_type: "bachelors" | "masters" | "professional" | "other" | null;
    major: string | null;
    sector_interests: string[] | null;
    intent: "join_me" | "seeking_to_join" | "no_preference" | null;
    additional_education: string | null;
    school_data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };

  type UTCollege =
    | "mccombs_business"
    | "cockrell_engineering"
    | "school_of_information"
    | "natural_sciences"
    | "liberal_arts"
    | "moody_communication"
    | "college_of_fine_arts"
    | "school_of_architecture"
    | "lbj_public_affairs"
    | "dell_medical_school";

  type UTDegreeType = "bachelors" | "masters" | "professional" | "other";

  type UTSectorInterest =
    | "b2b_saas"
    | "fintech"
    | "ai_ml"
    | "deeptech"
    | "data"
    | "ux"
    | "healthtech"
    | "biotech"
    | "policy"
    | "impact"
    | "media"
    | "consumer"
    | "edtech"
    | "proptech"
    | "cleantech"
    | "govtech";

  type UTProfileData = {
    utStatus?: "student" | "alumni";
    gradYear?: number;
    utCollege?: UTCollege;
    utDegreeType?: UTDegreeType;
    utMajor?: string;
    utSectorInterests?: UTSectorInterest[];
    intent?: "join_me" | "seeking_to_join" | "no_preference";
    additionalEducation?: string;
  };
}
