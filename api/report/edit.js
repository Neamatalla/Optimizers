import { isAuthorized, getReport, updateFinding } from "../_lib/report-edit.js";
import { log, setLogContext, withLog } from "../_lib/log.js";

// Authenticated by REPORT_EDIT_API_KEY — a credential dedicated to this
// endpoint, separate from SUPABASE_SECRET_KEY, so report-editing access can
// be rotated/revoked without touching full Supabase service-role access.
//
//   GET   ?slug=<slug>                       the report's rows, each finding with its id
//   PATCH { slug, findingId, changes }       changes one finding (technical, business,
//                                            ar, action, protect, status)
//
// api/audit-report.js caches for 60s, so an edit shows on the page within a minute.
async function handler(req, res) {
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
    log.error("SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set");
    return res.status(500).json({ error: "Report-edit service is not configured." });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  if (req.method === "GET") {
    const slug = String(req.query?.slug || "").trim();
    setLogContext({ slug });
    const result = await getReport({ supabase, bucket, slug });
    return res.status(result.status).json(result.body);
  }

  const { slug, findingId, changes } = req.body || {};
  setLogContext({ slug, findingId });
  const result = await updateFinding({ supabase, slug, findingId, changes });
  return res.status(result.status).json(result.body);
}

export default withLog("report-edit", handler);
