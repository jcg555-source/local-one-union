import "server-only";

const resendApiUrl = "https://api.resend.com/emails";
const defaultFromEmail = "Local One Security Union <onboarding@resend.dev>";

type SendEmailInput = {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export function getUnionContactEmail() {
  const unionContactEmail = process.env.UNION_CONTACT_EMAIL;

  if (!unionContactEmail) {
    throw new Error("UNION_CONTACT_EMAIL is not configured.");
  }

  return unionContactEmail;
}

export async function sendResendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: input.from ?? defaultFromEmail,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Resend request failed.");
  }

  return response.json();
}
