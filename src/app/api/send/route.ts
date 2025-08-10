import { NextResponse, NextRequest } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { firstName, lastName, email, message, helpTopics, heardAboutUs } =
      await req.json();

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <p><strong>Help Topics:</strong> ${helpTopics?.join(", ")}</p>
      <p><strong>Heard About Us:</strong> ${heardAboutUs?.join(", ")}</p>
    `;

    const { data } = await resend.emails.send({
      from: "mamun@mamuncofoundr.com",
      to: ["mamun@mamuncofoundr.com"],
      subject: "Contact Us Form Submission",
      html: htmlContent,
    });
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err });
  }
}
