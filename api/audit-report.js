import { getServableReport } from "./_lib/report-access.js";
import { log, setLogContext, withLog } from "./_lib/log.js";

// A client-facing slug (the site's domain, e.g. "tharaa-shop" — see
// audit-worker/src/supabase.ts's reportSlug()), not a bare UUID. The `:id`
// query-param name is unchanged from vercel.json's rewrite; only what it
// contains changed. Who may see which report (client vs. a signed ?preview=
// link) is decided in api/_lib/report-access.js.
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const slug = String(req.query?.id || "").trim();
  setLogContext({ slug });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
  const defaultBucket = process.env.AUDIT_REPORTS_BUCKET || "audit-reports";

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error("SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set");
    return res.status(500).send("Audit report service is not configured.");
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
      return res.status(status).send(body);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    return res.status(200).send(body);
  } catch (err) {
    log.error("audit-report serverless function error", { error: err });
    return res.status(500).send("Could not load audit report.");
  }
}

export default withLog("audit-report", handler);
