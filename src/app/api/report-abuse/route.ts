import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      <p><strong>Name:</strong> ${reportedName ?? "unknown"}</p>
      <p><strong>User ID:</strong> ${reportedUserId}</p>
      <h3>Reason</h3>
      <p>${reason}</p>
      ${details ? `<h3>Additional Details</h3><p>${details}</p>` : ""}
      <h3>Reported By</h3>
      <p><strong>Name:</strong> ${reporterName}</p>
      <p><strong>Email:</strong> ${reporterEmail}</p>
      <p><strong>User ID:</strong> ${userId}</p>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data } = await resend.emails.send({
      from: "mamun@mamuncofoundr.com",
      to: ["mamun@mamuncofoundr.com"],
      subject: `Profile Report — ${reason}`,
      html,
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err }, { status: 500 });
  }
}
