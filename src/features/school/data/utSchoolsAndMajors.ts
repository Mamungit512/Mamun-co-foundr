// Degree level is general and independent of college (see UTDegreeType in
// src/features/school/types.d.ts). The programs below are suggestions and
// abbreviation lookups only — they no longer limit which levels a user can
// pick for a given college.
interface UTDegreeProgram {
  degreeType: UTDegreeType;
  name: string;
  abbreviation: string;
}

export const UT_SCHOOLS_AND_PROGRAMS = {
  mccombs_business: {
    label: 'McCombs Business',
    fullName: 'McCombs School of Business',
    tier: 'core',
    color: 'from-orange-600 to-orange-700',
    programs: [
      { degreeType: 'bachelors', name: 'Business Administration', abbreviation: 'BBA' },
      { degreeType: 'masters', name: 'Business Administration', abbreviation: 'MBA' },
      { degreeType: 'masters', name: 'Public Administration', abbreviation: 'MPA' },
      { degreeType: 'masters', name: 'Finance', abbreviation: 'MFinance' },
      { degreeType: 'masters', name: 'Information Systems', abbreviation: 'MIS' },
    ] as const,
  },
  cockrell_engineering: {
    label: 'Cockrell Engineering',
    fullName: 'Cockrell School of Engineering',
    tier: 'core',
    color: 'from-red-600 to-red-700',
    programs: [
      { degreeType: 'bachelors', name: 'Computer Science', abbreviation: 'CS' },
      { degreeType: 'bachelors', name: 'Electrical & Computer Engineering', abbreviation: 'ECE' },
      { degreeType: 'bachelors', name: 'Mechanical Engineering', abbreviation: 'ME' },
      { degreeType: 'bachelors', name: 'Biomedical Engineering', abbreviation: 'Biomedical' },
      { degreeType: 'bachelors', name: 'Chemical Engineering', abbreviation: 'ChE' },
    ] as const,
  },
  school_of_information: {
    label: 'School of Information',
    fullName: 'School of Information',
    tier: 'core',
    color: 'from-blue-600 to-blue-700',
    programs: [
      { degreeType: 'masters', name: 'Data Science', abbreviation: 'Data Science' },
      { degreeType: 'masters', name: 'User Experience', abbreviation: 'UX' },
      { degreeType: 'masters', name: 'Human-Computer Interaction', abbreviation: 'HCI' },
      { degreeType: 'masters', name: 'Information Systems', abbreviation: 'MIS' },
    ] as const,
  },
  natural_sciences: {
    label: 'Natural Sciences',
    fullName: 'College of Natural Sciences',
    tier: 'core',
    color: 'from-green-600 to-green-700',
    programs: [
      { degreeType: 'bachelors', name: 'Biology', abbreviation: 'Biology' },
      { degreeType: 'bachelors', name: 'Chemistry', abbreviation: 'Chemistry' },
      { degreeType: 'bachelors', name: 'Neuroscience', abbreviation: 'Neuroscience' },
    ] as const,
  },
  liberal_arts: {
    label: 'Liberal Arts',
    fullName: 'College of Liberal Arts',
    tier: 'core',
    color: 'from-purple-600 to-purple-700',
    programs: [
      { degreeType: 'bachelors', name: 'Economics', abbreviation: 'Economics' },
      { degreeType: 'bachelors', name: 'Government', abbreviation: 'Government' },
      { degreeType: 'bachelors', name: 'Plan II Honors', abbreviation: 'Plan II' },
    ] as const,
  },
  moody_communication: {
    label: 'Moody Communication',
    fullName: 'Moody College of Communication',
    tier: 'partner',
    color: 'from-pink-600 to-pink-700',
    programs: [
      { degreeType: 'bachelors', name: 'Journalism', abbreviation: 'Journalism' },
      { degreeType: 'bachelors', name: 'Advertising', abbreviation: 'Advertising' },
      { degreeType: 'bachelors', name: 'Public Relations', abbreviation: 'PR' },
      { degreeType: 'bachelors', name: 'Radio-Television-Film', abbreviation: 'RTF' },
    ] as const,
  },
  college_of_fine_arts: {
    label: 'College of Fine Arts',
    fullName: 'College of Fine Arts',
    tier: 'partner',
    color: 'from-cyan-600 to-cyan-700',
    programs: [
      { degreeType: 'bachelors', name: 'Design', abbreviation: 'Design' },
      { degreeType: 'bachelors', name: 'Studio Art', abbreviation: 'Studio Art' },
      { degreeType: 'bachelors', name: 'Music', abbreviation: 'Music' },
      { degreeType: 'bachelors', name: 'Theatre', abbreviation: 'Theatre' },
    ] as const,
  },
  school_of_architecture: {
    label: 'School of Architecture',
    fullName: 'School of Architecture',
    tier: 'partner',
    color: 'from-amber-600 to-amber-700',
    programs: [
      { degreeType: 'bachelors', name: 'Architecture', abbreviation: 'BArch' },
      { degreeType: 'masters', name: 'Architecture', abbreviation: 'MArch' },
      { degreeType: 'masters', name: 'Urban Design', abbreviation: 'Urban Design' },
    ] as const,
  },
  lbj_public_affairs: {
    label: 'LBJ Public Affairs',
    fullName: 'LBJ School of Public Affairs',
    tier: 'partner',
    color: 'from-slate-600 to-slate-700',
    programs: [
      { degreeType: 'masters', name: 'Public Affairs', abbreviation: 'MPAff' },
      { degreeType: 'masters', name: 'Global Policy', abbreviation: 'Global Policy' },
      { degreeType: 'doctorate', name: 'Juris Doctor / Public Affairs', abbreviation: 'JD/MPAff' },
    ] as const,
  },
  dell_medical_school: {
    label: 'Dell Medical School',
    fullName: 'Dell Medical School',
    tier: 'partner',
    color: 'from-rose-600 to-rose-700',
    programs: [
      { degreeType: 'doctorate', name: 'Doctor of Medicine', abbreviation: 'MD' },
      { degreeType: 'doctorate', name: 'Doctor of Medicine / Doctor of Philosophy', abbreviation: 'MD/PhD' },
      { degreeType: 'masters', name: 'Health Innovation', abbreviation: 'Health Innovation' },
    ] as const,
  },
  jackson_geosciences: {
    label: 'Jackson Geosciences',
    fullName: 'Jackson School of Geosciences',
    tier: 'partner',
    color: 'from-yellow-600 to-yellow-700',
    programs: [
      { degreeType: 'bachelors', name: 'Geological Sciences', abbreviation: 'Geo Sciences' },
      { degreeType: 'bachelors', name: 'Environmental Science', abbreviation: 'Env Sci' },
      { degreeType: 'masters', name: 'Energy and Earth Resources', abbreviation: 'Energy & Earth Resources' },
    ] as const,
  },
  school_of_civic_leadership: {
    label: 'Civic Leadership',
    fullName: 'School of Civic Leadership',
    tier: 'partner',
    color: 'from-indigo-600 to-indigo-700',
    programs: [
      { degreeType: 'bachelors', name: 'Civic Leadership', abbreviation: 'BS Civic Leadership' },
    ] as const,
  },
  college_of_education: {
    label: 'Education',
    fullName: 'College of Education',
    tier: 'partner',
    color: 'from-teal-600 to-teal-700',
    programs: [
      { degreeType: 'bachelors', name: 'Applied Learning & Development', abbreviation: 'ALD' },
      { degreeType: 'bachelors', name: 'STEM Education', abbreviation: 'STEM Ed' },
      { degreeType: 'bachelors', name: 'Youth & Community Studies', abbreviation: 'YCS' },
      { degreeType: 'masters', name: 'Curriculum & Instruction', abbreviation: 'M.Ed.' },
    ] as const,
  },
  school_of_nursing: {
    label: 'Nursing',
    fullName: 'School of Nursing',
    tier: 'partner',
    color: 'from-emerald-600 to-emerald-700',
    programs: [
      { degreeType: 'bachelors', name: 'Nursing', abbreviation: 'BSN' },
      { degreeType: 'masters', name: 'Nursing', abbreviation: 'MSN' },
      { degreeType: 'doctorate', name: 'Doctor of Nursing Practice', abbreviation: 'DNP' },
    ] as const,
  },
  college_of_pharmacy: {
    label: 'Pharmacy',
    fullName: 'College of Pharmacy',
    tier: 'partner',
    color: 'from-violet-600 to-violet-700',
    programs: [
      { degreeType: 'doctorate', name: 'Doctor of Pharmacy', abbreviation: 'PharmD' },
      { degreeType: 'masters', name: 'Pharmaceutical Sciences', abbreviation: 'Pharm Sci' },
    ] as const,
  },
  school_of_social_work: {
    label: 'Social Work',
    fullName: 'School of Social Work',
    tier: 'partner',
    color: 'from-lime-600 to-lime-700',
    programs: [
      { degreeType: 'bachelors', name: 'Social Work', abbreviation: 'BSW' },
      { degreeType: 'masters', name: 'Social Work', abbreviation: 'MSSW' },
    ] as const,
  },
  school_of_law: {
    label: 'Law',
    fullName: 'School of Law',
    tier: 'partner',
    color: 'from-stone-600 to-stone-700',
    programs: [
      { degreeType: 'doctorate', name: 'Juris Doctor', abbreviation: 'JD' },
      { degreeType: 'masters', name: 'Law', abbreviation: 'LLM' },
    ] as const,
  },
  pre_med_pre_law_teaching: {
    label: 'Pre-Med, Pre-Law & Teaching',
    fullName: 'Pre-Med, Pre-Law & Teaching',
    tier: 'partner',
    color: 'from-sky-600 to-sky-700',
    programs: [
      { degreeType: 'bachelors', name: 'Pre-Med', abbreviation: 'Pre-Med' },
      { degreeType: 'bachelors', name: 'Pre-Law', abbreviation: 'Pre-Law' },
      { degreeType: 'bachelors', name: 'Pre-Teaching', abbreviation: 'Pre-Teaching' },
    ] as const,
  },
} as const;

