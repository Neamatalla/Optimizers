// Report-serving logic, used by api/audit-report.js. Kept apart from the
// handler since none of this touches req/res.
//
// A report is saved the moment the worker publishes it, days before the
// client is meant to see it, so serving can't just mean "the rows exist".
// A plain /audit-reports/<slug> request only gets the report once it's due
// to the client (see isClientVisible); the team opens it at any stage with
// a signed ?preview= link (see previewSignature), which the internal review
// email carries (audit-worker/src/email.ts).
import crypto from "node:crypto";
import { REPORT_SLUG_RE, isAuthorized } from "./report-edit.js";
import { REPORT_PAGE_COLUMNS, loadReportData } from "./report-data.js";
import { log } from "./log.js";

// HMAC of the slug under REPORT_PREVIEW_SECRET, so a preview link needs no
// stored token, works at every stage, and is separate from approval_token
// (a forwarded preview link can't approve a send). Must stay in step with
// audit-worker/src/email.ts's copy, which signs the links this verifies.
export function previewSignature(slug, secret) {
  return crypto.createHmac("sha256", secret).update(slug).digest("base64url");
}

// 'done' is when the client email goes out. A 'scheduled' row past its send
// time also counts: processDueSends emails the client BEFORE
// markSentToClient flips the status, and that flip can fail after the email
// already went out — either way the client may click a link that's theirs.
function isClientVisible(request, now = new Date()) {
  if (!request) return false;
  if (request.status === "done") return true;
  return request.status === "scheduled" && Boolean(request.scheduled_send_at) && new Date(request.scheduled_send_at) <= now;
}

export async function getServableReport({ supabase, slug, preview, defaultBucket, previewSecret }) {
  if (!REPORT_SLUG_RE.test(slug)) {
    return { status: 400, body: { error: "Invalid audit report link." } };
  }

  // Never valid when the secret is unset — previews fail closed, while a
  // client-visible report below still serves.
  const previewOk = Boolean(previewSecret) && isAuthorized(preview, previewSignature(slug, previewSecret));

  // report_pages links the slug to its audit_requests row, whose status
  // decides whether a plain request may see it.
  const { data: page, error: lookupError } = await supabase
    .from("report_pages")
    .select(REPORT_PAGE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (lookupError) {
    log.error("report_pages lookup error", { error: lookupError });
    // Can't tell whether it's due yet, so don't show it unless signed.
    if (!previewOk) return { status: 500, body: { error: "Could not load audit report." } };
  }

  // A slug with no report_pages row at all predates that table, and every
  // one of those was already sent — served as before rather than breaking a
  // link a client already has. Not yet due: the same 404 as a slug that
  // doesn't exist, so a guessed slug can't confirm a report is there.
  const legacy = !lookupError && !page;
  if (!previewOk && !legacy && !isClientVisible(page?.audit_requests)) {
    return { status: 404, body: { error: "Audit report not found." } };
  }

  return loadReportData({ supabase, slug, page, defaultBucket });
}
