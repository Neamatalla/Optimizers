import { Resend } from "resend";

const TO_EMAIL = "omar@optimizers.agency";

const sampleFormData = {
  traffic: process.env.TEST_TRAFFIC || "100k-200k Visitors",
  conversionVolume: process.env.TEST_CONVERSIONS || "From 100 to 1K",
  primaryObjective: process.env.TEST_OBJECTIVE || "Online Sales",
  customObjective: process.env.TEST_CUSTOM_OBJECTIVE || "",
  website: process.env.TEST_WEBSITE || "https://example-store.com",
  firstName: process.env.TEST_FIRST_NAME || "Test Lead",
  email: process.env.TEST_EMAIL || "test.lead@example.com",
};

function normalizeWebsiteUrl(url) {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function buildContactPayload(formData) {
  return {
    firstName: formData.firstName,
    email: formData.email,
    website: normalizeWebsiteUrl(formData.website),
    traffic: formData.traffic,
    monthlyConversions: formData.conversionVolume,
    challenge:
      formData.primaryObjective === "Other"
        ? formData.customObjective
        : formData.primaryObjective,
  };
}

function buildEmailHtml({
  firstName,
  email,
  website,
  traffic,
  monthlyConversions,
  challenge,
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">First Name</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${firstName}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Website</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${website || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Number Traffic Per Month</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${traffic || "N/A"}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Conversion Volume</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${monthlyConversions || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Primary Objective</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${challenge || "N/A"}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
        This test submission mirrors the Optimizers booking form payload.
      </p>
    </div>
  `.trim();
}

async function main() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send the test email.");
  }

  const payload = buildContactPayload(sampleFormData);
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: "Optimizers <onboarding@resend.dev>",
    to: [TO_EMAIL],
    subject: `Test Optimizers Client Data Submission from ${payload.firstName}`,
    html: buildEmailHtml(payload),
  });

  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }

  console.log(`Test contact email sent to ${TO_EMAIL}.`);
  console.log(JSON.stringify({ id: data?.id }, null, 2));
}

main().catch((error) => {
  console.error("Failed to send test contact email:");
  console.error(error.message || error);
  process.exit(1);
});
