import { NextResponse, type NextRequest } from "next/server";

import { isEduEmail, PARTNER_FORM } from "@/content/site/partner";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

// /partner demo requests → the Google Form drop box (spec §11.2), posted
// server-side so the entry ids never reach client JS. Responses land in the
// form's linked Google Sheet.
//
// The form's formResponse URL comes from GOOGLE_FORM_RESPONSE_URL
// (https://docs.google.com/forms/d/e/<form id>/formResponse). If the form is
// ever recreated, the URL and the entry ids below change and this breaks
// silently. Re-read the ids from the form's page source.
const FORM_RESPONSE_URL = process.env.GOOGLE_FORM_RESPONSE_URL;

const ENTRY = {
  fullName: "entry.1000057",
  email: "entry.1000027",
  institution: "entry.153993228",
  enrollment: "entry.1000020",
  notes: "entry.1436572486",
  // The form has no "Your office" question yet. Add it (checkboxes with the
  // four office choices), then put its entry id here.
  office: null as string | null,
};

const text = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Shared Postgres-backed limit, so it holds across Vercel instances. 10 per
  // 10 minutes: campus users often share an IP.
  const rateLimit = await checkRateLimit({
    key: `partner:ip:${ip}`,
    limit: 10,
    windowSeconds: 600,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Honeypot: a real visitor never fills this. Pretend success to bots.
  if (text(body.website)) return NextResponse.json({ ok: true });

  const firstName = text(body.firstName, 100);
  const lastName = text(body.lastName, 100);
  const email = text(body.email, 200);
  const institution = text(body.institution, 200);
  const enrollment = text(body.enrollment, 50);
  const notes = text(body.notes, 2000);
  const office = Array.isArray(body.office)
    ? body.office.filter(
        (o): o is string => typeof o === "string" && PARTNER_FORM.officeOptions.includes(o),
      )
    : [];

  if (!firstName || !lastName || !institution || !isEduEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  if (enrollment && !PARTNER_FORM.enrollmentOptions.includes(enrollment)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const form = new URLSearchParams();
  form.append(ENTRY.fullName, `${firstName} ${lastName}`);
  form.append(ENTRY.email, email);
  form.append(ENTRY.institution, institution);
  if (enrollment) form.append(ENTRY.enrollment, enrollment);
  if (notes) form.append(ENTRY.notes, notes);
  if (ENTRY.office) for (const o of office) form.append(ENTRY.office, o);

  if (!FORM_RESPONSE_URL) {
    console.error("partner form: GOOGLE_FORM_RESPONSE_URL is not set");
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }

  try {
    const res = await fetch(FORM_RESPONSE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    // Google answers 200 (or a redirect to the confirmation page) on success
    // and 400 when a required question is missing.
    if (res.status >= 400) {
      console.error("partner form: Google Form rejected the submission", res.status);
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("partner form: could not reach Google Forms", error);
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
