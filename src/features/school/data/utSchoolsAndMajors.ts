export type DegreeType = 'bachelors' | 'masters' | 'professional' | 'other';

interface UTDegreeProgram {
  degreeType: DegreeType;
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
      { degreeType: 'professional', name: 'Juris Doctor / Public Affairs', abbreviation: 'JD/MPAff' },
    ] as const,
  },
  dell_medical_school: {
    label: 'Dell Medical School',
    fullName: 'Dell Medical School',
    tier: 'partner',
    color: 'from-rose-600 to-rose-700',
    programs: [
      { degreeType: 'professional', name: 'Doctor of Medicine', abbreviation: 'MD' },
      { degreeType: 'professional', name: 'Doctor of Medicine / Doctor of Philosophy', abbreviation: 'MD/PhD' },
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
      { degreeType: 'professional', name: 'Doctor of Nursing Practice', abbreviation: 'DNP' },
    ] as const,
  },
  college_of_pharmacy: {
    label: 'Pharmacy',
    fullName: 'College of Pharmacy',
    tier: 'partner',
    color: 'from-violet-600 to-violet-700',
    programs: [
      { degreeType: 'professional', name: 'Doctor of Pharmacy', abbreviation: 'PharmD' },
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
      { degreeType: 'professional', name: 'Juris Doctor', abbreviation: 'JD' },
      { degreeType: 'masters', name: 'Law', abbreviation: 'LLM' },
    ] as const,
  },
  pre_med_pre_law_teaching: {
    label: 'Pre-Med, Pre-Law & Teaching',
    fullName: 'Pre-Med, Pre-Law & Teaching',
    tier: 'partner',
    color: 'from-sky-600 to-sky-700',
    programs: [
      { degreeType: 'other', name: 'Pre-Med', abbreviation: 'Pre-Med' },
      { degreeType: 'other', name: 'Pre-Law', abbreviation: 'Pre-Law' },
      { degreeType: 'other', name: 'Pre-Teaching', abbreviation: 'Pre-Teaching' },
    ] as const,
  },
} as const;

export const DEGREE_TYPE_LABELS: Record<DegreeType, string> = {
  bachelors: "Bachelor's Degree",
  masters: "Master's Degree",
  professional: 'Professional Degree',
  other: 'Other',
};

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

export const getProgramsForSchool = (
  school: UTCollege,
): readonly UTDegreeProgram[] => {
  return UT_SCHOOLS_AND_PROGRAMS[school].programs;
};

export const getDegreeTypesForSchool = (
  school: UTCollege,
): DegreeType[] => {
  const programs = getProgramsForSchool(school);
  const types = new Set(programs.map(p => p.degreeType));
  return Array.from(types) as DegreeType[];
};

export const getProgramsForSchoolAndDegreeType = (
  school: UTCollege,
  degreeType: DegreeType,
): readonly UTDegreeProgram[] => {
  return getProgramsForSchool(school).filter(
    p => p.degreeType === degreeType,
  );
};

export const getSchoolLabel = (school: UTCollege): string => {
  return UT_SCHOOLS_AND_PROGRAMS[school].label;
};

export const getSchoolFullName = (school: UTCollege): string => {
  return UT_SCHOOLS_AND_PROGRAMS[school].fullName;
};

export const getDegreeAbbreviation = (
  school: UTCollege,
  majorName: string | undefined,
): string | undefined => {
  if (!majorName) return undefined;
  const programs = getProgramsForSchool(school);
  const program = programs.find(p => p.name === majorName);
  return program?.abbreviation || majorName;
};
