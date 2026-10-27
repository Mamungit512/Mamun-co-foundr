"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import FitCard from "@/features/school/onboarding/quick/FitCard";
import MissionField from "@/features/school/onboarding/quick/MissionField";
import { INTRO_MAX, INTRO_MIN } from "@/features/school/onboarding/quick/constants";
import {
  cleanLinkedin,
  isIntroValid,
  isLinkedinValid,
} from "@/features/school/onboarding/quick/validation";
import {
  BTN_CLS,
  BTN_GHOST_CLS,
  ERROR_CLS,
  FOCUS_CLS,
  QField,
  Sheet,
  TextInput,
} from "@/features/school/onboarding/quick/ui";

type SheetId = "mission" | "linkedin" | "git" | "scheduling";

// Optional extras that move profile strength from Complete to All-star.
const EXTRAS: {
  sheet: Exclude<SheetId, "mission">;
  field: "linkedin" | "git" | "schedulingUrl";
  add: string;
  hint: string;
}[] = [
  { sheet: "linkedin", field: "linkedin", add: "+ Add LinkedIn", hint: "LinkedIn" },
  { sheet: "git", field: "git", add: "+ Add GitHub", hint: "GitHub" },
  { sheet: "scheduling", field: "schedulingUrl", add: "+ Add a scheduling link", hint: "a scheduling link" },
];

const LEVELS = ["Complete", "Strong", "All-star"];
const STRENGTH_PCT = [60, 78, 90, 100];

