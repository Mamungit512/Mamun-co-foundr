"use client";

import { useId } from "react";
import {
  ARCHETYPE_OPTIONS,
  ARCHETYPE_UNSURE,
  TITLE_MAX,
} from "@/features/school/onboarding/quick/constants";
import type { StepProps } from "@/features/school/onboarding/quick/StepAbout";
import { Choice, OptionRow, QField, TextInput } from "@/features/school/onboarding/quick/ui";

export default function StepBring({ data, ui, update }: StepProps) {
  const titleId = useId();

  return (
    <>
      <QField label="Your title" hint="Shows under your name" htmlFor={titleId}>
        <TextInput
          id={titleId}
          maxLength={TITLE_MAX}
          placeholder="e.g. CS student, Product designer"
          value={data.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
        />
      </QField>

      <QField label="Do you have a technical background?" hint="Code, engineering or hardware">
        <div className="grid grid-cols-2 gap-2.5">
          <Choice pressed={data.isTechnical === "yes"} onClick={() => update({ isTechnical: "yes" })}>
            Yes
          </Choice>
          <Choice pressed={data.isTechnical === "no"} onClick={() => update({ isTechnical: "no" })}>
            No
          </Choice>
        </div>
      </QField>

      <QField label="Which founder sounds most like you?" hint="You can change it later">
        <div className="grid grid-cols-1 gap-2.5 min-[561px]:grid-cols-2">
          {ARCHETYPE_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              compact
              pressed={!ui.archetypeUnsure && data.archetype === option.value}
              onClick={() => update({ archetype: option.value }, { archetypeUnsure: false })}
              title={option.title}
              description={option.description}
            />
          ))}
          <OptionRow
            compact
            pressed={!!ui.archetypeUnsure}
            // archetype is nullable in the DB, so "not sure" saves as no archetype.
            onClick={() => update({ archetype: undefined }, { archetypeUnsure: true })}
            title={ARCHETYPE_UNSURE.title}
            description={ARCHETYPE_UNSURE.description}
          />
        </div>
      </QField>
    </>
  );
}
