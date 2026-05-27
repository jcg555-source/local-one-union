import { NextResponse } from "next/server";
import {
  plainTextHiringAlertTemplate,
  polishedHiringAlertTemplate
} from "@/lib/email-templates";
import { sendResendEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      siteName?: string;
    };

    const email = body.email?.trim();
    const siteName = body.siteName?.trim();

    if (!email || !siteName) {
      return NextResponse.json(
        { error: "Email and site name are required." },
        { status: 400 }
      );
    }

    await sendResendEmail({
      to: email,
      subject: `Local One hiring alerts for ${siteName}`,
      text: plainTextHiringAlertTemplate(siteName),
      html: polishedHiringAlertTemplate(siteName)
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Hiring alert email route]", error);
    }

    return NextResponse.json(
      { error: "We could not send the hiring alert confirmation right now." },
      { status: 500 }
    );
  }
}
