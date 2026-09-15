
// Hotjar and Clarity are not offered — Clarity's manual-token flow was
// removed in favor of the GA4/GTM auto-detect + OAuth property picker; no
// equivalent live-data path exists for either tool otherwise.
export type ToolId = "GA4" | "GTM";

// pending -> processing -> awaiting_approval -> scheduled -> done, with
// test-mode rows (is_test, below) skipping the middle two entirely:
// pending -> processing -> done, emailed to the submitter on the spot. And
// failed reachable from processing (non-rate-limit error) and a rate-limit
// hit during processing bouncing back to pending (see retry_after below)
// instead of failed — see supabase.ts's claimNextPendingRequest/
// markRequestRateLimited and poll.ts's isRateLimitError.
export type RequestStatus = "pending" | "processing" | "awaiting_approval" | "scheduled" | "done" | "failed";

export interface AuditRequestRow {
  id: string;
  tools: ToolId[];
  website: string;
  email: string;
  business_name: string | null;
  // User-provided supplement to crawl-extracted IDs - never a matching
  // shortcut on its own, see audit-prompt.ts's exact-match requirement.
  ga4_measurement_id: string | null;
  gtm_container_id: string | null;
  // Pre-fetched by api/oauth/google/callback.js - already scoped to exactly
  // what the visitor's own Google login consented to, so it needs no
  // exact-ID-match re-verification the way MCP-sourced data does.
  ga4_oauth_data: unknown;
  gtm_oauth_data: unknown;
  // Both the email and the website were submitted with a leading "-" (see
  // api/_lib/audit-intake.js's parseTestPrefix). Test runs execute the
  // whole real pipeline, then diverge at delivery: the report is published
  // to AUDIT_REPORTS_TEST_BUCKET instead of the live bucket, and it's
  // emailed straight to the address in the form — no internal review, no
  // approval token, no 2-day delay (see poll.ts's processRequest). Also
  // exempt from the one-audit-per-site/email limit, so the same site can be
  // re-tested any number of times.
  is_test: boolean;
  status: RequestStatus;
  result_error: string | null;
  report_url: string | null;
  // Set instead of failing the row outright when a run hits a rate limit —
  // claimNextPendingRequest() won't reclaim a pending row until this passes,
  // so the request keeps its place in line (created_at is untouched) and
  // just waits out the limit. Null once claimed normally.
  retry_after: string | null;
  // How many times this row has been bounced back for a rate limit — drives
  // markRequestRateLimited's backoff (5min * 2^retry_count, capped at 60min).
  retry_count: number;
  // One-time secret embedded in the internal review email's "Approve" link
  // (api/_lib/audit-approve.js) — the link itself is the credential, no
  // separate login. Null until the audit completes and review starts.
  approval_token: string | null;
  approved_at: string | null;
  // approved_at + 2 days, computed at approval time — when the worker's
  // due-send check actually emails the client.
  scheduled_send_at: string | null;
  sent_to_client_at: string | null;
  // Snapshot of AuditResult.categories.map(c => c.category) at completion —
  // needed again at actual client-send time (processDueSends, which no
  // longer has the AuditResult in scope), for the client email's coverage
  // sentence. Null until the audit completes.
  categories_audited: CategoryKey[] | null;
  created_at: string;
  updated_at: string;
}

// PageSpeed was a fourth category (4 checks, backed by a site-wide
// PageSpeed Insights sweep) until 2026-09-09 — removed for run time; what
// it scored is now WEB-60..WEB-63 inside Website (see checklist.ts).
export type CategoryKey = "GA4" | "GTM" | "Website";

export type DataSource = "live" | "detection" | "public";
export type FindingSeverity = "critical" | "medium" | "low";
// "pass" | "fail" — every checklist point gets exactly one CategoryFinding
// now, tagged with which it was (2026-09-06 rewrite). There is no more
// implicit/silent pass: a clean point still gets a real, Claude-written
// justification in both registers (see FindingVoice below — the technical
// voice states the real measured result, the business voice says why that
// result is worth having), not just an absence of a fail entry.
// This is what fixed the report showing checklist.ts's own generic
// expectedState/commonFailure placeholder text for a passed point (most
// visible on the open GA4-D slots, whose placeholder text is deliberately
// generic scaffolding, not real report content) — html-report.ts now always
// renders a finding's own text, for pass or fail, never checklist.ts's.
export type FindingStatus = "pass" | "fail";

/**
 * One check, told twice — the same finding in two registers, so the report
 * serves the engineer who has to fix it AND the stakeholder deciding whether
 * it's worth fixing. html-report.ts renders both and switches between them
 * with a language toggle; neither is a summary of the other, they're the same
 * fact at two altitudes.
 *
 * `summary` is the row headline (one line, shown collapsed); `detail` is the
 * body paragraph revealed when the row opens.
 */
