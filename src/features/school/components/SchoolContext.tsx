"use client";

import { createContext, useContext } from "react";
import type { OrgConfig } from "@/features/school/registry/types";

type SchoolContextValue = {
  slug: string;
  orgId: string;
  schoolName: string;
  config: OrgConfig;
};

const SchoolContext = createContext<SchoolContextValue | null>(null);

export function SchoolProvider({
  slug,
  orgId,
  schoolName,
  config,
  children,
}: SchoolContextValue & { children: React.ReactNode }) {
  return (
    <SchoolContext.Provider value={{ slug, orgId, schoolName, config }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used within a SchoolProvider");
  return ctx;
}
