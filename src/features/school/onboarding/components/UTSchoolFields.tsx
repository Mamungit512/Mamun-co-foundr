"use client";

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
  getDegreeTypesForSchool,
  getProgramsForSchoolAndDegreeType,
  DEGREE_TYPE_LABELS,
  SECTOR_INTEREST_LABELS,
} from "@/features/school/data/utSchoolsAndMajors";

const LABEL_CLS =
  "text-xs font-semibold tracking-widest text-[var(--ui-text-muted)] uppercase";

const SELECT_CLS =
  "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5 text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)] transition-all duration-200 focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none hover:border-[var(--ui-border-strong)] [&>option]:bg-[var(--ui-popover-bg)] [&>option]:text-[var(--ui-text)]";

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
  const utSectorInterestsValue = w("utSectorInterests") || [];

  const availableDegreeTypes = utCollegeValue ? getDegreeTypesForSchool(utCollegeValue) : [];
  const availablePrograms =
    utCollegeValue && utDegreeTypeValue
      ? getProgramsForSchoolAndDegreeType(utCollegeValue, utDegreeTypeValue)
      : [];

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
          {...reg("utCollege")}
          className={SELECT_CLS}
          onChange={(e) => {
            sv("utCollege", e.target.value as UTCollege);
            sv("utDegreeType", undefined);
            sv("utMajor", undefined);
            sv("utSectorInterests", []);
          }}
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

      {/* ── Degree Type (conditional) ── */}
      {utCollegeValue && (
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Degree Type</label>
          <select
            {...reg("utDegreeType")}
            className={SELECT_CLS}
            onChange={(e) => {
              sv("utDegreeType", e.target.value as UTDegreeType);
              sv("utMajor", undefined);
            }}
          >
            <option value="">Select a degree type...</option>
            {availableDegreeTypes.map((degreeType) => (
              <option key={degreeType} value={degreeType}>
                {DEGREE_TYPE_LABELS[degreeType]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Major (conditional) ── */}
      {utCollegeValue && utDegreeTypeValue && (
        <div className="flex flex-col gap-y-1.5">
          <label className={LABEL_CLS}>Program / Major</label>
          <select {...reg("utMajor")} className={SELECT_CLS}>
            <option value="">Select a program...</option>
            {availablePrograms.map((program) => (
              <option key={program.name} value={program.name}>
                {program.name}
              </option>
            ))}
          </select>
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
            min: { value: 1900, message: "Invalid year" },
            max: { value: 2035, message: "Invalid year" },
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