function strengthOf(data: OnboardingData) {
  const missing = EXTRAS.filter(({ field }) => !data[field]?.trim());
  const n = EXTRAS.length - missing.length;
  const names = missing.map((x) => x.hint);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names.at(-1)}` : names[0];
  return {
    n,
    missing,
    label: n === EXTRAS.length ? "All-star" : n >= 1 ? "Strong" : "Complete",
    pct: STRENGTH_PCT[n],
    hint: n === EXTRAS.length ? "Every box filled. Nice work." : `Add ${list}${n === 2 ? " to reach All-star" : " to level up"}`,
  };
}

const isUrlish = (value: string) => /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(value.trim());

export default function DoneScreen({
  data,
  matchesHref,
  onSave,
  onEditAnswers,
  toast,
}: {
  data: OnboardingData;
  matchesHref: string;
  onSave: (patch: Partial<OnboardingData>) => Promise<boolean>;
  onEditAnswers: () => void;
  toast: (message: React.ReactNode) => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fieldId = useId();
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const strength = strengthOf(data);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const openSheet = (id: SheetId) => {
    const current =
      id === "mission" ? data.personalIntro : id === "linkedin" ? data.linkedin : id === "git" ? data.git : data.schedulingUrl;
    setDraft(current ?? "");
    setSheet(id);
  };

  const save = async (patch: Partial<OnboardingData>, success: string) => {
    setSaving(true);
    const ok = await onSave(patch);
    setSaving(false);
    if (ok) {
      setSheet(null);
      toast(success);
    } else {
      toast("Couldn’t save that. Please try again.");
    }
  };

  const sheetValid =
    sheet === "mission"
      ? isIntroValid(draft)
      : sheet === "linkedin"
        ? !!draft.trim() && isLinkedinValid(draft)
        : sheet === "scheduling"
          ? isUrlish(draft)
          : !!draft.trim();

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check aria-hidden className="h-[22px] w-[22px]" strokeWidth={2.6} />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="text-[26px] font-semibold outline-none">
          You’re in the founder pool.
        </h2>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-[var(--ui-border)] bg-[var(--org-bg)] px-4 py-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2.5 text-[13.5px] text-[var(--ui-text-muted)]">
          <span>
            Profile strength: <b className="text-[15px] whitespace-nowrap text-[var(--ui-text)]">{strength.label}</b>
          </span>
          <span>{strength.hint}</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-[var(--ui-border)]">
          <i
            className="block h-full bg-[var(--org-primary)] transition-[width] duration-300"
            style={{ width: `${strength.pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold tracking-wide uppercase">
          {LEVELS.map((level, i) => {
            const reached = [true, strength.n >= 1, strength.n === EXTRAS.length][i];
            return (
              <span key={level} className={reached ? "text-[var(--org-primary)]" : "text-[var(--ui-text-subtle)]"}>
                {level}
              </span>
            );
          })}
        </div>
      </div>

      <FitCard data={data} editable onEditMission={() => openSheet("mission")} />

      {strength.missing.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {strength.missing.map((extra) => (
            <button
              key={extra.sheet}
              type="button"
              onClick={() => openSheet(extra.sheet)}
              className={`inline-flex h-[38px] cursor-pointer items-center rounded-full border border-dashed border-[var(--org-primary)] bg-[var(--org-bg)] px-3.5 text-[13px] font-semibold text-[var(--org-primary)] transition-colors hover:bg-[var(--ui-surface-active)] ${FOCUS_CLS}`}
            >
              {extra.add}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        <Link href={matchesHref} className={BTN_CLS}>
          See all my matches →
        </Link>
        <button type="button" onClick={onEditAnswers} className={BTN_GHOST_CLS}>
          Edit my answers
        </button>
      </div>

      <Sheet open={sheet === "mission"} title="Your mission" onClose={() => setSheet(null)}>
        <p className="text-sm text-[var(--ui-text-muted)]">
          One sentence on what you want to build. Tap a starter or write your own.
        </p>
        <MissionField id={fieldId} value={draft} onChange={setDraft} min={INTRO_MIN} max={INTRO_MAX} />
        <button
          type="button"
          disabled={!sheetValid || saving}
          onClick={() => save({ personalIntro: draft.trim() }, "Mission updated on your Fit Card.")}
          className={BTN_CLS}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </Sheet>

      <Sheet open={sheet === "linkedin"} title="Add LinkedIn" onClose={() => setSheet(null)}>
        <QField label="LinkedIn profile" htmlFor={fieldId}>
          <TextInput
            id={fieldId}
            type="url"
            inputMode="url"
            placeholder="linkedin.com/in/yourname"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {draft.trim() && !isLinkedinValid(draft) && (
            <span className={ERROR_CLS}>Use a profile link like linkedin.com/in/yourname.</span>
          )}
        </QField>
        <button
          type="button"
          disabled={!sheetValid || saving}
          onClick={() => save({ linkedin: cleanLinkedin(draft) }, "LinkedIn added to your Fit Card.")}
          className={BTN_CLS}
        >
          {saving ? "Saving…" : "Add to my card"}
        </button>
      </Sheet>

      <Sheet open={sheet === "git"} title="Add GitHub" onClose={() => setSheet(null)}>
        <QField label="GitHub or GitLab" htmlFor={fieldId}>
          <TextInput
            id={fieldId}
            type="url"
            inputMode="url"
            placeholder="github.com/yourusername"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </QField>
        <button
          type="button"
          disabled={!sheetValid || saving}
          onClick={() => save({ git: draft.trim() }, "GitHub added to your profile.")}
          className={BTN_CLS}
        >
          {saving ? "Saving…" : "Add to my profile"}
        </button>
      </Sheet>

      <Sheet open={sheet === "scheduling"} title="Add a scheduling link" onClose={() => setSheet(null)}>
        <QField label="Calendly, Cal.com or similar" htmlFor={fieldId}>
          <TextInput
            id={fieldId}
            type="url"
            inputMode="url"
            placeholder="https://calendly.com/your-link"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </QField>
        <button
          type="button"
          disabled={!sheetValid || saving}
          onClick={() => save({ schedulingUrl: draft.trim() }, "Scheduling link added to your profile.")}
          className={BTN_CLS}
        >
          {saving ? "Saving…" : "Add to my profile"}
        </button>
      </Sheet>
    </div>
  );
}
