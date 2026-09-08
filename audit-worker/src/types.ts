import type { PageSpeedReport } from "./pagespeed.js";

// Hotjar and Clarity are not offered — Clarity's manual-token flow was
// removed in favor of the GA4/GTM auto-detect + OAuth property picker; no
// equivalent live-data path exists for either tool otherwise.
export type ToolId = "GA4" | "GTM";

// pending -> processing -> awaiting_approval -> scheduled -> done, with
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

export type CategoryKey = "GA4" | "GTM" | "Website" | "PageSpeed";

export type DataSource = "live" | "detection" | "public";
export type FindingSeverity = "critical" | "medium" | "low";
// "pass" | "fail" — every checklist point gets exactly one CategoryFinding
// now, tagged with which it was (2026-09-06 rewrite). There is no more
// implicit/silent pass: a clean point still gets a real, Claude-written
// justification (issue = what was actually checked and the real result;
// businessImpact = why that's good), not just an absence of a fail entry.
// This is what fixed the report showing checklist.ts's own generic
// expectedState/commonFailure placeholder text for a passed point (most
// visible on the open GA4-D slots, whose placeholder text is deliberately
// generic scaffolding, not real report content) — html-report.ts now always
// renders a finding's own text, for pass or fail, never checklist.ts's.
export type FindingStatus = "pass" | "fail";

export interface CategoryFinding {
  // What was actually checked and what was found — real, specific, grounded
  // in this run's real data, for BOTH a pass and a fail (never "N/A" or
  // generic checklist boilerplate). This is also what html-report.ts uses as
  // the row's own header/summary text, for pass rows same as fail rows.
  issue: string;
  // Why it matters to the business — for a fail, the cost of the problem;
  // for a pass, why that result is good / what it protects.
  businessImpact: string;
  dataSource: DataSource;
  severity: FindingSeverity;
  status: FindingStatus;
  // Which exact checklist.ts point (e.g. "GA4-15", "WEB-23") this finding is
  // about — Claude must cite it, exactly once per point. This is what makes
  // the category score below a real tally instead of an LLM's independent
  // guess: without this link there'd be no way to know which of a
  // category's checklist items actually failed vs. passed.
  checklistId: string;
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
  // plus Website+PageSpeed, OR Website+PageSpeed alone, never any other mix
  // (see scoring.ts's countedCategories()).
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
  // The full site-wide PageSpeed sweep (pagespeed.ts's fetchSitePageSpeed) —
  // same data already fed into the claude -p prompt (see audit-prompt.ts),
  // carried through to the AuditResult too so html-report.ts can render the
  // raw per-page Lighthouse detail, not just Claude's synthesized findings.
  // sitePageSpeed[0] is always the homepage (see poll.ts/test-run.ts).
  sitePageSpeed: Array<{ url: string; report: PageSpeedReport }>;
}