export const DEGREE_TYPE_LABELS: Record<UTDegreeType, string> = {
  bachelors: "Bachelor's Degree",
  masters: "Master's Degree",
  doctorate: 'Doctorate',
  certificate: 'Certificate',
};

// Compact form for profile-card badges and emails, e.g. "Master's '26".
export const DEGREE_TYPE_SHORT_LABELS: Record<UTDegreeType, string> = {
  bachelors: "Bachelor's",
  masters: "Master's",
  doctorate: 'Doctorate',
  certificate: 'Certificate',
};

export const DEGREE_TYPES = Object.keys(DEGREE_TYPE_LABELS) as UTDegreeType[];

export const SECTOR_INTEREST_LABELS: Record<UTSectorInterest, string> = {
  b2b_saas: 'B2B SaaS',
  fintech: 'Fintech',
  ai_ml: 'AI/ML',
  deeptech: 'DeepTech',
  data: 'Data',
  ux: 'UX',
  healthtech: 'HealthTech',
  biotech: 'BioTech',
  policy: 'Policy',
  impact: 'Impact',
  media: 'Media',
  consumer: 'Consumer',
  edtech: 'EdTech',
  proptech: 'PropTech',
  cleantech: 'CleanTech',
  govtech: 'GovTech',
};

export const isDegreeType = (value: unknown): value is UTDegreeType =>
  typeof value === 'string' && (DEGREE_TYPES as string[]).includes(value);

