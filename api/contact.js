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

    const { firstName, email, website, monthlyConversions, challenge } = req.body || {};

    if (!firstName || !email) {
      return res.status(400).json({ error: "First name and email are required." });
    }

    const { data, error } = await resend.emails.send({
      from: "Optimizers <onboarding@resend.dev>",
      to: ["mohamed@neamatalla.com"],
      subject: `New Optimizers Client Data Submission from ${firstName}`,
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
              <td style="padding: 12px; border: 1px solid #ddd;">${website || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Conversion Volume</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${monthlyConversions || "N/A"}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Primary Objective</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${challenge || "N/A"}</td>
            </tr>
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
