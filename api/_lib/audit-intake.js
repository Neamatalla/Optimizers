// Shared, platform-agnostic intake rules for the "Get a Free Audit" form —
// imported by both api/audit-request.js (the real Vercel function) and
// vite.config.ts's dev middleware, same reasoning as google-oauth.js and
// report-edit.js: none of this touches req/res, so one implementation
// serves both platforms.
//
// The whole point of this file is the hard one-audit-per-website limit. The
// audit is expensive (a `claude -p` run with live browser access, then a
// human review pass before it's sent), so it's offered exactly once per
// site — not once per week, not once per outcome. The email address is NOT
// limited: one person can request audits for several different sites.
// Enforcement is in TWO places on purpose:
//
//   1. A lookup here, before the insert, so the visitor gets a real
//      explanation instead of a database error.
//   2. A unique index on audit_requests.website_hostname
//      (supabase/schema.sql), which is what actually makes it airtight —
//      two submissions racing each other both pass the lookup, and the
//      loser's insert is rejected by Postgres. Callers turn that rejection
//      into the same 409 (see isUniqueViolation below).
//
// Changing normalizeHostname below means re-normalizing the stored
// website_hostname values too — the index is on the stored column, so a row
// written with different normalization than an existing one simply won't
// collide with it.

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

/**
 * lower + trim. What gets stored in audit_requests.email_normalized — kept
 * for lookups only, it's not part of the one-audit limit.
 */
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

// "Your role" on the form: who the report is written for. Same list as
// audit-worker/src/audience.ts (AUDIENCE_ROLES) and the form's ROLE_OPTIONS.
export const AUDIENCE_ROLES = ["store_owner", "media_buyer", "marketing_manager", "agency"];
export const ROLE_LABELS = { store_owner: "E-commerce store owner", media_buyer: "Media buyer", marketing_manager: "Marketing director / manager", agency: "Agency / consultant" };

/**
 * Inserts the request row, and if the table has no audience_role column yet
 * (the migration supabase/migrations/2026-10-14-3-add-audience-role.sql not run),
 * retries without it, so a missing migration costs the role, never the
 * visitor's submission. Same { data, error } shape as supabase-js.
 */
export async function insertAuditRequest(supabase, record) {
  const first = await supabase.from("audit_requests").insert(record).select().single();
  const err = first.error;
  // Missing column (PGRST204/42703), or a role the table check constraint
  // doesn't list yet (23514, e.g. "agency" before the 2026-10-15 migration).
  const text = `${err?.message || ""} ${err?.details || ""}`;
  const roleProblem = err && ["PGRST204", "42703", "23514"].includes(err.code) && text.includes("audience_role");
  if (!roleProblem) return first;
  console.warn(`[audit-request] audience_role rejected (${err.code}): run the latest supabase/migrations/*audience-role*.sql. Saved without the role.`);
  const { audience_role: _dropped, ...rest } = record;
  return supabase.from("audit_requests").insert(rest).select().single();
}

/**
 * The stored audience_role. Missing means null (a form from before the field
 * existed, still cached in someone's browser), so the worker writes the
 * default store-owner report. Anything else that isn't a known role is
 * invalid and the caller answers 400.
 */
export function parseAudienceRole(value) {
  if (value === undefined || value === null || value === "") return { role: null, invalid: false };
  return AUDIENCE_ROLES.includes(value) ? { role: value, invalid: false } : { role: null, invalid: true };
}

/**
 * What gets stored in audit_requests.store_platform: the platform name the
 * form got from Intellia's e-store check. It arrives from the browser, so
 * anything that isn't a short plain string becomes null rather than failing
 * the submission.
 */
export function cleanStorePlatform(value) {
  if (typeof value !== "string") return null;
  const platform = value.trim();
  return platform && platform.length <= 50 ? platform : null;
}

/**
 * Looks for an existing request for the same website. Returns null when
 * there's none, otherwise `{ reason: "website", row }`, so callers can
 * mention when the first one was submitted.
 *
 * Deliberately matches on ANY prior row regardless of status: a failed or
 * still-processing request has already consumed the one free audit for that
 * site. A genuine technical failure the operator wants to re-run is
 * handled operator-side (clear the row, or re-queue it — see
 * audit-worker's own scripts), not by letting the visitor submit again.
 */
export async function findExistingAuditRequest(supabase, { websiteHostname }) {
  if (!websiteHostname) return null;
  // .eq() rather than a hand-built .or()/filter string: the value comes
  // straight from the visitor, and .eq() values are encoded by supabase-js,
  // so they can't change the query's shape.
  const { data, error } = await supabase
    .from("audit_requests")
    .select("id, status, created_at")
    .eq("website_hostname", websiteHostname)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    // Surfaced to the caller rather than swallowed: failing open here
    // would let a duplicate through on a transient Supabase error. The
    // unique index would still catch it, but the visitor would get a
    // generic 500 instead of the real explanation.
    throw new Error(`Duplicate check failed on website_hostname: ${error.message}`);
  }
  return data ? { reason: "website", row: data } : null;
}

/**
 * Postgres unique-violation check for the race the pre-insert lookup can't
 * close. 23505 is the SQLSTATE for unique_violation; the constraint name in
 * the error message says it was the website_hostname index, so the message
 * the visitor gets is the same as the lookup path's.
 */
export function isUniqueViolation(error) {
  if (!error) return null;
  if (error.code !== "23505") return null;
  const detail = `${error.message || ""} ${error.details || ""}`;
  if (detail.includes("website_hostname")) return "website";
  return "unknown";
}

/** What the visitor actually reads. Same copy from both enforcement paths. */
export function duplicateMessage(reason) {
  if (reason === "website") {
    return "This website has already had its free audit. Each site gets one — get in touch if you'd like us to take another look.";
  }
  return "A free audit has already been requested for this website. Each site gets a single audit — get in touch and we'll help from there.";
}
