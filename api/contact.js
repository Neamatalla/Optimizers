const CALENDLY_API_PREFIX = "https://api.calendly.com/";

// Best-effort lookup of the booking details from Calendly (needs CALENDLY_API_TOKEN).
// Returns null on any problem so the email still goes out with the form data.
async function fetchCalendlyDetails(eventUri, inviteeUri) {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) return null;

  const get = async (uri) => {
    // Only call Calendly's own API; never fetch arbitrary client-supplied URLs.
    if (typeof uri !== "string" || !uri.startsWith(CALENDLY_API_PREFIX)) return null;
    const r = await fetch(uri, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    const body = await r.json();
    return body.resource || null;
  };

  try {
    const [event, invitee] = await Promise.all([get(eventUri), get(inviteeUri)]);
    if (!event && !invitee) return null;
    return {
      inviteeName: invitee?.name,
      inviteeEmail: invitee?.email,
      eventName: event?.name,
      startTime: event?.start_time,
    };
  } catch (err) {
    console.error("Calendly lookup failed:", err);
    return null;
  }
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check for API key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY environment variable is not set");
    return res.status(500).json({ error: "Email service is not configured." });
  }

  try {
    // Dynamic import to avoid top-level crash if package has issues
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const {
      firstName, email, website, traffic, monthlyConversions, challenge,
      source, calendlyEventUri, calendlyInviteeUri,
    } = req.body || {};
    const isCalendlyFallback = source === "calendly-fallback";
    const requiredFields = { firstName, email, website, traffic, monthlyConversions, challenge };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !String(value || "").trim())
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "All strategy session fields are required.",
        missingFields,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    try {
      const websiteUrl = new URL(String(website).trim());
      if (!websiteUrl.hostname.includes(".")) {
        return res.status(400).json({ error: "Please enter a valid website URL." });
      }
    } catch {
      return res.status(400).json({ error: "Please enter a valid website URL." });
    }

    let calendlyRows = "";
    if (isCalendlyFallback) {
      const details = await fetchCalendlyDetails(calendlyEventUri, calendlyInviteeUri);
      const rows = [
        ["Calendly Invitee Name", details?.inviteeName],
        ["Calendly Invitee Email", details?.inviteeEmail],
        ["Meeting", details?.eventName],
        ["Meeting Start (UTC)", details?.startTime],
        ["Calendly Event URI", calendlyEventUri],
        ["Calendly Invitee URI", calendlyInviteeUri],
      ].filter(([, value]) => value);
      calendlyRows = rows
        .map(([label, value]) => `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${escapeHtml(label)}</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${escapeHtml(value)}</td>
            </tr>`)
        .join("");
    }

    const { data, error } = await resend.emails.send({
      from: "Optimizers <hello@optimizers.agency>",
      to: ["mohamed@neamatalla.com"],
      subject: isCalendlyFallback
        ? `New Optimizers Booking (form email retry) from ${firstName}`
        : `New Optimizers Client Data Submission from ${firstName}`,
      html: `
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
              <td style="padding: 12px; border: 1px solid #ddd;">${website}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Number Traffic Per Month</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${traffic}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Conversion Volume</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${monthlyConversions}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Primary Objective</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${challenge}</td>
            </tr>${calendlyRows}
          </table>
          <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            This submission was received from the Optimizers booking form.
          </p>
        </div>
      `.trim(),
    });

    if (error) {
      console.error("Resend API Error:", JSON.stringify(error));
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Strategy session inquiry received successfully!",
      data,
    });
  } catch (err) {
    console.error("Serverless function error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An unexpected error occurred.",
    });
  }
}
