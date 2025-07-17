import React from "react";
import { OnboardingData } from "../page";

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
  return (
    <div className="space-y-6">
      <h2 className="heading-5">Review Your Info</h2>
      <p className="text-sm text-gray-400">Double check before continuing.</p>

      <div className="space-y-4">
        <Section
          title="Basic Info"
          fields={[
            { label: "First Name", value: data.firstName },
            { label: "Last Name", value: data.lastName },
            { label: "Gender", value: data.gender || "—" },
            { label: "Birthdate", value: data.birthdate || "—" },
            {
              label: "Location",
              value:
                data.city && data.country
                  ? `${data.city}, ${data.country}`
                  : data.city || data.country || "—",
            },
            {
              label: "Current Satisfaction",
              value:
                typeof data.satisfaction === "number"
                  ? `${data.satisfaction}/100`
                  : "—",
            },
          ]}
          onEdit={() => onEdit(1)}
        />

        <Section
          title="Intro & Accomplishments"
          fields={[
            { label: "Personal Intro", value: data.personalIntro || "—" },
            { label: "Accomplishments", value: data.accomplishments || "—" },
            { label: "Education", value: data.education || "—" },
            { label: "Experience", value: data.experience || "—" },
            {
              label: "Are you technical?",
              value: data.isTechnical === "yes" ? "Yes" : "No",
            },
            { label: "Scheduling Link", value: data.schedulingUrl || "—" },
          ]}
          onEdit={() => onEdit(2)}
        />

        <Section
          title="Socials"
          fields={[
            { label: "LinkedIn", value: data.linkedin || "—" },
            { label: "Twitter", value: data.twitter || "—" },
            { label: "GitHub/GitLab", value: data.git || "—" },
            { label: "Personal Website", value: data.personalWebsite || "—" },
          ]}
          onEdit={() => onEdit(3)}
        />

        <Section
          title="Startup Details"
          fields={[
            {
              label: "Have Startup or Idea",
              value: data.hasStartup === "yes" ? "Yes" : "No",
            },
            { label: "Company/Project Name", value: data.name || "—" },
            { label: "Description", value: data.description || "—" },
            { label: "Time Spent & Progress", value: data.timeSpent || "—" },
            { label: "Funding Info", value: data.funding || "—" },
            { label: "Co-Founder Status", value: data.coFounderStatus || "—" },
            {
              label: "Full-Time Timeline",
              value: data.fullTimeTimeline || "—",
            },
            {
              label: "Responsibilities",
              value: data.responsibilities?.length
                ? data.responsibilities.join(", ")
                : "—",
            },
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
            { label: "Life Journey", value: data.journey || "—" },
            { label: "Additional Notes", value: data.extra || "—" },
          ]}
          onEdit={() => onEdit(5)}
        />
      </div>

      <div className="flex justify-between pt-6">
        <button
          className="rounded bg-gray-600 px-4 py-2 text-white"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="rounded bg-green-600 px-4 py-2 text-white"
          onClick={onSubmit}
        >
          Confirm & Submit
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
    <div className="rounded-lg bg-gray-800 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <button className="text-sm text-blue-400" onClick={onEdit}>
          Edit
        </button>
      </div>
      <ul className="space-y-1 text-sm text-gray-300">
        {fields.map((f, i) => (
          <li key={i}>
            <span className="font-medium text-white">{f.label}:</span>{" "}
            {f.value || "—"}
          </li>
        ))}
      </ul>
    </div>
  );
}
