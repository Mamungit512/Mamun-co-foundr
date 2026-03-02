"use client";

import React from "react";
import { useStepEntry } from "@/hooks/useOnboardingAnimation";

type ReviewFormProps = {
  data: OnboardingData;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
};

export default function ReviewForm({
  data,
  onBack,
  onEdit,
  onSubmit,
}: ReviewFormProps) {
  const fieldsRef = useStepEntry();
  const hasStartup = data.hasStartup === "yes";

  return (
    <div ref={fieldsRef} className="flex flex-col gap-y-6">
      {/* Header */}
      <div>
        <p className="mb-1 text-xs font-semibold tracking-widest text-white/40 uppercase">
          Step 6 of 6
        </p>
        <h2 className="text-2xl font-bold text-white">Review your info</h2>
        <p className="mt-1.5 text-sm text-white/50">
          Double-check everything before submitting.
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-y-3">
        <Section
          title="About You"
          fields={[
            { label: "First Name", value: data.firstName },
            { label: "Last Name", value: data.lastName },
            { label: "Job Title", value: data.title },
            {
              label: "Location",
              value:
                data.city && data.country
                  ? `${data.city}, ${data.country}`
                  : data.city || data.country || "—",
            },
            { label: "Education", value: data.education || "—" },
            { label: "Experience", value: data.experience || "—" },
            { label: "Personal Intro", value: data.personalIntro || "—" },
            { label: "Ummah Vision", value: data.ummah || "—" },
            { label: "Satisfaction", value: data.satisfaction || "—" },
            { label: "Battery Level", value: data.batteryLevel || "—" },
            {
              label: "Technical",
              value: data.isTechnical === "yes" ? "Yes" : "No",
            },
          ]}
          onEdit={() => onEdit(2)}
        />

        <Section
          title="Startup"
          fields={[
            {
              label: "Has startup",
              value: hasStartup ? "Yes" : "No",
            },
            ...(hasStartup
              ? [
                  {
                    label: "Name",
                    value: data.startupName || "—",
                  },
                  {
                    label: "Description",
                    value: data.startupDescription || "—",
                  },
                  {
                    label: "Time Spent",
                    value: data.startupTimeSpent || "—",
                  },
                  { label: "Funding", value: data.startupFunding || "—" },
                  {
                    label: "Co-Founder Status",
                    value: data.coFounderStatus || "—",
                  },
                  {
                    label: "Full-Time Timeline",
                    value: data.fullTimeTimeline || "—",
                  },
                  {
                    label: "Equity",
                    value: data.equityExpectation
                      ? `${data.equityExpectation}%`
                      : "—",
                  },
                  {
                    label: "Responsibilities",
                    value: data.responsibilities?.length
                      ? data.responsibilities.join(", ")
                      : "—",
                  },
                ]
              : []),
          ]}
          onEdit={() => onEdit(3)}
        />

        <Section
          title="Background"
          fields={[
            { label: "Gender", value: data.gender || "—" },
            { label: "Birthdate", value: data.birthdate || "—" },
            {
              label: "Accomplishments",
              value: data.accomplishments || "—",
            },
            { label: "Scheduling", value: data.schedulingUrl || "—" },
          ]}
          onEdit={() => onEdit(4)}
        />

        <Section
          title="Socials"
          fields={[
            { label: "LinkedIn", value: data.linkedin || "—" },
            { label: "Twitter", value: data.twitter || "—" },
            { label: "GitHub/GitLab", value: data.git || "—" },
            { label: "Website", value: data.personalWebsite || "—" },
          ]}
          onEdit={() => onEdit(4)}
        />

        <Section
          title="Interests & Values"
          fields={[
            { label: "Interests", value: data.interests || "—" },
            {
              label: "Priority Areas",
              value: data.priorityAreas?.length
                ? data.priorityAreas.join(", ")
                : "—",
            },
            { label: "Hobbies", value: data.hobbies || "—" },
          ]}
          onEdit={() => onEdit(5)}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/60 transition-all duration-200 hover:border-white/30 hover:text-white"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 active:scale-[0.98] sm:flex-none"
        >
          Confirm &amp; Submit ✓
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  fields,
  onEdit,
}: {
  title: string;
  fields: { label: string; value: string | number | null | undefined }[];
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-white">
          {title}
        </h3>
        <button
          onClick={onEdit}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-white/40 transition-all duration-150 hover:bg-white/8 hover:text-white"
        >
          Edit
        </button>
      </div>
      <ul className="space-y-1.5">
        {fields.map((f, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="w-36 shrink-0 text-white/40">{f.label}</span>
            <span className="text-white/80">{f.value || "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
