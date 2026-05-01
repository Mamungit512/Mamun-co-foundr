"use client";

import { createContext, useContext } from "react";
import type { OrgConfig } from "@/orgs/types";

type SchoolContextValue = {
  slug: string;
  schoolName: string;
  config: OrgConfig;
};

const SchoolContext = createContext<SchoolContextValue | null>(null);

export function SchoolProvider({
  slug,
  schoolName,
  config,
  children,
}: SchoolContextValue & { children: React.ReactNode }) {
  return (
    <SchoolContext.Provider value={{ slug, schoolName, config }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used within a SchoolProvider");
  return ctx;
}
