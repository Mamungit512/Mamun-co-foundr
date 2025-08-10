import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data } = await resend.emails.send({
      from: "mamun@mamuncofoundr.com",
      to: ["mamun@mamuncofoundr.com"],
      subject: "Contact Us Form Submission",
      html: "<h1>Hello this is a test</h1>",
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err });
  }
}
