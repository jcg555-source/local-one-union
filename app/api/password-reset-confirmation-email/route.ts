import { NextResponse } from "next/server";
import { createPasswordResetConfirmationEmail } from "@/lib/email-templates";
import { sendResendEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
    };

    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const template = createPasswordResetConfirmationEmail();

    await sendResendEmail({
      to: email,
      subject: "Local One password reset requested",
      text: template.text,
      html: template.html
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Password reset confirmation email route]", error);
    }

    return NextResponse.json(
      { error: "We could not send the password reset confirmation right now." },
      { status: 500 }
    );
  }
}
