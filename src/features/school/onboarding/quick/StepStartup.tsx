"use client";

import { useId } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Globe } from "lucide-react";
import {
  IDEA_STAGE,
  STARTUP_MODE_OPTIONS,
  STARTUP_STAGES,
} from "@/features/school/onboarding/quick/constants";
import type { StepProps } from "@/features/school/onboarding/quick/StepAbout";
import { Choice, ERROR_CLS, INPUT_CLS, QField, Reveal, TextInput } from "@/features/school/onboarding/quick/ui";
import {
  isGithubValid,
  isLinkedinValid,
  isWebsiteValid,
  type StartupMode,
} from "@/features/school/onboarding/quick/validation";

const NAME_MAX = 80;
const DESCRIPTION_MAX = 140;

// Cleared when the answer is "No, exploring", since the profile save overwrites
// every startup column and stale values would otherwise be written back.
const EMPTY_STARTUP = {
  startupName: undefined,
  startupDescription: undefined,
  startupFunding: undefined,
  startupWebsite: undefined,
} satisfies Partial<OnboardingData>;

function LinkField({
  id,
  label,
  optional = true,
  icon,
  hint,
  error,
  ...input
}: {
  id: string;
  label: string;
  optional?: boolean;
  icon: React.ReactNode;
  hint?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <QField label={label} hint={optional ? "Optional" : undefined} htmlFor={id}>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--ui-text-muted)]"
        >
          {icon}
        </span>
        <TextInput id={id} type="url" inputMode="url" className="pl-10" aria-invalid={!!error} {...input} />
      </div>
      {error ? <span className={ERROR_CLS}>{error}</span> : hint && <span className="text-xs text-[var(--ui-text-muted)]">{hint}</span>}
    </QField>
  );
}

export default function StepStartup({ data, ui, update }: StepProps) {
  const ids = {
    name: useId(),
    stage: useId(),
    description: useId(),
    linkedin: useId(),
    github: useId(),
    website: useId(),
  };
  const mode = ui.startupMode;
  const hasStartup = mode === "building" || mode === "idea";

  const setMode = (next: StartupMode) => {
    if (next === mode) return;
    if (next === "exploring") return update({ hasStartup: "no", ...EMPTY_STARTUP }, { startupMode: next });
    if (next === "idea") return update({ hasStartup: "yes", startupFunding: IDEA_STAGE }, { startupMode: next });
    // "Idea stage" no longer fits once they say it's already being built.
    update(
      { hasStartup: "yes", startupFunding: data.startupFunding === IDEA_STAGE ? undefined : data.startupFunding },
      { startupMode: next },
    );
  };

  return (
    <>
      <QField label="Do you have a startup?">
        <div className="grid grid-cols-3 gap-2.5">
          {STARTUP_MODE_OPTIONS.map((option) => (
            <Choice key={option.value} pressed={mode === option.value} onClick={() => setMode(option.value)}>
              {option.label}
            </Choice>
          ))}
        </div>
      </QField>

      {hasStartup && (
        <Reveal className="flex flex-col gap-5">
          <div className="grid gap-2.5 min-[561px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <QField label="Startup name" htmlFor={ids.name}>
              <TextInput
                id={ids.name}
                maxLength={NAME_MAX}
                value={data.startupName ?? ""}
                onChange={(e) => update({ startupName: e.target.value })}
              />
            </QField>
            <QField label="Stage" htmlFor={ids.stage}>
              <select
                id={ids.stage}
                className={INPUT_CLS}
                value={data.startupFunding ?? ""}
                onChange={(e) => update({ startupFunding: e.target.value || undefined })}
              >
                <option value="">Select…</option>
                {STARTUP_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </QField>
          </div>

          <QField label="One line on what it does" hint="Optional" htmlFor={ids.description}>
            <TextInput
              id={ids.description}
              maxLength={DESCRIPTION_MAX}
              value={data.startupDescription ?? ""}
              onChange={(e) => update({ startupDescription: e.target.value })}
            />
          </QField>
        </Reveal>
      )}

      <LinkField
        id={ids.linkedin}
        label="LinkedIn"
        icon={<FaLinkedin className="h-4 w-4" />}
        autoComplete="url"
        placeholder="linkedin.com/in/yourname"
        value={data.linkedin ?? ""}
        onChange={(e) => update({ linkedin: e.target.value })}
        error={
          data.linkedin?.trim() && !isLinkedinValid(data.linkedin)
            ? "Use a profile link like linkedin.com/in/yourname, or leave it blank."
            : undefined
        }
      />
      <LinkField
        id={ids.github}
        label="GitHub"
        icon={<FaGithub className="h-4 w-4" />}
        placeholder="github.com/username"
        value={data.git ?? ""}
        onChange={(e) => update({ git: e.target.value })}
        error={
          data.git?.trim() && !isGithubValid(data.git)
            ? "Use a link like github.com/username, or leave it blank."
            : undefined
        }
      />
      {hasStartup && (
        <LinkField
          id={ids.website}
          label="Startup website"
          icon={<Globe aria-hidden className="h-4 w-4" />}
          placeholder="yourstartup.com"
          hint="Site, pitch deck, waitlist or demo. Shown on your card with a globe icon."
          value={data.startupWebsite ?? ""}
          onChange={(e) => update({ startupWebsite: e.target.value })}
          error={
            data.startupWebsite?.trim() && !isWebsiteValid(data.startupWebsite)
              ? "Enter a web address like yourstartup.com, or leave it blank."
              : undefined
          }
        />
      )}
    </>
  );
}
