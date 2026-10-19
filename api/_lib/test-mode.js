// Test mode for the "Get a Free Audit" form — dependency-free so the same
// rule runs in the browser (src/imports/GetFreeAudit.tsx) and on the server
// (api/audit-request.js, via audit-intake.js), same reasoning as
// blocked-domains.js.
//
// A submission is a test run only when the email AND the website were both
// typed with a leading "-" AND the email is an @optimizers.agency address —
// e.g. `-omar@optimizers.agency` + `-https://example.com`. It runs the real
// pipeline end to end, but publishes to a separate Storage bucket, emails the
// report straight to whoever was in the form (no internal review, no 2-day
// delay), and is exempt from the one-audit-per-site limit so the same
// site can be re-tested freely.
//
// Test mode is deliberately invisible from outside: any other use of the
// prefix (a non-team email, or only one field prefixed) is reported as a
// plain invalid field, never as "test mode needs X" — so the form never
// hints that the mode exists.
export const TEST_PREFIX = "-";
export const TEST_EMAIL_DOMAIN = "optimizers.agency";

const stripPrefix = (value) => value.slice(TEST_PREFIX.length).trim();

/**
 * Returns `{ isTest, invalidFields, email, website }`. On a test run the
 * prefix is stripped from both values; otherwise they come back trimmed but
 * untouched, with every prefixed field listed in `invalidFields`.
 *
 * Requiring BOTH fields is the safety property, not pedantry: if one
 * prefixed field were enough, a stray leading dash would silently turn a
 * submission into a test run — skipping review and mailing out an
 * unreviewed report. Everything downstream (validation, normalization,
 * storage, dedupe) sees only the cleaned values — the prefix exists purely
 * as the trigger.
 */
export function parseTestPrefix({ email, website }) {
  const rawEmail = String(email || "").trim();
  const rawWebsite = String(website || "").trim();
  const emailPrefixed = rawEmail.startsWith(TEST_PREFIX);
  const websitePrefixed = rawWebsite.startsWith(TEST_PREFIX);

  if (emailPrefixed && websitePrefixed) {
    const cleanEmail = stripPrefix(rawEmail);
    if (cleanEmail.toLowerCase().endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      return { isTest: true, invalidFields: [], email: cleanEmail, website: stripPrefix(rawWebsite) };
    }
  }

  const invalidFields = [];
  if (emailPrefixed) invalidFields.push("email");
  if (websitePrefixed) invalidFields.push("website");
  return { isTest: false, invalidFields, email: rawEmail, website: rawWebsite };
}
