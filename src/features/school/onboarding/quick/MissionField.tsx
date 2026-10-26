"use client";

import { useRef, useState } from "react";
import { MISSION_STARTERS } from "@/features/school/onboarding/quick/constants";
import { Chip, ERROR_CLS, TEXTAREA_CLS } from "@/features/school/onboarding/quick/ui";

/** Mission textarea with starter chips and a character counter. Used in step 4 and the done-screen sheet. */
export default function MissionField({
  id,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // Only flag "too short" once the user has left the field, not mid-sentence.
  const [touched, setTouched] = useState(false);
  const tooShort = touched && value.trim().length > 0 && value.trim().length < min;

  const applyStarter = (text: string) => {
    onChange(text);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(text.length, text.length);
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {MISSION_STARTERS.map((starter) => (
          <Chip key={starter.label} small pressed={false} onClick={() => applyStarter(starter.text)}>
            {starter.label}
          </Chip>
        ))}
      </div>
      <textarea
        ref={ref}
        id={id}
        maxLength={max}
        placeholder="e.g. Make it easier for West Campus students to get groceries delivered."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={tooShort}
        className={TEXTAREA_CLS}
      />
      <div className="flex justify-between gap-2.5 text-xs text-[var(--ui-text-muted)]">
        <span className={tooShort ? ERROR_CLS : ""}>
          {tooShort ? `A few more words (${min}+ characters).` : ""}
        </span>
        <span>
          {value.length} / {max}
        </span>
      </div>
    </>
  );
}