// Retired 'professional' (MD/JD/PharmD/DNP) maps forward to 'doctorate'.
// Retired 'other' carried no level and has no equivalent, so it returns
// undefined — callers should treat that the same as a missing value.
export const normalizeDegreeType = (value: unknown): UTDegreeType | undefined => {
  if (isDegreeType(value)) return value;
  if (value === 'professional') return 'doctorate';
  return undefined;
};

export const getDegreeTypeLabel = (value: unknown): string | undefined => {
  const degreeType = normalizeDegreeType(value);
  return degreeType ? DEGREE_TYPE_LABELS[degreeType] : undefined;
};

export const isUTCollege = (value: unknown): value is UTCollege =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(UT_SCHOOLS_AND_PROGRAMS, value);

export const getProgramsForSchool = (
  school: UTCollege,
): readonly UTDegreeProgram[] => {
  return UT_SCHOOLS_AND_PROGRAMS[school].programs;
};

// Program names for (college, degree level), for use as suggestions — never
// as a restriction on what a user can pick. Falls back to all of the
// college's program names when none are listed at that level. Deduped, in
// catalog order.
export const getMajorOptions = (
  college: string | null | undefined,
  degreeType: string | null | undefined,
): string[] => {
  if (!isUTCollege(college)) return [];
  const programs = getProgramsForSchool(college);
  const level = normalizeDegreeType(degreeType);
  const atLevel = level ? programs.filter(p => p.degreeType === level) : [];
  const pool = atLevel.length ? atLevel : programs;
  return Array.from(new Set(pool.map(p => p.name)));
};

export const getSchoolLabel = (school: UTCollege): string => {
  return UT_SCHOOLS_AND_PROGRAMS[school].label;
};

export const getSchoolFullName = (school: UTCollege): string => {
  return UT_SCHOOLS_AND_PROGRAMS[school].fullName;
};

// Prefers a catalog abbreviation for the exact (college, level, major) match
// (fixes e.g. a masters "Business Administration" rendering as "BBA" instead
// of "MBA"). Falls back to the level's short label, then to the major name
// itself, so a free-text major or an unlisted college still renders something
// reasonable. Inputs are loose because callers pass raw, possibly-legacy DB
// values.
export const getDegreeAbbreviation = (
  college: string | null | undefined,
  degreeType: string | null | undefined,
  majorName: string | null | undefined,
): string | undefined => {
  const major = majorName?.trim().toLowerCase();
  const matches =
    major && isUTCollege(college)
      ? getProgramsForSchool(college).filter(p => p.name.toLowerCase() === major)
      : [];
  const level = normalizeDegreeType(degreeType);

  if (level) {
    return matches.find(p => p.degreeType === level)?.abbreviation ?? DEGREE_TYPE_SHORT_LABELS[level];
  }
  // Legacy rows with no level: keep the old name-only lookup.
  return matches[0]?.abbreviation ?? (majorName?.trim() || undefined);
};
