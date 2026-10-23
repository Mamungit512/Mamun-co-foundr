import { NextResponse, type NextRequest } from "next/server";

import { isEduEmail, PARTNER_FORM } from "@/content/site/partner";

// /partner demo requests → the Google Form drop box (spec §11.2), posted
// server-side so the entry ids never reach client JS. Responses land in the
// form's linked Google Sheet.
//
// Form: https://forms.gle/fTh69NAa1pAiiWvP7 — if the form is ever recreated,
// the entry ids below change and this breaks silently. Re-read them from the
// form's page source.
const FORM_RESPONSE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdb-WToBKCUShtZmUxv0qfLT6mC0cWWmww2gcGW9UPeV_rCvQ/formResponse";

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

// Best-effort rate limit: per server instance, 5 requests per 10 minutes per IP.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

const text = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

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
