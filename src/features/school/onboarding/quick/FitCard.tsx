"use client";

import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Globe } from "lucide-react";
import {
  DEGREE_TYPE_SHORT_LABELS,
  SECTOR_INTEREST_LABELS,
  getSchoolLabel,
  isDegreeType,
  isUTCollege,
} from "@/features/school/data/utSchoolsAndMajors";
import {
  ARCHETYPE_OPTIONS,
  IDEA_STAGE,
  INTENT_OPTIONS,
  SCHOOL_SHORT_NAME,
} from "@/features/school/onboarding/quick/constants";
import {
  cleanLinkedin,
  cleanUrl,
  isGithubValid,
  isIntroValid,
  isLinkedinValid,
  isWebsiteValid,
} from "@/features/school/onboarding/quick/validation";
import { Avatar, FOCUS_CLS } from "@/features/school/onboarding/quick/ui";

const TAG_CLS = "rounded-md border px-2.5 py-1 text-xs font-semibold";

function Cell({
  label,
  value,
  ghost,
  action,
}: {
  label: string;
  value: string;
  ghost: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-3 py-2.5 [&:nth-child(-n+2)]:border-b [&:nth-child(odd)]:border-r border-[var(--ui-border)]">
      <div className="text-[10.5px] font-bold tracking-widest text-[var(--ui-text-muted)] uppercase">
        {label}
      </div>
      {value ? (
        <div className="text-[13.5px] leading-snug break-words text-[var(--ui-text)]">{value}</div>
      ) : (
        <div className="text-[12.5px] leading-snug text-[var(--ui-text-subtle)] italic">{ghost}</div>
      )}
      {action}
    </div>
  );
}

export default function FitCard({
  data,
  editable = false,
  onEditMission,
}: {
  data: OnboardingData;
  editable?: boolean;
  onEditMission?: () => void;
}) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || "Your name";

  const classLine = [
    data.utStatus === "alumni" ? "Alumni" : data.utStatus === "student" ? "Student" : "",
    data.gradYear ? `Class of ${data.gradYear}` : "",
    isDegreeType(data.utDegreeType) ? DEGREE_TYPE_SHORT_LABELS[data.utDegreeType] : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const meta = [isUTCollege(data.utCollege) ? getSchoolLabel(data.utCollege) : "", classLine]
    .filter(Boolean)
    .join(" · ");

  const intent = INTENT_OPTIONS.find((o) => o.value === data.intent);
  const archetype = ARCHETYPE_OPTIONS.find((o) => o.value === data.archetype);
  const interests = (data.utSectorInterests ?? []).map((key) => SECTOR_INTEREST_LABELS[key] ?? key);

  const mission = isIntroValid(data.personalIntro) ? data.personalIntro!.trim() : "";
  const brings = data.title?.trim()
    ? `${data.title.trim()}${data.isTechnical === "yes" ? " · Technical" : ""}`
    : "";
  const startupLine =
    data.hasStartup === "yes"
      ? data.startupFunding === IDEA_STAGE
        ? "Has an idea"
        : "Has a startup"
      : data.hasStartup === "no"
        ? "Exploring, no startup yet"
        : "";
  const basedIn = [data.city, data.state || data.country].filter(Boolean).join(", ");
  const linkedin = cleanLinkedin(data.linkedin);
  const github = cleanUrl(data.git);
  const website = cleanUrl(data.startupWebsite);
  const links = [
    linkedin && isLinkedinValid(linkedin) ? { key: "linkedin", Icon: FaLinkedin, text: linkedin } : null,
    github && isGithubValid(github) ? { key: "github", Icon: FaGithub, text: github } : null,
    website && isWebsiteValid(website) ? { key: "website", Icon: Globe, text: website } : null,
  ].filter((link) => link !== null);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--ui-border)] bg-[var(--org-bg)] p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} src={data.pfp_url} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-lg font-semibold text-[var(--ui-text)]">
            {name}
            {data.utStatus && (
              <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-emerald-800">
                ✓ Verified {SCHOOL_SHORT_NAME}
              </span>
            )}
          </div>
          <div className="text-[13px] text-[var(--ui-text-muted)]">
            {meta || "School and class fill in at step 2"}
          </div>
        </div>
      </div>

      {(intent || data.isTechnical === "yes" || archetype || interests.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {intent && (
            <span className={`${TAG_CLS} rounded-full border-[var(--org-primary)] text-[var(--org-primary)]`}>
              {intent.tag}
            </span>
          )}
          {data.isTechnical === "yes" && (
            <span className={`${TAG_CLS} border-[var(--org-primary)] bg-[var(--org-primary)] text-white`}>
              Technical
            </span>
          )}
          {archetype && (
            <span className={`${TAG_CLS} border-[var(--ui-border)] bg-[var(--ui-surface)] font-medium text-[var(--ui-text-muted)]`}>
              {archetype.title}
            </span>
          )}
          {interests.map((label) => (
            <span key={label} className={`${TAG_CLS} border-[var(--org-primary)] text-[var(--org-primary)]`}>
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--ui-border)]">
        <Cell
          label="Mission"
          value={mission}
          ghost="Fills in at step 5"
          action={
            editable && onEditMission ? (
              <button
                type="button"
                onClick={onEditMission}
                className={`cursor-pointer self-start rounded py-0.5 text-xs font-semibold text-[var(--org-primary)] underline ${FOCUS_CLS}`}
              >
                {mission ? "Edit" : "+ Add your mission"}
              </button>
            ) : undefined
          }
        />
        <Cell label="Brings" value={brings} ghost="Fills in at step 3" />
        <Cell label="Looking for" value={intent?.sentence ?? ""} ghost="Fills in at step 5" />
        <Cell label="Based in" value={basedIn} ghost="Fills in at step 2" />
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-[var(--ui-border)] px-3 py-2.5">
        <div className="text-[10.5px] font-bold tracking-widest text-[var(--ui-text-muted)] uppercase">
          Startup plans
        </div>
        {startupLine ? (
          <>
            <div className="text-[13.5px] leading-snug text-[var(--ui-text)]">{startupLine}</div>
            {data.hasStartup === "yes" && data.startupName?.trim() && (
              <div className="text-[13.5px] leading-snug text-[var(--ui-text)]">
                <b>{data.startupName.trim()}</b>
                {data.startupFunding && data.startupFunding !== IDEA_STAGE && <span className="text-[var(--ui-text-muted)]"> · {data.startupFunding}</span>}
                {data.startupDescription?.trim() && (
                  <div className="text-[12.5px] text-[var(--ui-text-muted)]">{data.startupDescription.trim()}</div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-[12.5px] leading-snug text-[var(--ui-text-subtle)] italic">Fills in at step 4</div>
        )}
      </div>

      {links.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {links.map(({ key, Icon, text }) => (
            <div key={key} className="flex items-center gap-2 text-[12.5px] break-all text-[var(--ui-text-muted)]">
              <Icon aria-hidden className="h-4 w-4 shrink-0" />
              {text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
