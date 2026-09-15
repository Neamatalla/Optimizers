import {
  auditNotifyEmail,
  auditHeadsUpEmail,
  buildHeadsUpEmail,
  parseTestPrefix,
  TEST_PREFIX_MISMATCH_MESSAGE,
  normalizeEmail,
  normalizeHostname,
  findExistingAuditRequest,
  isUniqueViolation,
  duplicateMessage,
} from "./_lib/audit-intake.js";

const VALID_TOOLS = new Set(["GA4", "GTM"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set");
    return res.status(500).json({ error: "Audit service is not configured." });
  }

  try {
    const { tools, website: rawWebsite, email: rawEmail, businessName, ga4MeasurementId, gtmContainerId, ga4OAuthData, gtmOAuthData } = req.body || {};

    // Strip the test-mode prefix (if any) FIRST, so everything below —
    // validation, normalization, dedupe, the stored row — works on the real
    // values. See api/_lib/audit-intake.js's parseTestPrefix for what test
    // mode actually changes.
    const parsed = parseTestPrefix({ email: rawEmail, website: rawWebsite });
    if (parsed.mismatch) {
      return res.status(400).json({ error: TEST_PREFIX_MISMATCH_MESSAGE });
    }
    const { isTest, email, website } = parsed;

    if (!Array.isArray(tools) || tools.some(tool => !VALID_TOOLS.has(tool))) {
      return res.status(400).json({ error: "Invalid tools selection." });
    }

    const missingFields = [];
    if (!String(website || "").trim()) missingFields.push("website");
    if (!String(email || "").trim()) missingFields.push("email");
    if (missingFields.length > 0) {
      return res.status(400).json({ error: "Website and email are required.", missingFields });
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

    // Required whenever the corresponding tool is selected — mirrors the
    // frontend's mandatory (not skippable) GA4/GTM access step.
    const ga4IdRegex = /^G-[A-Z0-9]{6,}$/i;
    if (tools.includes("GA4") && !ga4IdRegex.test(String(ga4MeasurementId || "").trim())) {
      return res.status(400).json({ error: "A valid GA4 measurement ID is required when GA4 is selected." });
    }
    const gtmIdRegex = /^GTM-[A-Z0-9]{4,}$/i;
    if (tools.includes("GTM") && !gtmIdRegex.test(String(gtmContainerId || "").trim())) {
      return res.status(400).json({ error: "A valid GTM container ID is required when GTM is selected." });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // One free audit per website and per email address, ever. Checked here
    // for a real explanation, enforced for real by the unique indexes on
    // these two columns (see supabase/schema.sql) — the insert below turns
    // a lost race into the same 409.
    //
    // Test runs are exempt, in both places: skipped here, and the indexes
    // themselves are partial (a "where is_test = false" clause), so re-testing the
    // same site never collides and never consumes that site's real audit.
    const emailNormalized = normalizeEmail(email);
    const websiteHostname = normalizeHostname(website);
    if (!isTest) {
      const existing = await findExistingAuditRequest(supabase, { emailNormalized, websiteHostname });
      if (existing) {
        return res.status(409).json({ error: duplicateMessage(existing.reason), duplicate: existing.reason });
      }
    }

    const { data: row, error: insertError } = await supabase
      .from("audit_requests")
      .insert({
        tools,
        website: String(website).trim(),
        email: String(email).trim(),
        email_normalized: emailNormalized,
        website_hostname: websiteHostname || null,
        // Read again by the worker long after intake — it decides which
        // Storage bucket the report goes to and whether the report is
        // reviewed or sent straight out (audit-worker/src/poll.ts).
        is_test: isTest,
        business_name: businessName ? String(businessName).trim() : null,
        ga4_measurement_id: ga4MeasurementId ? String(ga4MeasurementId).trim().toUpperCase() : null,
        gtm_container_id: gtmContainerId ? String(gtmContainerId).trim().toUpperCase() : null,
        // Pre-fetched via the OAuth popup flow (api/oauth/google/callback.js),
        // already scoped to exactly what the visitor consented to — the
        // worker uses this directly as "live" data, no MCP exact-match
        // needed for these fields. null if the visitor used the manual flow.
        ga4_oauth_data: ga4OAuthData ?? null,
        gtm_oauth_data: gtmOAuthData ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      // The race the pre-insert check above can't close: another submission
      // for the same email/site landed in between. Same 409, same copy.
      const duplicate = isUniqueViolation(insertError);
      if (duplicate) {
        return res.status(409).json({ error: duplicateMessage(duplicate), duplicate });
      }
      console.error("Supabase insert error:", JSON.stringify(insertError));
      return res.status(500).json({ error: "Could not queue audit request." });
    }

    // Internal notification is best-effort — a failure here shouldn't fail the
    // visitor's submission, since the request is already safely queued.
    // Skipped entirely for a test run: the point of test mode is exercising
    // the pipeline without pinging anyone internally.
    if (resendApiKey && !isTest) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "Optimizers <hello@optimizers.agency>",
          to: [auditNotifyEmail()],
          subject: `New Free Audit request — ${website}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">
                New Free Audit Request
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Website</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${website}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Tools selected</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${tools.join(", ") || "None"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Business name</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${businessName || "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">GA4 ID provided</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${ga4MeasurementId || "—"}</td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">GTM ID provided</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${gtmContainerId || "—"}</td>
                </tr>
              </table>
              <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                Queued as audit_requests.id = ${row.id}. The worker will pick it up and email the live audit page link to the requester.
              </p>
            </div>
          `.trim(),
        });
      } catch (notifyErr) {
        console.error("Internal notification email failed:", notifyErr);
      }

      // Separate heads-up to a second internal address — just who asked and
      // for which site, none of the reviewer's operational detail. Its own
      // try/catch and its own send so a failure on either one can't take
      // out the other, and both stay best-effort: the request is already
      // queued either way.
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        const headsUp = buildHeadsUpEmail({ email, website });
        await resend.emails.send({
          from: "Optimizers <hello@optimizers.agency>",
          to: [auditHeadsUpEmail()],
          subject: headsUp.subject,
          html: headsUp.html,
        });
      } catch (headsUpErr) {
        console.error("Heads-up notification email failed:", headsUpErr);
      }
    }

    return res.status(200).json({
      success: true,
      isTest,
      message: isTest
        ? `Test run queued for ${website}. The report will be emailed straight to ${email} — no review step.`
        : "Audit request received. Check your inbox shortly.",
    });
  } catch (err) {
    console.error("audit-request serverless function error:", err);
    return res.status(500).json({ success: false, error: err.message || "An unexpected error occurred." });
  }
}
