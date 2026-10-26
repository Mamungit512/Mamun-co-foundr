"use client";

import { useId } from "react";
import { SECTOR_INTEREST_LABELS } from "@/features/school/data/utSchoolsAndMajors";
import {
  INTENT_OPTIONS,
  INTERESTS_MAX,
  INTRO_MAX,
  INTRO_MIN,
} from "@/features/school/onboarding/quick/constants";
import MissionField from "@/features/school/onboarding/quick/MissionField";
import type { StepProps } from "@/features/school/onboarding/quick/StepAbout";
import { Chip, Choice, OptionRow, QField } from "@/features/school/onboarding/quick/ui";

const INTERESTS = Object.keys(SECTOR_INTEREST_LABELS) as UTSectorInterest[];

export default function StepLooking({
  data,
  update,
  onLimit,
}: StepProps & { onLimit: (max: number) => void }) {
  const missionId = useId();
  const selected = data.utSectorInterests ?? [];

  const toggleInterest = (interest: UTSectorInterest) => {
    let next: UTSectorInterest[];
    if (selected.includes(interest)) next = selected.filter((i) => i !== interest);
    else if (selected.length >= INTERESTS_MAX) return onLimit(INTERESTS_MAX);
    else next = [...selected, interest];
    // Matching scores shared interests from priorityAreas, so keep it in sync
    // with the school sector interests picked here.
    update({ utSectorInterests: next, priorityAreas: next.map((i) => SECTOR_INTEREST_LABELS[i]) });
  };

  return (
    <>
      <QField label="Do you have a startup or idea already?">
        <div className="grid grid-cols-2 gap-2.5">
          <Choice pressed={data.hasStartup === "yes"} onClick={() => update({ hasStartup: "yes" })}>
            Yes, I do
          </Choice>
          <Choice pressed={data.hasStartup === "no"} onClick={() => update({ hasStartup: "no" })}>
            Not yet
          </Choice>
        </div>
      </QField>

      <QField label="What are you looking for?">
        <div className="flex flex-col gap-2.5">
          {INTENT_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              radio
              pressed={data.intent === option.value}
              onClick={() => update({ intent: option.value })}
              title={option.title}
              description={option.description}
            />
          ))}
        </div>
      </QField>

      <QField label={`Pick up to ${INTERESTS_MAX} interests`} hint={`${selected.length} of ${INTERESTS_MAX}`}>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <Chip key={interest} pressed={selected.includes(interest)} onClick={() => toggleInterest(interest)}>
              {SECTOR_INTEREST_LABELS[interest]}
            </Chip>
          ))}
        </div>
      </QField>

      <QField label="Your mission in one line" hint="Shows as your intro · tap a starter" htmlFor={missionId}>
        <MissionField
          id={missionId}
          value={data.personalIntro ?? ""}
          onChange={(personalIntro) => update({ personalIntro })}
          min={INTRO_MIN}
          max={INTRO_MAX}
        />
      </QField>
    </>
  );
}
