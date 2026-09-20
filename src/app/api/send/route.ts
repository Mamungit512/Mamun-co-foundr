import { NextResponse, NextRequest } from "next/server";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/html";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

// Public by design — this is the /contact-us marketing page's form, meant for
// anonymous visitors (see the public-route entry in src/middleware.ts). It is
// unauthenticated on purpose, so it leans on input validation, HTML escaping,
// and rate limiting instead of a session check.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimit = await checkRateLimit({
    key: `send:ip:${ip}`,
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { firstName, lastName, email, message, helpTopics, heardAboutUs } =
      await req.json();

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return NextResponse.json(
        { error: "firstName, lastName, email, and message are required" },
        { status: 400 },
      );
    }

    const helpTopicsList = Array.isArray(helpTopics) ? helpTopics : [];
    const heardAboutUsList = Array.isArray(heardAboutUs) ? heardAboutUs : [];

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message)}</p>
      <p><strong>Help Topics:</strong> ${escapeHtml(helpTopicsList.join(", "))}</p>
      <p><strong>Heard About Us:</strong> ${escapeHtml(heardAboutUsList.join(", "))}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: "mamun@mamuncofoundr.com",
      to: ["mamun@mamuncofoundr.com"],
      subject: "Contact Us Form Submission",
      html: htmlContent,
    });

    if (error) {
      console.error("Error sending contact form email:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error in send API:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
