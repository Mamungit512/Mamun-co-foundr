"use client";

import Link from "next/link";
import { selectable } from "@/features/school/onboarding/quick/ui";

export type ConsentChecks = {
  policies: boolean;
  matching: boolean;
  consent: boolean;
  age: boolean;
};

export const NO_CONSENT: ConsentChecks = {
  policies: false,
  matching: false,
  consent: false,
  age: false,
};

export function consentMissing(checks: ConsentChecks): string {
  const left = Object.values(checks).filter((v) => !v).length;
  if (left === 0) return "";
  if (left === 4) return "To continue: all four boxes.";
  return `To continue: ${left} more box${left > 1 ? "es" : ""}.`;
}

function Row({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex items-start gap-3.5 rounded-xl px-4 py-3 text-sm leading-normal font-normal has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[color:var(--org-primary)] ${selectable(checked)}`}
    >
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] text-xs font-bold text-white ${
          checked
            ? "border border-[var(--org-primary)] bg-[var(--org-primary)]"
            : "border-[1.5px] border-[var(--ui-text-subtle)]"
        }`}
      >
        {checked && "✓"}
      </span>
      <span>{children}</span>
    </label>
  );
}

const LINK = "font-semibold text-[var(--org-primary)] underline underline-offset-2";

// Wording is the approved consent copy; change it only with legal sign-off.
export default function ConsentRows({
  slug,
  schoolName,
  checks,
  onToggle,
}: {
  slug: string;
  schoolName: string;
  checks: ConsentChecks;
  onToggle: (key: keyof ConsentChecks) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <Row checked={checks.policies} onToggle={() => onToggle("policies")}>
        I have read and agree to the {schoolName} University{" "}
        <Link href={`/school/${slug}/privacy-policy`} target="_blank" className={LINK}>
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href={`/school/${slug}/terms-and-conditions`} target="_blank" className={LINK}>
          Terms of Use
        </Link>
        , and acknowledge that the platform may introduce new features; material changes to how my
        data is used will be communicated and I may withdraw consent at any time.
      </Row>
      <Row checked={checks.matching} onToggle={() => onToggle("matching")}>
        I understand my profile data will be used for{" "}
        <strong className="font-semibold">co-founder matching within my university cohort</strong>.
      </Row>
      <Row checked={checks.consent} onToggle={() => onToggle("consent")}>
        I consent to the platform processing my data as described, and understand I may{" "}
        <strong className="font-semibold">withdraw consent and delete my account at any time</strong>.
      </Row>
      <Row checked={checks.age} onToggle={() => onToggle("age")}>
        I am <strong className="font-semibold">18 years or older</strong> and currently enrolled at the
        partnering university.
      </Row>
    </div>
  );
}
