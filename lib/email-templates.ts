import { getUnionContactEmail, getWebsiteUrl } from "@/lib/resend";

type EmailTemplateResult = {
  html: string;
  text: string;
};

type BrandEmailInput = {
  eyebrow: string;
  title: string;
  intro: string;
  confirmation: string;
  nextSteps: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderParagraphs(lines: string[]) {
  return lines
    .map(
      (line) =>
        `<p style="margin:0 0 14px;color:#425466;font-size:16px;line-height:1.7;">${escapeHtml(line)}</p>`
    )
    .join("");
}

function renderNextSteps(steps: string[]) {
  return steps
    .map(
      (step) =>
        `<tr><td style="padding:0 0 12px 0;vertical-align:top;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:28px;vertical-align:top;">
                <div style="width:16px;height:16px;border-radius:999px;background:#d4af37;margin-top:5px;"></div>
              </td>
              <td style="color:#243b53;font-size:15px;line-height:1.7;">
                ${escapeHtml(step)}
              </td>
            </tr>
          </table>
        </td></tr>`
    )
    .join("");
}

function renderBrandEmail(input: BrandEmailInput): EmailTemplateResult {
  const websiteUrl = getWebsiteUrl();
  const contactEmail = getUnionContactEmail();
  const logoUrl = `${websiteUrl}/images/local1-logo.png`;
  const ctaHtml =
    input.ctaLabel && input.ctaUrl
      ? `
        <div style="margin:28px 0 0;text-align:center;">
          <a
            href="${input.ctaUrl}"
            style="display:inline-block;background:#d4af37;color:#102a43;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;"
          >
            ${escapeHtml(input.ctaLabel)}
          </a>
        </div>
      `
      : "";
  const ctaText =
    input.ctaLabel && input.ctaUrl ? `\n\n${input.ctaLabel}: ${input.ctaUrl}` : "";

  return {
    html: `
      <div style="margin:0;padding:24px 12px;background:#e9eef4;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;">
          <tr>
            <td style="background:#102a43;border-radius:26px 26px 0 0;padding:30px 24px 18px;text-align:center;">
              <img
                src="${logoUrl}"
                alt="Local One Security Union"
                width="88"
                height="88"
                style="display:block;margin:0 auto 16px;width:88px;height:88px;object-fit:contain;"
              />
              <div style="display:inline-block;padding:7px 14px;border-radius:999px;background:rgba(212,175,55,0.16);border:1px solid rgba(212,175,55,0.45);color:#f0c75e;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
                Local One Security Union
              </div>
              <h1 style="margin:18px 0 0;color:#ffffff;font-size:30px;line-height:1.15;font-weight:700;">
                ${escapeHtml(input.title)}
              </h1>
              <p style="margin:12px auto 0;color:#d9e2ec;font-size:15px;line-height:1.7;max-width:520px;">
                ${escapeHtml(input.intro)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:5px;background:#d4af37;"></td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:32px 24px;">
              <p style="margin:0 0 10px;color:#b08900;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">
                ${escapeHtml(input.eyebrow)}
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#f8fafc;border:1px solid #d9e2ec;border-radius:20px;padding:20px 18px;">
                    <p style="margin:0;color:#102a43;font-size:18px;line-height:1.7;font-weight:700;">
                      ${escapeHtml(input.confirmation)}
                    </p>
                  </td>
                </tr>
              </table>
              ${renderParagraphs(
                input.nextSteps.length > 0
                  ? ["Please review the next steps below."]
                  : []
              )}
              ${
                input.nextSteps.length > 0
                  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
                      ${renderNextSteps(input.nextSteps)}
                    </table>`
                  : ""
              }
              ${ctaHtml}
              ${
                input.footerNote
                  ? `<p style="margin:24px 0 0;color:#7b8794;font-size:13px;line-height:1.6;">${escapeHtml(input.footerNote)}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #d9e2ec;border-radius:0 0 26px 26px;padding:24px;text-align:center;">
              <p style="margin:0;color:#102a43;font-size:14px;font-weight:700;">Local One Security Union</p>
              <p style="margin:8px 0 0;color:#52606d;font-size:13px;line-height:1.7;">
                <a href="${websiteUrl}" style="color:#102a43;text-decoration:none;">${websiteUrl}</a>
                <span style="color:#9fb3c8;"> • </span>
                <a href="mailto:${contactEmail}" style="color:#102a43;text-decoration:none;">${contactEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </div>
    `,
    text:
      `Local One Security Union\n` +
      `${input.title}\n\n` +
      `${input.intro}\n\n` +
      `${input.confirmation}\n\n` +
      (input.nextSteps.length > 0
        ? `Next steps:\n${input.nextSteps.map((step) => `- ${step}`).join("\n")}\n`
        : "") +
      `${ctaText}\n\n` +
      `${input.footerNote ? `${input.footerNote}\n\n` : ""}` +
      `Website: ${websiteUrl}\n` +
      `Contact: ${contactEmail}`
  };
}

export function createHiringAlertConfirmationEmail(siteName: string): EmailTemplateResult {
  return renderBrandEmail({
    eyebrow: "Hiring Alert Confirmation",
    title: "You are confirmed for hiring updates",
    intro: "Local One has added your email to the hiring alert list you requested.",
    confirmation: `You are now signed up to receive hiring alerts for ${siteName}.`,
    nextSteps: [
      "We will email you when this employer begins hiring or posting new opportunities.",
      "Keep an eye on your inbox for future updates from Local One Security Union.",
      "You can continue exploring public site pages and contract information on our website."
    ],
    ctaLabel: "View Public Sites",
    ctaUrl: `${getWebsiteUrl()}/sites-map`,
    footerNote: "If you did not request this alert, you can ignore this message."
  });
}

export function createOrganizingInquiryConfirmationEmail(name: string): EmailTemplateResult {
  return renderBrandEmail({
    eyebrow: "Organizing Inquiry Received",
    title: "Your message has been received",
    intro: "Thank you for reaching out to Local One about organizing with us.",
    confirmation: `Thank you, ${name}. Our team has received your inquiry and will review it carefully.`,
    nextSteps: [
      "A Local One representative will review the details you submitted about your site and workforce.",
      "If your group is a strong fit, we will follow up using the email address you provided.",
      "In the meantime, you can learn more about our public sites, leadership, and latest updates online."
    ],
    ctaLabel: "Visit Local One",
    ctaUrl: getWebsiteUrl(),
    footerNote:
      "We appreciate your interest in building stronger standards, representation, and workplace protection."
  });
}

export function createOrganizingNotificationEmail(input: {
  name: string;
  email: string;
  siteDescription: string;
}): EmailTemplateResult {
  return renderBrandEmail({
    eyebrow: "New Organizing Inquiry",
    title: "A new organizing request was submitted",
    intro: "Local One received a new inquiry from workers interested in organizing.",
    confirmation: "A new public organizing inquiry is ready for review.",
    nextSteps: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Site description: ${input.siteDescription}`
    ],
    footerNote: "Reply directly to the sender if immediate follow-up is needed."
  });
}

export function createAccountApprovalEmail(nameOrEmail: string): EmailTemplateResult {
  return renderBrandEmail({
    eyebrow: "Account Approved",
    title: "Your Local One account is now approved",
    intro: "Your member access request has been reviewed and approved by Local One.",
    confirmation: `Hello ${nameOrEmail}, you can now sign in and access approved member resources.`,
    nextSteps: [
      "Use the Local One login page to access the member portal.",
      "Once signed in, you will be able to view internal resources, member announcements, and private documents.",
      "If you have trouble signing in, contact Local One using the information below."
    ],
    ctaLabel: "Go To Member Login",
    ctaUrl: `${getWebsiteUrl()}/login`
  });
}

export function createPasswordResetConfirmationEmail(): EmailTemplateResult {
  return renderBrandEmail({
    eyebrow: "Password Reset",
    title: "Password reset instructions are on the way",
    intro: "A password reset request was received for your Local One account.",
    confirmation: "Supabase has sent a secure password reset link to your email address.",
    nextSteps: [
      "Open the reset email and use the secure link to choose a new password.",
      "After updating your password, return to Local One and sign in with your new credentials.",
      "If you did not request this change, you can ignore the reset email and contact Local One if you have concerns."
    ],
    ctaLabel: "Go To Login",
    ctaUrl: `${getWebsiteUrl()}/login`
  });
}
