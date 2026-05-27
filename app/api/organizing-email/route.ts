import { NextResponse } from "next/server";
import {
  createOrganizingInquiryConfirmationEmail,
  createOrganizingNotificationEmail
} from "@/lib/email-templates";
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

    const adminTemplate = createOrganizingNotificationEmail({
      name,
      email,
      siteDescription
    });
    const confirmationTemplate = createOrganizingInquiryConfirmationEmail(name);

    await sendResendEmail({
      to: getUnionContactEmail(),
      subject: `New Organizing Inquiry from ${name}`,
      replyTo: email,
      text: adminTemplate.text,
      html: adminTemplate.html
    });

    await sendResendEmail({
      to: email,
      subject: "Local One received your organizing inquiry",
      text: confirmationTemplate.text,
      html: confirmationTemplate.html
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
