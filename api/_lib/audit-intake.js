// Shared, platform-agnostic intake rules for the "Get a Free Audit" form —
// imported by both api/audit-request.js (the real Vercel function) and
// vite.config.ts's dev middleware, same reasoning as google-oauth.js and
// report-edit.js: none of this touches req/res, so one implementation
// serves both platforms.
//
// The whole point of this file is the hard one-audit-per-website and
// one-audit-per-email limit. The audit is expensive (a `claude -p` run with
// live browser access, then a human review pass before it's sent), so it's
// offered exactly once per site and once per email address — not once per
// week, not once per outcome. Enforcement is in TWO places on purpose:
//
//   1. A lookup here, before the insert, so the visitor gets a real
//      explanation instead of a database error.
//   2. Unique indexes on audit_requests.email_normalized and
//      .website_hostname (supabase/schema.sql), which is what actually
//      makes it airtight — two submissions racing each other both pass the
//      lookup, and the loser's insert is rejected by Postgres. Callers turn
//      that rejection into the same 409 (see isUniqueViolation below).
//
// Changing either normalizer below means re-normalizing the stored
// email_normalized/website_hostname values too — the indexes are on the
// stored columns, so a row written with different normalization than an
// existing one simply won't collide with it.

// Who gets told about a new audit request. This is the audit REVIEWER —
// the person who later reviews the finished report and clicks the approve
// link — not the general contact/book-a-meeting inbox (api/contact.js has
// its own recipient, deliberately different). Same env var and same default
// the worker uses for the review email (audit-worker/src/poll.ts's
// REVIEWER_EMAIL), so the "new request" notification and the "report ready
// for review" email can't drift to different people.
//
// Takes an optional env bag because Vite's dev middleware reads .env through
// loadEnv() rather than process.env.
export function auditNotifyEmail(env) {
  return (env && env.AUDIT_REVIEWER_EMAIL) || process.env.AUDIT_REVIEWER_EMAIL || "omar@optimizers.agency";
}

// Test mode (dash prefix on both fields + an @optimizers.agency email)
// lives in its own dependency-free module so the form can run the exact
// same rule client-side; re-exported here for the server callers.
export { TEST_PREFIX, TEST_EMAIL_DOMAIN, parseTestPrefix } from "./test-mode.js";

/** lower + trim. What gets stored in audit_requests.email_normalized. */
export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * Bare lowercase hostname — no scheme, no "www.", no port, no path. What
 * gets stored in audit_requests.website_hostname, and the actual identity
 * of "this website" for the one-audit-per-site limit: an audit of
 * https://www.example.com/collections/all is an audit of example.com, so a
 * second submission typed as http://example.com is the same site and gets
 * rejected.
 *
 * Returns "" when the input isn't parseable as a URL at all — callers
 * validate the URL separately and reject before reaching this, so an empty
 * string here means "don't try to dedupe on it" rather than a valid key.
 */
export function normalizeHostname(website) {
  const raw = String(website || "").trim();
  if (!raw) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export { isBlockedAuditDomain, BLOCKED_DOMAIN_MESSAGE } from "./blocked-domains.js";

/**
 * Looks for an existing request from the same email or the same website.
 * Returns null when there's none, otherwise which key matched (email wins
 * when both do — it's the more personal, less ambiguous thing to tell
 * someone) plus the row, so callers can mention when the first one was
 * submitted.
 *
 * Deliberately matches on ANY prior row regardless of status: a failed or
 * still-processing request has already consumed the one free audit for that
 * site/address. A genuine technical failure the operator wants to re-run is
 * handled operator-side (clear the row, or re-queue it — see
 * audit-worker's own scripts), not by letting the visitor submit again.
 */
export async function findExistingAuditRequest(supabase, { emailNormalized, websiteHostname }) {
  // Two separate .eq() lookups rather than one .or("a.eq.X,b.eq.Y") — that
  // filter string is built by string concatenation, and these values come
  // straight from the visitor. An email like "a,status.eq.pending@x.com"
  // passes the format regex upstream (no spaces, no second @) and would
  // then be parsed as extra filter clauses. .eq() values are encoded by
  // supabase-js instead, so they can't change the query's shape.
  async function findBy(column, value) {
    if (!value) return null;
    const { data, error } = await supabase
      .from("audit_requests")
      .select("id, status, created_at")
      .eq(column, value)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      // Surfaced to the caller rather than swallowed: failing open here
      // would let a duplicate through on a transient Supabase error. The
      // unique indexes would still catch it, but the visitor would get a
      // generic 500 instead of the real explanation.
      throw new Error(`Duplicate check failed on ${column}: ${error.message}`);
    }
    return data ?? null;
  }

  const byEmail = await findBy("email_normalized", emailNormalized);
  if (byEmail) return { reason: "email", row: byEmail };

  const bySite = await findBy("website_hostname", websiteHostname);
  if (bySite) return { reason: "website", row: bySite };

  return null;
}

/**
 * Postgres unique-violation check for the race the pre-insert lookup can't
 * close. 23505 is the SQLSTATE for unique_violation; the constraint name in
 * the error message says which of the two indexes rejected it, so the
 * message the visitor gets is the same either way as the lookup path's.
 */
export function isUniqueViolation(error) {
  if (!error) return null;
  if (error.code !== "23505") return null;
  const detail = `${error.message || ""} ${error.details || ""}`;
  if (detail.includes("email_normalized")) return "email";
  if (detail.includes("website_hostname")) return "website";
  return "unknown";
}

/** What the visitor actually reads. Same copy from both enforcement paths. */
export function duplicateMessage(reason) {
  if (reason === "email") {
    return "This email address has already been used for a free audit. Each address gets one — reply to that audit's email if you need anything else, or reach out and we'll take it from there.";
  }
  if (reason === "website") {
    return "This website has already had its free audit. Each site gets one — get in touch if you'd like us to take another look.";
  }
  return "A free audit has already been requested for this website or email address. Each one gets a single audit — get in touch and we'll help from there.";
}