export interface FindingVoice {
  summary: string;
  detail: string;
}

export interface CategoryFinding {
  // Engineer register: the literal state found, with the real values that
  // prove it — property/tag/variable names, metric numbers, config flags,
  // header values — plus the mechanism behind it. Jargon is correct here.
  technical: FindingVoice;
  // Stakeholder register: the same finding with no jargon, and then what it
  // actually costs or protects — which decision it distorts, which spend it
  // wastes, which revenue it risks, who feels it. For a fail this is the
  // consequence of leaving it; for a pass, what the clean result protects.
  // The point is that a reader who skips every technical line still learns
  // why the check exists and what the result means for them.
  business: FindingVoice;
  dataSource: DataSource;
  severity: FindingSeverity;
  status: FindingStatus;
  // Which exact checklist.ts point (e.g. "GA4-15", "WEB-23") this finding is
  // about — Claude must cite it, exactly once per point. This is what makes
  // the category score below a real tally instead of an LLM's independent
  // guess: without this link there'd be no way to know which of a
  // category's checklist items actually failed vs. passed.
  checklistId: string;
  // Arabic translation of both registers above, filled in by a best-effort
  // post-pass (translate-ar.ts) after the English AuditResult is complete —
  // never produced by the main audit prompt itself, to keep that prompt's
  // schema and run time unchanged. Optional and per-finding: a translation
  // run that fails, times out, or only partially completes just leaves this
  // undefined for the affected findings, and html-report.ts falls back to
  // the English text for those specific rows even while the reader has
  // Arabic selected — never a blank row.
  ar?: { technical: FindingVoice; business: FindingVoice };
}

export interface CategoryResult {
  category: CategoryKey;
  // 0-100 — DERIVED from checklistTally below (passed/total*100), computed
  // in audit-prompt.ts's computeCategoryResult() from the checklist ids
  // Claude cited. Never trust a number here that didn't come from that
  // tally — the LLM does not report this value itself. Purely a display
  // convenience (a 0-100 gauge reads faster than a raw fraction) — the REAL
  // unit is checklistTally below: a flat count of checks, not a weighted
  // point scale.
  score: number;
  // total = every check in this category's checklist (checklist.ts).
  // evaluated = ALWAYS equal to total — there is no "skipped/not evaluable"
  // bucket any more (a prior version let a genuinely-inaccessible check
  // shrink this below total; that's gone, computeCategoryResult now hard-
  // guarantees evaluated===total in code, not just by prompt instruction).
  // Kept as a separate field from `total` only because CategoryFinding/
  // html-report.ts's display code already expects it, not because it can
  // differ any more.
  // passed = count of findings below with status "pass" — every check is
  // worth exactly 1 in the overall audit tally (see scoring.ts's
  // computeOverallPoints); a "21/25 checks passed" figure IS the count, not
  // a percentage translated into some other scale.
  checklistTally: { total: number; evaluated: number; passed: number };
  // ALWAYS exactly `checklistTally.total` entries, one per checklist point,
  // pass or fail — see FindingStatus's own doc comment. Never a subset.
  findings: CategoryFinding[];
}

export interface AuditResult {
  // Only ever the ONE route's categories — GA4+GTM, OR one tracking tool
  // plus Website, OR Website alone, never any other mix (see scoring.ts's
  // countedCategories()).
  categories: CategoryResult[];
  // Checks passed this run — NOT a 0-100 percentage. Sum of every included
  // category's checklistTally.passed. See possiblePoints below for the
  // denominator — ALWAYS exactly 50 for every run, no exceptions, regardless
  // of which of the three routes ran (see scoring.ts's countedCategories's
  // own doc comment and audit-prompt.ts's computeCategoryResult, which
  // hard-guarantees this in code).
  overallScore: number;
  // The denominator for overallScore — sum of every included category's
  // checklistTally.evaluated. Always exactly 50, unconditionally.
  possiblePoints: number;
  websiteUrl: string;
  // Cosmetic only - personalizes the report/email, never used to decide
  // which GA4/GTM property gets queried (see audit-prompt.ts).
  businessName: string | null;
  // Every page the deterministic discovery pass (discover-pages.ts) found
  // on the site, homepage first — the pages the browser checks are drawn
  // from this list (cart/checkout for WEB-54/56, a product page for
  // WEB-55), and the report shows which pages the audit actually covered.
  // Carried a full PageSpeed sweep per page until 2026-09-09; now just the
  // URLs, since nothing fetches Lighthouse data for them any more.
  discoveredPages: string[];
  // Above-the-fold screenshots of the site at desktop and mobile widths
  // (screenshots.ts), rendered as a device-framed mockup under the report
  // hero. Best-effort: either or both may be null when no browser was
  // found or the page would not load, and the report simply omits the
  // mockup rather than showing a broken frame.
  screenshots?: { desktop: string | null; mobile: string | null };
}
