"use client";

import { useEffect, useState } from "react";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
  FieldValues,
} from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import {
  UT_SCHOOLS_AND_PROGRAMS,
  DEGREE_TYPES,
  DEGREE_TYPE_LABELS,
  SECTOR_INTEREST_LABELS,
  getMajorOptions,
  isDegreeType,
  normalizeDegreeType,
} from "@/features/school/data/utSchoolsAndMajors";
import { deriveUtStatus } from "@/features/school/onboarding/deriveUtStatus";

const LABEL_CLS =
  "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

const SELECT_CLS =
  "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] [&>option]:bg-[var(--ui-popover-bg)] [&>option]:text-[var(--ui-text)]";

const OTHER_MAJOR = "__other__";

type UTSchoolFieldsData = {
  utStatus: "student" | "alumni";
  gradYear?: number;
  utCollege?: UTCollege;
  utDegreeType?: UTDegreeType;
  utMajor?: string;
  utSectorInterests?: UTSectorInterest[];
  additionalEducation?: string;
};

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
};

export default function UTSchoolFields<T extends FieldValues>({ register, watch, setValue, errors }: Props<T>) {
  const reg = register as unknown as UseFormRegister<UTSchoolFieldsData>;
  const w = watch as unknown as UseFormWatch<UTSchoolFieldsData>;
  const sv = setValue as unknown as UseFormSetValue<UTSchoolFieldsData>;
  const errs = errors as unknown as FieldErrors<UTSchoolFieldsData>;

  const utStatusValue = w("utStatus");
  const utCollegeValue = w("utCollege");
  const utDegreeTypeValue = w("utDegreeType");
  const utMajorValue = w("utMajor");
  const utSectorInterestsValue = w("utSectorInterests") || [];
  const gradYearValue = w("gradYear");

  const [otherMajor, setOtherMajor] = useState(false);

  // A graduation year that's already passed means the person is alumni,
  // even if they'd previously selected (or defaulted to) "student".
  useEffect(() => {
    const corrected = deriveUtStatus(utStatusValue, gradYearValue);
    if (corrected && corrected !== utStatusValue) sv("utStatus", corrected);
  }, [utStatusValue, gradYearValue, sv]);

  // Drafts saved before degree levels were generalized can still hold the
  // retired "professional"/"other" values — normalize on load so the select
  // shows a real option (or prompts for one) instead of silently rendering
  // blank.
  useEffect(() => {
    if (utDegreeTypeValue && !isDegreeType(utDegreeTypeValue)) {
      sv("utDegreeType", normalizeDegreeType(utDegreeTypeValue));
    }
  }, [utDegreeTypeValue, sv]);

  const currentYear = new Date().getFullYear();
  const isAlumni = utStatusValue === "alumni";
  const gradYearMin = isAlumni ? 1965 : currentYear;
  const gradYearMax = isAlumni ? currentYear : currentYear + 10;

  const majorOptions = getMajorOptions(utCollegeValue, utDegreeTypeValue);
  const isCustomMajor = !!utMajorValue && !majorOptions.includes(utMajorValue);
  const showOtherMajor = otherMajor || isCustomMajor;

  return (
    <>
      {/* ── Student or Alumni ── */}
      <div className="flex flex-col gap-y-3">
        <label className={LABEL_CLS}>Are you a student or alumni? *</label>
        <div className="flex gap-x-3">
          {(["student", "alumni"] as const).map((val) => (
            <label
              key={val}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150 ${
                utStatusValue === val
                  ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                  : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)] hover:text-[var(--ui-text)]"
              }`}
            >
              <input
                type="radio"
                value={val}
                {...reg("utStatus", { required: true })}
                className="sr-only"
              />
              {val === "student" ? "Student" : "Alumni"}
            </label>
          ))}
        </div>
        {errs.utStatus && (
          <p className="text-xs text-red-400">Please select an option</p>
        )}
      </div>

      {/* ── UT College Selection ── */}
      <div className="flex flex-col gap-y-1.5">
        <label className={LABEL_CLS}>UT College / School *</label>
        <select
          {...reg("utCollege", {
            required: true,
            onChange: () => {
              sv("utMajor", undefined);
              setOtherMajor(false);
              sv("utSectorInterests", []);
            },
          })}
          className={SELECT_CLS}
        >
          <option value="">Select a school...</option>
          {Object.entries(UT_SCHOOLS_AND_PROGRAMS).map(([key, school]) => (
            <option key={key} value={key}>
              {school.label}
            </option>
          ))}
        </select>
        {errs.utCollege && (
          <p className="text-xs text-red-400">School is required</p>
        )}
      </div>

      {/* ── Degree Level ── */}
      <div className="flex flex-col gap-y-1.5">
        <label className={LABEL_CLS}>Degree Level *</label>
        <select
          {...reg("utDegreeType", { required: true })}
          className={SELECT_CLS}
        >
          <option value="">Select a degree level...</option>
          {DEGREE_TYPES.map((degreeType) => (
            <option key={degreeType} value={degreeType}>
              {DEGREE_TYPE_LABELS[degreeType]}
            </option>
          ))}
        </select>
        {errs.utDegreeType && (
          <p className="text-xs text-red-400">Degree level is required</p>
        )}
      </div>

      {/* ── Major (conditional on college) ── */}
      {utCollegeValue && (
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Program / Major</label>
          <select
            value={showOtherMajor ? OTHER_MAJOR : utMajorValue ?? ""}
            onChange={(e) => {
              if (e.target.value === OTHER_MAJOR) {
                setOtherMajor(true);
                sv("utMajor", "");
              } else {
                setOtherMajor(false);
                sv("utMajor", e.target.value);
              }
            }}
            className={SELECT_CLS}
          >
            <option value="">Select a program...</option>
            {majorOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value={OTHER_MAJOR}>Other (not listed)</option>
          </select>
          {showOtherMajor && (
            <FormInput
              type="text"
              maxLength={120}
              placeholder="Enter your program or major"
              {...reg("utMajor")}
            />
          )}
        </div>
      )}

      {/* ── Sector Interests (conditional) ── */}
      {utCollegeValue && (
        <div className="flex flex-col gap-y-3">
          <label className={LABEL_CLS}>Areas of Interest</label>
          <p className="text-xs text-[var(--ui-text-muted)]">
            Select relevant sectors aligned with your program
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SECTOR_INTEREST_LABELS) as UTSectorInterest[]).map((sector) => (
              <label
                key={sector}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-150 ${
                  utSectorInterestsValue.includes(sector)
                    ? "border-[var(--ui-text-muted)] bg-[var(--ui-surface-active)] text-[var(--ui-text)]"
                    : "border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text-muted)] hover:border-[var(--ui-border-strong)]"
                }`}
              >
                <input
                  type="checkbox"
                  value={sector}
                  checked={utSectorInterestsValue.includes(sector)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...utSectorInterestsValue, sector as UTSectorInterest]
                      : utSectorInterestsValue.filter((s) => s !== sector);
                    sv("utSectorInterests", newValue);
                  }}
                  className="sr-only"
                />
                <span>{SECTOR_INTEREST_LABELS[sector]}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Graduation Year ── */}
      <div className="flex flex-col gap-y-1.5">
        <label className={LABEL_CLS}>Graduation Year</label>
        <FormInput
          type="number"
          placeholder="e.g. 2026"
          {...reg("gradYear", {
            valueAsNumber: true,
            min: {
              value: gradYearMin,
              message: isAlumni ? "Invalid year" : "Graduation year can't be in the past for students",
            },
            max: {
              value: gradYearMax,
              message: isAlumni ? "Graduation year can't be in the future for alumni" : "Invalid year",
            },
          })}
        />
        {errs.gradYear && (
          <p className="text-xs text-red-400">{errs.gradYear.message}</p>
        )}
      </div>

      {/* ── Additional Education ── */}
      <div className="flex flex-col gap-y-1.5">
        <label className={LABEL_CLS}>
          Additional Education
          <span className="ml-1 font-normal normal-case text-[var(--ui-text-subtle)]">
            (optional)
          </span>
        </label>
        <textarea
          {...reg("additionalEducation")}
          className="w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] resize-none"
          rows={2}
          placeholder="Other degrees or institutions (e.g. Austin Community College, BS Computer Science)"
        />
      </div>
    </>
  );
}
