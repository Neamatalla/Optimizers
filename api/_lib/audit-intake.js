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
// Both normalizers below MUST stay in step with the backfill expressions in
// supabase/schema.sql — the indexes are on the stored columns, so a row
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

// Second internal recipient, deliberately NOT the reviewer. This is a
// heads-up only — "an audit is happening, here's who and what" — with none
// of the reviewer's operational detail (no tools, no GA4/GTM ids, no row id,
// no approve link). Kept as its own address and its own email rather than a
// second `to:` on the reviewer's, because the two serve different purposes
// and shouldn't grow into each other's shape over time.
//
// Real runs only. A test-mode submission notifies nobody internally, same as
// the reviewer notification.
export function auditHeadsUpEmail(env) {
  return (env && env.AUDIT_HEADSUP_EMAIL) || process.env.AUDIT_HEADSUP_EMAIL || "mohamed@neamatalla.com";
}

function escapeHtmlValue(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The heads-up email's subject + body. Two lines of substance on purpose:
 * who asked and for which site. One implementation so the Vercel function
 * and the dev middleware can't drift in wording (they each own their own
 * Resend call, as the rest of this repo already does).
 *
 * Both values are escaped: they're raw visitor input, and an unescaped
 * angle bracket in an address or URL would otherwise break the surrounding
 * markup in the recipient's client.
 */
export function buildHeadsUpEmail({ email, website }) {
  return {
    subject: `New Free Audit request — ${website}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #263328;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 18px;">
          Heads up — a free audit just came in and is being processed.
        </p>
        <p style="font-size: 14px; line-height: 1.9; margin: 0;">
          <b>Email:</b> ${escapeHtmlValue(email)}<br />
          <b>Website:</b> ${escapeHtmlValue(website)}
        </p>
      </div>
    `.trim(),
  };
}

// Test mode: a submission whose email AND website were both typed with a
// leading "-" — e.g. `-omar@optimizers.agency` + `-https://example.com`.
// It runs the real pipeline end to end, but publishes to a separate Storage
// bucket, emails the report straight to whoever was in the form (no
// internal review, no 2-day delay), and is exempt from the
// one-audit-per-site/email limit so the same site can be re-tested freely.
export const TEST_PREFIX = "-";

/**
 * Splits the test prefix off both fields. Returns the cleaned values plus
 * `isTest`, or `mismatch: true` when exactly one of the two carried the
 * prefix.
 *
 * Requiring BOTH is the safety property, not pedantry: if one prefixed
 * field were enough, a stray leading dash typed into the email box would
 * silently turn a real prospect's submission into a test run — skipping
 * review and mailing them an unreviewed report. A mismatch is therefore a
 * hard 400 rather than a guess in either direction.
 *
 * Everything downstream (validation, normalization, storage, dedupe) sees
 * only the cleaned values — the prefix exists purely as the trigger.
 */
export function parseTestPrefix({ email, website }) {
  const rawEmail = String(email || "").trim();
  const rawWebsite = String(website || "").trim();
  const emailPrefixed = rawEmail.startsWith(TEST_PREFIX);
  const websitePrefixed = rawWebsite.startsWith(TEST_PREFIX);

  if (emailPrefixed !== websitePrefixed) {
    return { isTest: false, mismatch: true, email: rawEmail, website: rawWebsite };
  }

  if (!emailPrefixed) {
    return { isTest: false, mismatch: false, email: rawEmail, website: rawWebsite };
  }

  return {
    isTest: true,
    mismatch: false,
    email: rawEmail.slice(TEST_PREFIX.length).trim(),
    website: rawWebsite.slice(TEST_PREFIX.length).trim(),
  };
}

/** What the visitor reads when only one of the two fields was prefixed. */
export const TEST_PREFIX_MISMATCH_MESSAGE =
  `Test mode needs the "${TEST_PREFIX}" prefix on both the website and the email, or on neither.`;

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
