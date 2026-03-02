import React from "react";

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
  const hasStartup = data.hasStartup === "yes";

  return (
    <div className="space-y-6">
      <h2 className="heading-5">Review Your Info</h2>
      <p className="text-sm text-gray-400">Double check before continuing.</p>

      <div className="space-y-4">
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
            { label: "Personal Intro", value: data.personalIntro || "—" },
            {
              label: "Current Satisfaction",
              value: data.satisfaction || "—",
            },
            {
              label: "Battery Level",
              value: data.batteryLevel || "—",
            },
            {
              label: "Are you technical?",
              value: data.isTechnical === "yes" ? "Yes" : "No",
            },
          ]}
          onEdit={() => onEdit(2)}
        />

        <Section
          title="Startup"
          fields={[
            {
              label: "Have Startup or Idea",
              value: hasStartup ? "Yes" : "No",
            },
            ...(hasStartup
              ? [
                  {
                    label: "Company/Project Name",
                    value: data.startupName || "—",
                  },
                  {
                    label: "Description",
                    value: data.startupDescription || "—",
                  },
                ]
              : []),
          ]}
          onEdit={() => onEdit(3)}
        />

        <Section
          title="Your Background"
          fields={[
            { label: "Gender", value: data.gender || "—" },
            { label: "Birthdate", value: data.birthdate || "—" },
            { label: "Education", value: data.education || "—" },
            { label: "Experience", value: data.experience || "—" },
            { label: "Accomplishments", value: data.accomplishments || "—" },
            { label: "Ummah Vision", value: data.ummah || "—" },
            { label: "Scheduling Link", value: data.schedulingUrl || "—" },
          ]}
          onEdit={() => onEdit(4)}
        />

        <Section
          title="Socials"
          fields={[
            { label: "LinkedIn", value: data.linkedin || "—" },
            { label: "Twitter", value: data.twitter || "—" },
            { label: "GitHub/GitLab", value: data.git || "—" },
            { label: "Personal Website", value: data.personalWebsite || "—" },
          ]}
          onEdit={() => onEdit(5)}
        />

        {hasStartup && (
          <Section
            title="Startup Details"
            fields={[
              {
                label: "Time Spent & Progress",
                value: data.startupTimeSpent || "—",
              },
              { label: "Funding Info", value: data.startupFunding || "—" },
              {
                label: "Co-Founder Status",
                value: data.coFounderStatus || "—",
              },
              {
                label: "Full-Time Timeline",
                value: data.fullTimeTimeline || "—",
              },
              {
                label: "Equity Expectation",
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
            ]}
            onEdit={() => onEdit(6)}
          />
        )}

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
          onEdit={() => onEdit(7)}
        />
      </div>

      <div className="flex justify-between pt-6">
        <button
          className="cursor-pointer rounded bg-gray-600 px-4 py-2 text-white"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="cursor-pointer rounded bg-green-600 px-4 py-2 text-white"
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
