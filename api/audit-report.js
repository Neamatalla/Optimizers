import { getServableReport } from "./_lib/report-access.js";
import { log, setLogContext, withLog } from "./_lib/log.js";

// The data behind one report page. /audit-reports/<slug> is a static page
// (audit-report.html, src/audit-report/main.ts) that fetches
// /api/audit-report?slug=<slug>[&preview=<sig>] and renders the result in
// the browser. The slug is the site's domain, e.g. "tharaa-shop" (see
// audit-worker/src/supabase.ts's reportSlug()). Who may see which report
// (client vs. a signed ?preview= link) is decided in
// api/_lib/report-access.js.
//
// 200 bodies: { request, report, findings } (the rows), or { legacyHtml } for
// an old report still stored as one HTML file. Errors: { error }.
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = String(req.query?.slug || req.query?.id || "").trim();
  setLogContext({ slug });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
  const defaultBucket = process.env.AUDIT_REPORTS_BUCKET || "audit-reports";

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error("SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set");
    return res.status(500).json({ error: "Audit report service is not configured." });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { status, body } = await getServableReport({
      supabase,
      slug,
      preview: req.query?.preview,
      defaultBucket,
      previewSecret: process.env.REPORT_PREVIEW_SECRET,
    });
    if (status !== 200) {
      return res.status(status).json(body);
    }

    // Short, so an edit made through api/report/edit.js shows within a minute.
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    return res.status(200).json(body);
  } catch (err) {
    log.error("audit-report serverless function error", { error: err });
    return res.status(500).json({ error: "Could not load audit report." });
  }
}

export default withLog("audit-report", handler);
