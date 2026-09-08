import { isAuthorized, getReportHtml, updateReportHtml } from "../_lib/report-edit.js";

// Authenticated by REPORT_EDIT_API_KEY — a credential dedicated to this
// endpoint, separate from SUPABASE_SECRET_KEY, so report-editing access can
// be rotated/revoked without touching full Supabase service-role access.
//
// Note: api/audit-report.js serves reports with `s-maxage=3600`, so a PATCH
// here can take up to an hour to show on the live URL through Vercel's edge
// cache even though Storage and report_pages update immediately.
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorized(req.headers["x-api-key"], process.env.REPORT_EDIT_API_KEY)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.AUDIT_REPORTS_BUCKET || "audit-reports";

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set");
    return res.status(500).json({ error: "Report-edit service is not configured." });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  if (req.method === "GET") {
    const slug = String(req.query?.slug || "").trim();
    const result = await getReportHtml({ supabase, bucket, slug });
    return res.status(result.status).json(result.body);
  }

  // PATCH — full-body replace of one report's stored HTML.
  const { slug, html } = req.body || {};
  const result = await updateReportHtml({ supabase, bucket, slug, html });
  return res.status(result.status).json(result.body);
}
