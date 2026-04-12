"use client";

import { createContext, useContext } from "react";

type SchoolContextValue = {
  slug: string;
  schoolName: string;
};

const SchoolContext = createContext<SchoolContextValue | null>(null);

export function SchoolProvider({
  slug,
  schoolName,
  children,
}: SchoolContextValue & { children: React.ReactNode }) {
  return (
    <SchoolContext.Provider value={{ slug, schoolName }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used within a SchoolProvider");
  return ctx;
}
