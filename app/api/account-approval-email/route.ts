import { NextResponse } from "next/server";
import { createAccountApprovalEmail } from "@/lib/email-templates";
import { sendResendEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
    };

    const email = body.email?.trim();
    const name = body.name?.trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const template = createAccountApprovalEmail(name || email);

    await sendResendEmail({
      to: email,
      subject: "Your Local One account has been approved",
      text: template.text,
      html: template.html
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Account approval email route]", error);
    }

    return NextResponse.json(
      { error: "We could not send the account approval email right now." },
      { status: 500 }
    );
  }
}
