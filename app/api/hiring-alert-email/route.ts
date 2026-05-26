import { NextResponse } from "next/server";
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
      text:
        `You are signed up for Local One hiring alerts for ${siteName}.\n\n` +
        `We will reach out when this employer is hiring.`,
      html: `
        <h2>Hiring Alert Confirmation</h2>
        <p>You are signed up for Local One hiring alerts for <strong>${siteName}</strong>.</p>
        <p>We will reach out when this employer is hiring.</p>
      `
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
