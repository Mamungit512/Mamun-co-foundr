"use client";

import React from "react";
import { useStepEntry } from "@/hooks/useOnboardingAnimation";

type UTReviewFormProps = {
  data: OnboardingData;
  onBack: () => void;
  onEdit: (step: number) => void;
  onSubmit: () => void;
};

export default function UTReviewForm({
  data,
  onBack,
  onEdit,
  onSubmit,
}: UTReviewFormProps) {
  const fieldsRef = useStepEntry();

  const educationParts = [
    data.utCollege,
    data.gradYear ? `Class of ${data.gradYear}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div ref={fieldsRef} className="flex flex-col gap-y-8">
      {/* Header */}
      <div className="pb-4">
        <p className="mb-1 text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase">
          Step 5 of 5
        </p>
        <h2 className="text-2xl font-bold text-[var(--ui-text)]">Review your info</h2>
        <p className="mt-1.5 text-sm text-[var(--ui-text-muted)]">
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
            {
              label: "Status",
              value: data.utStatus
                ? data.utStatus.charAt(0).toUpperCase() + data.utStatus.slice(1)
                : "—",
            },
            { label: "Education", value: educationParts || "—" },
            {
              label: "Addl. Education",
              value: data.additionalEducation || "—",
            },
            { label: "Experience", value: data.experience || "—" },
            { label: "Personal Intro", value: data.personalIntro || "—" },
            { label: "Founder Archetype", value: data.archetype || "—" },
            {
              label: "Technical",
              value: data.isTechnical === "yes" ? "Yes" : "No",
            },
          ]}
          onEdit={() => onEdit(2)}
        />

        <Section
          title="Startup or Idea"
          fields={[
            {
              label: "Has Startup",
              value: data.hasStartup === "yes" ? "Yes" : "Not yet",
            },
            { label: "Startup Name", value: data.startupName || "—" },
            { label: "Description", value: data.startupDescription || "—" },
            { label: "Time Spent", value: data.startupTimeSpent || "—" },
            { label: "Funding Status", value: data.startupFunding || "—" },
            { label: "Co-Founder Status", value: data.coFounderStatus || "—" },
            {
              label: "Matching Intent",
              value:
                data.intent === "join_me"
                  ? "Join me"
                  : data.intent === "seeking_to_join"
                    ? "Seeking to join"
                    : data.intent === "no_preference"
                      ? "No preference"
                      : "—",
            },
            { label: "Equity Expectation", value: data.equityExpectation ? `${data.equityExpectation}%` : "—" },
          ]}
          onEdit={() => onEdit(3)}
        />

        <Section
          title="Additional Details"
          fields={[
            { label: "Scheduling", value: data.schedulingUrl || "—" },
            { label: "LinkedIn", value: data.linkedin || "—" },
            { label: "GitHub/GitLab", value: data.git || "—" },
          ]}
          onEdit={() => onEdit(4)}
        />

        <Section
          title="Priority Areas"
          fields={[
            {
              label: "Areas",
              value: data.priorityAreas?.length
                ? data.priorityAreas.join(", ")
                : "—",
            },
          ]}
          onEdit={() => onEdit(5)}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pt-10 border-t border-[var(--ui-border)]">
        <button
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--ui-border-strong)] px-5 py-3 text-sm font-medium text-[var(--ui-text-muted)] transition-all duration-200 hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-[var(--ui-text)] shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 active:scale-[0.98] sm:flex-none"
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
    <div className="rounded-xl border border-[var(--ui-border)] bg-white/4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-[var(--ui-text)]">
          {title}
        </h3>
        <button
          onClick={onEdit}
          className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--ui-text-muted)] transition-all duration-150 hover:bg-[var(--ui-surface)] hover:text-[var(--ui-text)]"
        >
          Edit
        </button>
      </div>
      <ul className="space-y-1.5">
        {fields.map((f, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="w-36 shrink-0 text-[var(--ui-text-muted)]">{f.label}</span>
            <span className="text-[var(--ui-text)]">{f.value || "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
