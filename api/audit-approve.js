import { approveAuditRequest } from "./_lib/audit-approve.js";

// Clicked straight out of the reviewer's internal-review email (see
// audit-worker/src/email.ts's sendInternalReviewEmail) — GET only, since an
// email client can't send a custom method or header. Auth is the per-row
// approval_token in the query string itself, not REPORT_EDIT_API_KEY.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(405).send("<p>Method not allowed.</p>");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    console.error("SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(500).send("<p>Approval service is not configured.</p>");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  const id = String(req.query?.id || "").trim();
  const token = String(req.query?.token || "").trim();
  const result = await approveAuditRequest({ supabase, id, token });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(result.status).send(result.html);
}
