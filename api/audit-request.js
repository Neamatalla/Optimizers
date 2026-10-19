import {
  auditNotifyEmail,
  validateAuditForm,
  normalizeEmail,
  normalizeHostname,
  cleanStorePlatform,
  findExistingAuditRequest,
  isUniqueViolation,
  duplicateMessage,
  ROLE_LABELS,
  insertAuditRequest,
} from "./_lib/audit-intake.js";
import { verifyOwnership } from "./_lib/ownership-verification.js";
import { escapeHtml } from "./_lib/escape-html.js";

export default async function handler(req, res) {
  // Logs every outcome (status + error text only, no request data), so a
  // rejected submission shows up in the Vercel logs instead of vanishing.
  const originalJson = res.json.bind(res);
  res.json = body => {
    console.log(`[audit-request] ${res.statusCode}${body?.error ? ` ${body.error}` : ""}`);
    return originalJson(body);
  };

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
    const check = validateAuditForm(req.body);
    if (check.invalid) {
      return res.status(400).json(check.invalid);
    }
    const { isTest, email, website, tools, role, businessName, ga4MeasurementId, gtmContainerId, ga4OAuthData, gtmOAuthData, storePlatform } = check.form;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // One free audit per website, ever (the same email can request audits
    // for other sites). Checked here for a real explanation, enforced for
    // real by the unique index on website_hostname (see supabase/schema.sql)
    // — the insert below turns a lost race into the same 409.
    //
    // Test runs are exempt, in both places: skipped here, and the index
    // itself is partial (a "where is_test = false" clause), so re-testing the
    // same site never collides and never consumes that site's real audit.
    const emailNormalized = normalizeEmail(email);
    const websiteHostname = normalizeHostname(website);
    // Started before the duplicate check so its site scan (only run when
    // Google data was submitted) overlaps that lookup instead of adding to
    // it. Never rejects. See api/_lib/ownership-verification.js.
    const verificationPromise = verifyOwnership({ email, website, websiteHostname, ga4OAuthData, gtmOAuthData });
    if (!isTest) {
      const existing = await findExistingAuditRequest(supabase, { websiteHostname });
      if (existing) {
        return res.status(409).json({ error: duplicateMessage(existing.reason), duplicate: existing.reason });
      }
    }

    const verificationMethods = await verificationPromise;
    const { data: row, error: insertError } = await insertAuditRequest(supabase, {
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
        // Who the report is written for (audit-worker/src/audience.ts).
        audience_role: role,
        ga4_measurement_id: ga4MeasurementId ? String(ga4MeasurementId).trim().toUpperCase() : null,
        gtm_container_id: gtmContainerId ? String(gtmContainerId).trim().toUpperCase() : null,
        // Pre-fetched via the OAuth popup flow (api/oauth/google/callback.js),
        // already scoped to exactly what the visitor consented to — the
        // worker uses this directly as "live" data, no MCP exact-match
        // needed for these fields. null if the visitor used the manual flow.
        ga4_oauth_data: ga4OAuthData ?? null,
        gtm_oauth_data: gtmOAuthData ?? null,
        // Which ownership checks passed; is_verified is derived from this by
        // Postgres and can't be written directly. Recorded only, nothing
        // acts on it yet.
        verification_methods: verificationMethods,
        // The platform Intellia's e-store check found on the form's website
        // step (api/_lib/detect-tracking.js's checkStore), as the browser
        // reports it: not re-checked here. null when Intellia was
        // unavailable or not configured at the time.
        store_platform: cleanStorePlatform(storePlatform),
        status: "pending",
      });

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
                  <td style="padding: 12px; border: 1px solid #ddd;">${escapeHtml(website)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${escapeHtml(email)}</td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Tools selected</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${tools.join(", ") || "None"}</td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Role</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${role ? ROLE_LABELS[role] : "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Business name</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${businessName ? escapeHtml(businessName) : "—"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">GA4 ID provided</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${ga4MeasurementId ? escapeHtml(ga4MeasurementId) : "—"}</td>
                </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">GTM ID provided</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${gtmContainerId ? escapeHtml(gtmContainerId) : "—"}</td>
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
    }

    // Identical for test and real runs — the response shouldn't reveal
    // test mode either.
    return res.status(200).json({
      success: true,
      message: "Audit request received. Check your inbox shortly.",
    });
  } catch (err) {
    console.error("audit-request serverless function error:", err);
    return res.status(500).json({ success: false, error: err.message || "An unexpected error occurred." });
  }
}
