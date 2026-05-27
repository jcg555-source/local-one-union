import "server-only";

const resendApiUrl = "https://api.resend.com/emails";
const developmentFromEmail = "onboarding@resend.dev";
// TODO: Switch to "Local One <noreply@localonesou.org>" after the Local One domain is verified in Resend.
const productionFromEmail = "Local One Security Union <onboarding@resend.dev>";

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

export function getWebsiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "https://localoneunion.org";

  if (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")) {
    return configuredUrl;
  }

  return `https://${configuredUrl}`;
}

function getResendFromEmail() {
  return process.env.NODE_ENV === "production"
    ? productionFromEmail
    : developmentFromEmail;
}

export async function sendResendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const runtimeLabel = process.env.VERCEL ? "vercel" : "localhost";

  if (process.env.NODE_ENV !== "production") {
    console.info("[Resend] email configuration check", {
      runtime: runtimeLabel,
      apiKeyLoaded: Boolean(apiKey),
      from: input.from ?? getResendFromEmail()
    });
  }

  if (!apiKey) {
    console.error("[Resend] RESEND_API_KEY is not configured", {
      runtime: runtimeLabel,
      apiKeyLoaded: false
    });
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: input.from ?? getResendFromEmail(),
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Resend] API request failed", {
      runtime: runtimeLabel,
      status: response.status,
      statusText: response.statusText,
      responseBody: errorBody,
      from: input.from ?? getResendFromEmail(),
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject
    });
    throw new Error(errorBody || "Resend request failed.");
  }

  return response.json();
}
