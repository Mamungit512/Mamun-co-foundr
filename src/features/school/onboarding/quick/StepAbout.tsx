"use client";

import { useId, useState } from "react";
import LocationSelector from "@/components/ui/LocationSelector";
import {
  DEGREE_TYPES,
  DEGREE_TYPE_SHORT_LABELS,
} from "@/features/school/data/utSchoolsAndMajors";
import CollegeDropdown from "@/features/school/onboarding/quick/CollegeDropdown";
import PhotoRow from "@/features/school/onboarding/quick/PhotoRow";
import {
  gradYearBounds,
  gradYearChoices,
  type QuickUi,
} from "@/features/school/onboarding/quick/validation";
import {
  Choice,
  ERROR_CLS,
  LINK_CLS,
  QField,
  Reveal,
  TextInput,
} from "@/features/school/onboarding/quick/ui";

export type StepProps = {
  data: OnboardingData;
  ui: QuickUi;
  update: (patch: Partial<OnboardingData>, uiPatch?: Partial<QuickUi>) => void;
};

export default function StepAbout({ data, ui, update }: StepProps) {
  const ids = {
    first: useId(),
    last: useId(),
    year: useId(),
    college: useId(),
  };
  const [editingLocation, setEditingLocation] = useState(false);

  const name = [data.firstName, data.lastName].filter(Boolean).join(" ");
  const status = data.utStatus;
  const bounds = status ? gradYearBounds(status) : null;
  const yearText = ui.gradYearText ?? "";
  const yearOutOfRange =
    !!bounds && /^\d{4}$/.test(yearText) && (Number(yearText) < bounds.min || Number(yearText) > bounds.max);
  const location = [data.city, data.state, data.country].filter(Boolean).join(", ");

  const setStatus = (next: "student" | "alumni") => {
    if (next === status) return;
    // The quick-pick years differ by status, so a change clears the year.
    update({ utStatus: next, gradYear: undefined }, { gradYearOther: false, gradYearText: "" });
  };

  const setOtherYear = (raw: string) => {
    const text = raw.replace(/\D/g, "").slice(0, 4);
    const year = Number(text);
    const valid = !!bounds && text.length === 4 && year >= bounds.min && year <= bounds.max;
    update({ gradYear: valid ? year : undefined }, { gradYearText: text });
  };

  return (
    <>
      <PhotoRow name={name} pfpUrl={data.pfp_url} onUploaded={(url) => update({ pfp_url: url })} />

      <div className="grid grid-cols-2 gap-2.5">
        <QField label="First name" htmlFor={ids.first}>
          <TextInput
            id={ids.first}
            autoComplete="given-name"
            value={data.firstName ?? ""}
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </QField>
        <QField label="Last name" htmlFor={ids.last}>
          <TextInput
            id={ids.last}
            autoComplete="family-name"
            value={data.lastName ?? ""}
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </QField>
      </div>

      <QField label="Are you a student or alumni?">
        <div className="grid grid-cols-2 gap-2.5">
          <Choice pressed={status === "student"} onClick={() => setStatus("student")}>
            Student
          </Choice>
          <Choice pressed={status === "alumni"} onClick={() => setStatus("alumni")}>
            Alumni
          </Choice>
        </div>
      </QField>

      {status && (
        <Reveal key={status}>
          <QField label={status === "alumni" ? "When did you graduate?" : "When do you graduate?"}>
            <div className="grid grid-cols-3 gap-2.5">
              {gradYearChoices(status).map((year) => (
                <Choice
                  key={year}
                  pressed={!ui.gradYearOther && data.gradYear === year}
                  onClick={() => update({ gradYear: year }, { gradYearOther: false, gradYearText: "" })}
                >
                  {year}
                </Choice>
              ))}
              <Choice
                pressed={!!ui.gradYearOther}
                onClick={() => {
                  update({ gradYear: undefined }, { gradYearOther: true, gradYearText: "" });
                  setTimeout(() => document.getElementById(ids.year)?.focus(), 0);
                }}
              >
                Other
              </Choice>
            </div>
            {ui.gradYearOther && bounds && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={ids.year} className="text-[13px] text-[var(--ui-text-muted)]">
                  Enter your graduation year
                </label>
                <TextInput
                  id={ids.year}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder={`e.g. ${status === "alumni" ? bounds.max - 7 : bounds.min + 1}`}
                  value={yearText}
                  onChange={(e) => setOtherYear(e.target.value)}
                  className="max-w-[180px]"
                />
                {yearOutOfRange && (
                  <span className={ERROR_CLS}>
                    Enter a year between {bounds.min} and {bounds.max}.
                  </span>
                )}
              </div>
            )}
          </QField>
        </Reveal>
      )}

      <QField label="Degree level">
        <div className="grid grid-cols-2 gap-2.5 min-[561px]:grid-cols-4">
          {DEGREE_TYPES.map((degree) => (
            <Choice
              key={degree}
              pressed={data.utDegreeType === degree}
              onClick={() => update({ utDegreeType: degree })}
            >
              {DEGREE_TYPE_SHORT_LABELS[degree]}
            </Choice>
          ))}
        </div>
      </QField>

      <div className="flex flex-col gap-2.5">
        <div id={ids.college} className="text-sm font-semibold">
          Your UT college or school
        </div>
        <CollegeDropdown
          labelId={ids.college}
          value={data.utCollege}
          onChange={(college) =>
            // Majors are per college, so a saved one no longer applies.
            update(college === data.utCollege ? {} : { utCollege: college, utMajor: undefined })
          }
        />
      </div>

      <QField label="Where are you based?">
        {editingLocation ? (
          <Reveal>
            <LocationSelector
              countryValue={data.country ?? ""}
              stateValue={data.state ?? ""}
              cityValue={data.city ?? ""}
              onCountryChange={(country) => update({ country })}
              onStateChange={(state) => update({ state })}
              onCityChange={(city) => update({ city })}
            />
          </Reveal>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--ui-border)] px-3.5 py-3 text-sm">
            <span className={location ? "" : "text-[var(--ui-text-muted)]"}>
              {location || "Add your city"}
            </span>
            <button type="button" onClick={() => setEditingLocation(true)} className={LINK_CLS}>
              {location ? "Change" : "Add"}
            </button>
          </div>
        )}
      </QField>
    </>
  );
}
