"use client";

import { useRef, useState } from "react";

import { CALENDLY_URL } from "@/content/site/shell";
import { isEduEmail, PARTNER_FORM as F } from "@/content/site/partner";
import { trackEvent } from "../analytics/events";
import ArrowLink from "../ui/ArrowLink";
import Chip from "../ui/Chip";

type Status = "idle" | "submitting" | "success" | "failure";
type Errors = Partial<Record<"firstName" | "lastName" | "email" | "institution", string>>;

const FIELD =
  "w-full min-h-44 rounded-nested border bg-white px-14 py-13 font-sans text-ink placeholder:text-text-placeholder focus:border-ink lg:min-h-0";
// Validated fields, in form order, for moving focus to the first error.
const FIELD_IDS: Record<keyof Errors, string> = {
  firstName: "pf-first",
  lastName: "pf-last",
  email: "pf-email",
  institution: "pf-institution",
};

// Single-line fields share one height: 48px on phones (16px text, 44px+
// tap target), the drawn 42px box on desktop.
const LINE = "h-48 lg:h-42";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-text-eyebrow type-field-label">
      {children}
    </label>
  );
}

function ErrorText({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="text-error type-error">
      {children}
    </p>
  );
}

// The /partner demo request form (spec §11.2). Posts to /api/partner, which
// forwards to the Google Form server-side. .edu addresses only.
export default function PartnerForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const started = useRef(false);

  // demo_form_start: the first focus on any field.
  const onFocusCapture = () => {
    if (started.current) return;
    started.current = true;
    trackEvent("demo_form_start", {});
  };

  const border = (key: keyof Errors) => (errors[key] ? "border-error" : "border-rule-field");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    const next: Errors = {};
    if (!value("firstName")) next.firstName = F.errors.required;
    if (!value("lastName")) next.lastName = F.errors.required;
    if (!isEduEmail(value("email"))) next.email = F.errors.eduOnly;
    if (!value("institution")) next.institution = F.errors.required;
    setErrors(next);
    const firstInvalid = (Object.keys(FIELD_IDS) as (keyof Errors)[]).find((key) => next[key]);
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: value("firstName"),
          lastName: value("lastName"),
          email: value("email"),
          institution: value("institution"),
          enrollment: value("enrollment"),
          office: data.getAll("office").map(String),
          notes: value("notes"),
          website: value("website"),
        }),
      });
      if (res.ok) {
        trackEvent("demo_form_submit", {
          office: data.getAll("office").map(String).join(", "),
          enrollment_band: value("enrollment"),
        });
      }
      setStatus(res.ok ? "success" : "failure");
    } catch {
      setStatus("failure");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex flex-col gap-16">
        <h2 className="text-ink type-card-lg">{F.success.title}</h2>
        <p className="text-text-strong type-motion">{F.success.body}</p>
        <ArrowLink href={CALENDLY_URL}>{F.success.link}</ArrowLink>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form noValidate onSubmit={onSubmit} onFocusCapture={onFocusCapture} aria-labelledby="partner-form-title" className="flex flex-col gap-24">
      <h2 id="partner-form-title" className="text-ink type-card-lg">
        {F.title}
      </h2>

      {/* Honeypot — hidden from people and assistive tech. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <Label htmlFor="pf-first">{F.fields.firstName.label}</Label>
          <input
            id="pf-first"
            name="firstName"
            autoComplete="given-name"
            placeholder={F.fields.firstName.placeholder}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "pf-first-error" : undefined}
            className={`${FIELD} ${LINE} type-input ${border("firstName")}`}
          />
          <ErrorText id="pf-first-error">{errors.firstName}</ErrorText>
        </div>
        <div className="flex flex-col gap-8">
          <Label htmlFor="pf-last">{F.fields.lastName.label}</Label>
          <input
            id="pf-last"
            name="lastName"
            autoComplete="family-name"
            placeholder={F.fields.lastName.placeholder}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "pf-last-error" : undefined}
            className={`${FIELD} ${LINE} type-input ${border("lastName")}`}
          />
          <ErrorText id="pf-last-error">{errors.lastName}</ErrorText>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="pf-email">{F.fields.email.label}</Label>
        <input
          id="pf-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={F.fields.email.placeholder}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "pf-email-error pf-email-hint" : "pf-email-hint"}
          className={`${FIELD} ${LINE} type-input ${border("email")}`}
        />
        <ErrorText id="pf-email-error">{errors.email}</ErrorText>
        <p id="pf-email-hint" className="text-text-eyebrow type-hint">
          {F.fields.email.hint}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <Label htmlFor="pf-institution">{F.fields.institution.label}</Label>
          <input
            id="pf-institution"
            name="institution"
            autoComplete="organization"
            placeholder={F.fields.institution.placeholder}
            aria-invalid={!!errors.institution}
            aria-describedby={errors.institution ? "pf-institution-error" : undefined}
            className={`${FIELD} ${LINE} type-input ${border("institution")}`}
          />
          <ErrorText id="pf-institution-error">{errors.institution}</ErrorText>
        </div>
        <div className="flex flex-col gap-8">
          <Label htmlFor="pf-enrollment">{F.fields.enrollment.label}</Label>
          <div className="relative">
            <select
              id="pf-enrollment"
              name="enrollment"
              defaultValue=""
              className={`${FIELD} ${LINE} type-input appearance-none border-rule-field pr-32 invalid:text-text-eyebrow`}
              required
            >
              <option value="" disabled>
                {F.fields.enrollment.placeholder}
              </option>
              {F.enrollmentOptions.map((option) => (
                <option key={option} value={option} className="text-ink">
                  {option}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-14 -translate-y-1/2 text-text-placeholder type-input"
            >
              ⌄
            </span>
          </div>
        </div>
      </div>

      <fieldset className="m-0 flex flex-col gap-10 border-0 p-0">
        <legend className="mb-10 p-0 text-text-eyebrow type-field-label">{F.fields.office.label}</legend>
        <div className="flex flex-wrap gap-9">
          {F.officeOptions.map((option) => (
            <Chip key={option} name="office" value={option} label={option} disabled={submitting} />
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-8">
        <Label htmlFor="pf-notes">{F.fields.notes.label}</Label>
        <textarea
          id="pf-notes"
          name="notes"
          placeholder={F.fields.notes.placeholder}
          className={`${FIELD} h-116 resize-y border-rule-field type-input-multiline`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-44 cursor-pointer items-center justify-center rounded-pill border-0 bg-ink px-24 py-16 font-sans whitespace-nowrap text-white type-submit disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? F.submitting : status === "failure" ? F.failure.retry : F.submit}
      </button>

      {status === "failure" ? (
        <p role="alert" className="text-error type-fineprint">
          {F.failure.body}
          <a href={`mailto:${F.email}`} className="tap-44 border-b border-lime">
            {F.email}
          </a>
          .
        </p>
      ) : (
        <p className="text-text-eyebrow type-fineprint">
          {F.replyPrefix}
          <a href={`mailto:${F.email}`} className="tap-44 border-b border-lime">
            {F.email}
          </a>
          {F.replySuffix}
        </p>
      )}
    </form>
  );
}
