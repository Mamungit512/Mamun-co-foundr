// Pure retention math. No I/O, so every number has one definition and the
// whole module is testable without Clerk or Supabase.

export type SchoolAccount = {
  id: string;
  createdAt: string; // ISO
  maskedEmail: string;
  isStaff: boolean;
};

export type CompletedProfile = {
  userId: string;
  completedAt: string; // ISO
};

export type Reconciliation = {
  student_accounts: number;
  reconciled: number;
  ghost: number;
  orphan: number;
  staff_accounts: number;
  staff_with_profile: number;
  completed_profiles: number;
  legacy_total_signups: number;
};

export type Split = {
  students: SchoolAccount[];
  reconciledIds: Set<string>;
  ghosts: SchoolAccount[];
  orphanIds: string[];
  staffWithProfile: number;
  completed: CompletedProfile[];
};

function dedupeProfiles(profiles: CompletedProfile[]): CompletedProfile[] {
  const seen = new Map<string, CompletedProfile>();
  for (const p of profiles) if (!seen.has(p.userId)) seen.set(p.userId, p);
  return [...seen.values()];
}

export function splitAccounts(
  accounts: SchoolAccount[],
  completedProfiles: CompletedProfile[],
): Split {
  const completed = dedupeProfiles(completedProfiles);
  const completedIds = new Set(completed.map((p) => p.userId));
  const accountIds = new Set(accounts.map((a) => a.id));

  const students = accounts.filter((a) => !a.isStaff);
  const reconciledIds = new Set(
    students.filter((a) => completedIds.has(a.id)).map((a) => a.id),
  );
  const ghosts = students.filter((a) => !completedIds.has(a.id));
  const orphanIds = completed
    .filter((p) => !accountIds.has(p.userId))
    .map((p) => p.userId);
  const staffWithProfile = accounts.filter(
    (a) => a.isStaff && completedIds.has(a.id),
  ).length;

  return {
    students,
    reconciledIds,
    ghosts,
    orphanIds,
    staffWithProfile,
    completed,
  };
}

export function reconcile(
  accounts: SchoolAccount[],
  completedProfiles: CompletedProfile[],
  legacyTotalSignups: number,
): Reconciliation {
  const split = splitAccounts(accounts, completedProfiles);
  const result: Reconciliation = {
    student_accounts: split.students.length,
    reconciled: split.reconciledIds.size,
    ghost: split.ghosts.length,
    orphan: split.orphanIds.length,
    staff_accounts: accounts.length - split.students.length,
    staff_with_profile: split.staffWithProfile,
    completed_profiles: split.completed.length,
    legacy_total_signups: legacyTotalSignups,
  };

  // Fail loudly: screens render an error state rather than wrong numbers.
  if (result.student_accounts !== result.reconciled + result.ghost) {
    throw new Error("Retention identity failed: student accounts");
  }
  if (
    result.completed_profiles !==
    result.reconciled + result.orphan + result.staff_with_profile
  ) {
    throw new Error("Retention identity failed: completed profiles");
  }
  return result;
}

export type MonthlyPoint = {
  month: string; // YYYY-MM in the school's timezone
  accounts_created: number;
  profiles_completed: number;
  accounts_total: number;
  profiles_total: number;
  // Share of this month's new student accounts that are reconciled today.
  // Null for a month with no new accounts, never a fake 0 or 100.
  completion_rate: number | null;
};

export function monthKey(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(iso));
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  return `${year}-${month}`;
}

function nextMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function monthlySeries(
  accounts: SchoolAccount[],
  completedProfiles: CompletedProfile[],
  now: Date = new Date(),
  timeZone = "America/Chicago",
): MonthlyPoint[] {
  const split = splitAccounts(accounts, completedProfiles);
  if (split.students.length === 0) return [];

  const created = new Map<string, number>();
  const createdReconciled = new Map<string, number>();
  for (const a of split.students) {
    const key = monthKey(a.createdAt, timeZone);
    created.set(key, (created.get(key) ?? 0) + 1);
    if (split.reconciledIds.has(a.id)) {
      createdReconciled.set(key, (createdReconciled.get(key) ?? 0) + 1);
    }
  }

  // Profiles completed by the month the profile was finished, reconciled only.
  const completedAtById = new Map(
    split.completed.map((p) => [p.userId, p.completedAt]),
  );
  const completedByMonth = new Map<string, number>();
  for (const id of split.reconciledIds) {
    const key = monthKey(completedAtById.get(id)!, timeZone);
    completedByMonth.set(key, (completedByMonth.get(key) ?? 0) + 1);
  }

  const first = [...created.keys()].sort()[0];
  const last = monthKey(now.toISOString(), timeZone);
  const points: MonthlyPoint[] = [];
  let accountsTotal = 0;
  let profilesTotal = 0;
  for (let key = first; key <= last; key = nextMonth(key)) {
    const newAccounts = created.get(key) ?? 0;
    const newProfiles = completedByMonth.get(key) ?? 0;
    accountsTotal += newAccounts;
    profilesTotal += newProfiles;
    points.push({
      month: key,
      accounts_created: newAccounts,
      profiles_completed: newProfiles,
      accounts_total: accountsTotal,
      profiles_total: profilesTotal,
      completion_rate:
        newAccounts === 0
          ? null
          : (createdReconciled.get(key) ?? 0) / newAccounts,
    });
  }
  return points;
}

export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "***";
  return `${email[0]}***${email.slice(at)}`;
}
