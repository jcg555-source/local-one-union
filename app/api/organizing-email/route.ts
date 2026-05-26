import { NextResponse } from "next/server";
import { getUnionContactEmail, sendResendEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      siteDescription?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim();
    const siteDescription = body.siteDescription?.trim();

    if (!name || !email || !siteDescription) {
      return NextResponse.json(
        { error: "Name, email, and site description are required." },
        { status: 400 }
      );
    }

    await sendResendEmail({
      to: getUnionContactEmail(),
      subject: `New Organizing Inquiry from ${name}`,
      replyTo: email,
      text:
        `A new organizing inquiry was submitted.\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `Site description:\n${siteDescription}`,
      html: `
        <h2>New Organizing Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Site description:</strong></p>
        <p>${siteDescription.replace(/\n/g, "<br />")}</p>
      `
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Organizing email route]", error);
    }

    return NextResponse.json(
      { error: "We could not send the organizing email right now." },
      { status: 500 }
    );
  }
}
