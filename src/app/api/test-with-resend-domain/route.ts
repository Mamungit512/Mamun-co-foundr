import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "RESEND_API_KEY not set",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log("📧 Testing with Resend's verified domain...");

    // Use Resend's onboarding email (always works, no verification needed)
    const result = await resend.emails.send({
      from: "Mamun Test <onboarding@resend.dev>",
      to: "mamun@mamuncofoundr.com",
      subject: "Test from Resend's Verified Domain",
      html: "<h1>Success!</h1><p>If you receive this, Resend API is working. The issue is domain verification.</p>",
    });

    console.log("✅ Result:", result);

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error.message,
        details: result.error,
      });
    }

    return NextResponse.json({
      success: true,
      emailId: result.data?.id,
      message:
        "Email sent using onboarding@resend.dev (Resend's verified domain)",
      note: "If this works but mamun@mamuncofoundr.com doesn't, you need to verify your domain",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
