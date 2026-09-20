import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/html";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit({
    key: `report-abuse:${userId}`,
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit);
  }

  try {
    const { reportedUserId, reportedName, reason, details } = await req.json();

    const client = await clerkClient();
    const reporter = await client.users.getUser(userId);
    const reporterEmail =
      reporter.emailAddresses.find((e) => e.id === reporter.primaryEmailAddressId)
        ?.emailAddress ?? "unknown";
    const reporterName =
      [reporter.firstName, reporter.lastName].filter(Boolean).join(" ") || "unknown";

    const html = `
      <h2>Profile Report</h2>
      <h3>Reported Profile</h3>
      <p><strong>Name:</strong> ${escapeHtml(reportedName ?? "unknown")}</p>
      <p><strong>User ID:</strong> ${escapeHtml(reportedUserId)}</p>
      <h3>Reason</h3>
      <p>${escapeHtml(reason)}</p>
      ${details ? `<h3>Additional Details</h3><p>${escapeHtml(details)}</p>` : ""}
      <h3>Reported By</h3>
      <p><strong>Name:</strong> ${escapeHtml(reporterName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(reporterEmail)}</p>
      <p><strong>User ID:</strong> ${escapeHtml(userId)}</p>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "mamun@mamuncofoundr.com",
      to: ["mamun@mamuncofoundr.com"],
      subject: `Profile Report — ${reason}`,
      html,
    });

    if (error) {
      console.error("Error sending report-abuse email:", error);
      return NextResponse.json(
        { error: "Failed to send report" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error in report-abuse API:", err);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 },
    );
  }
}
