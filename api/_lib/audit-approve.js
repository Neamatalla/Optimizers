// Shared, platform-agnostic "approve this audit for delayed client send"
// logic. Imported by both api/audit-approve.js (the real Vercel function)
// and vite.config.ts's dev middleware — same reasoning as report-edit.js and
// google-oauth.js: none of this touches req/res, so one implementation
// serves both platforms.
import crypto from "node:crypto";

const APPROVAL_DELAY_MS = 2 * 24 * 60 * 60 * 1000;

// Constant-time compare — same reasoning as report-edit.js's isAuthorized:
// the token IS the credential here (clicked straight out of an email, no
// separate login), so it shouldn't be narrowable via a timing side-channel.
function tokenMatches(provided, expected) {
  if (typeof provided !== "string" || typeof expected !== "string" || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function page(title, message) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:Arial,sans-serif;max-width:520px;margin:80px auto;color:#263328;line-height:1.6;padding:0 20px}
h1{font-size:20px;border-bottom:2px solid #6ae499;padding-bottom:10px}</style></head>
<body><h1>${escapeHtml(title)}</h1><p>${message}</p></body></html>`;
}

// GET-only: the row's id + a per-row random approval_token in the query
// string are the whole auth story, since this link is clicked straight out
// of the reviewer's inbox (no custom header possible from an email client).
export async function approveAuditRequest({ supabase, id, token }) {
  if (!id || !token) {
    return { status: 400, html: page("Invalid link", "Missing id or token.") };
  }

  const { data: row, error: lookupError } = await supabase
    .from("audit_requests")
    .select("id, email, website, business_name, status, approval_token, scheduled_send_at, sent_to_client_at")
    .eq("id", id)
    .maybeSingle();

  if (lookupError) {
    console.error("audit_requests lookup error:", lookupError);
    return { status: 500, html: page("Something went wrong", "Could not look up this audit. Try again shortly.") };
  }
  if (!row) {
    return { status: 404, html: page("Not found", "No audit request matches this link.") };
  }

  if (row.status === "scheduled" || row.status === "done") {
    const due = row.scheduled_send_at ? new Date(row.scheduled_send_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "an earlier approval";
    const detail = row.status === "done"
      ? `Already sent to ${escapeHtml(row.email)}.`
      : `Already approved — scheduled to send to ${escapeHtml(row.email)} on ${escapeHtml(due)}.`;
    return { status: 200, html: page("Already handled", detail) };
  }

  if (row.status !== "awaiting_approval") {
    return { status: 409, html: page("Not ready", `This audit is currently "${escapeHtml(row.status)}", not awaiting approval.`) };
  }

  if (!tokenMatches(token, row.approval_token)) {
    return { status: 401, html: page("Unauthorized", "This approval link is invalid.") };
  }

  const now = new Date();
  const scheduledSendAt = new Date(now.getTime() + APPROVAL_DELAY_MS);

  const { error: updateError } = await supabase
    .from("audit_requests")
    .update({ status: "scheduled", approved_at: now.toISOString(), scheduled_send_at: scheduledSendAt.toISOString() })
    .eq("id", id)
    .eq("status", "awaiting_approval"); // guards a double-click race the same way claimNextPendingRequest does

  if (updateError) {
    console.error("audit_requests approve update error:", updateError);
    return { status: 500, html: page("Something went wrong", "Could not record the approval. Try again shortly.") };
  }

  const dueStr = scheduledSendAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  return {
    status: 200,
    html: page(
      "Approved",
      `Scheduled to send to <b>${escapeHtml(row.email)}</b> (${escapeHtml(row.website)}) on <b>${escapeHtml(dueStr)}</b>. ` +
      `You can still edit the live report any time before then via the report-edit API.`,
    ),
  };
}
