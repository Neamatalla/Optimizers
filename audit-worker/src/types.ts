
// GA4 and GTM pick the checklists. Microsoft Clarity is separate and
// optional: a snapshot pulled at intake (clarity_data below, see
// clarity-facts.ts). Hotjar isn't offered.
export type ToolId = "GA4" | "GTM";

// pending -> processing -> awaiting_approval -> scheduled -> done, with
// test-mode rows (is_test, below) skipping the middle two entirely:
// pending -> processing -> done, emailed to the submitter on the spot. And
// failed reachable from processing (non-rate-limit error) and a rate-limit
// hit during processing bouncing back to pending (see retry_after below)
// instead of failed — see supabase.ts's claimNextRequest/
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
  // The store's own Clarity snapshot from the form (api/clarity/connect.js),
  // rebuilt and site-matched at intake. Undefined on rows from before the
  // column existed; null when Clarity wasn't connected.
  clarity_data?: unknown;
  // The media buyer's ad from the form (api/_lib/audit-intake.js
  // cleanAdContext): headline/offer and coupon. Undefined/null when not given.
  ad_context?: { text: string | null; coupon: string | null } | null;
  // Both the email and the website were submitted with a leading "-" (see
  // api/_lib/audit-intake.js's parseTestPrefix). Test runs execute the
  // whole real pipeline, then diverge at delivery: the report is published
  // to AUDIT_REPORTS_TEST_BUCKET instead of the live bucket, and it's
  // emailed straight to the address in the form — no internal review, no
  // approval token, no 2-day delay (see poll.ts's processRequest). Also
  // exempt from the one-audit-per-site limit, so the same site can be
  // re-tested any number of times.
  is_test: boolean;
  // Which ownership checks passed at intake, and whether any did (derived
  // by Postgres). See api/_lib/ownership-verification.js. Not read by the
  // worker.
  verification_methods: string[];
  is_verified: boolean;
  // Intellia's e-store platform (e.g. "Shopify") from the form's website
  // step, null when Intellia was unavailable. Not read by the worker.
  store_platform: string | null;
  // "Your role" from the form (audience.ts). Picks the reader brief the
  // business voice is written for and what the report surfaces first. Null
  // on rows from before the field existed: the default store-owner voice.
  audience_role?: import("./audience.js").AudienceRole | null;
  status: RequestStatus;
  result_error: string | null;
  report_url: string | null;
  // Set instead of failing the row outright when a run hits a rate limit —
  // claimNextRequest() won't reclaim a pending row until this passes,
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
  // Job-queue bookkeeping (supabase/schema.sql).
  // attempts counts real attempts (incremented at claim); locked_by and
  // heartbeat_at form the lease a live worker keeps refreshing.
  attempts: number;
  locked_by: string | null;
  heartbeat_at: string | null;
  // Output of every stage that already finished, so a retry resumes instead
  // of starting over. See poll.ts's processRequest for the stage order.
  progress: JobProgress;
  created_at: string;
  updated_at: string;
}

export interface JobProgress {
  // Stage 1: the audit itself (the expensive claude -p run) plus the data
  // gathered alongside it.
  categories?: CategoryResult[];
  discoveredPages?: string[];
  pageSpeed?: AuditResult["pageSpeed"];
  screenshots?: AuditResult["screenshots"];
  ga4Metrics?: Ga4Metrics | null;
  // Worker-computed GA4 numbers and verdicts (ga4-facts.ts) and the browser
  // facts the friction collector saw (site-checks.ts) — fed into the audit
  // prompt so GA4, CRO, the report and the email quote the same figures.
  ga4Facts?: Ga4Facts | null;
  siteChecks?: SiteChecks | null;
  // The store's own Clarity numbers (clarity-facts.ts), null without Clarity.
  clarityFacts?: import("./clarity-facts.js").ClarityFacts | null;
  // Stage 2: every finding above carries its Arabic text, or the final
  // attempt shipped with the English fallback for the rest. Until then each
  // finding's `ar` is saved as its category finishes, so a retry resumes.
  translated?: boolean;
  // Stage 1b: the purchase-friction (FUD) pass (src/fud/). Best-effort and
  // separate from the 50 checks: `{ error }` means it ran and failed, so a
  // retry doesn't run it again and the report just omits the section.
  // Undefined means it hasn't run (or FUD_PASS kept it off).
  fud?: FudResult | { error: string };
  // Stage 3: report saved as rows (supabase.ts saveAuditReport).
  reportUrl?: string;
  slug?: string;
  // Stage 4: delivery. Recorded right after each email so a retry never
  // sends the same email twice.
  approvalToken?: string;
  reviewEmailSent?: boolean;
  testEmailSent?: boolean;
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
  ar?: { technical: FindingVoice; business: FindingVoice; action?: ActionText; protect?: string; criteria?: string };
  // What good looks like: the checklist point's expected state, the
  // criteria of the finding (shown on every check, translated with it).
  criteria?: string;
  // The action layer (ACTION-POINTS-PROPOSAL.md): which of the four
  // opportunity types this point is, and for a failed point what to do, who
  // does it and how to tell it's done. A passed point carries `protect`
  // (what to keep as it is) instead of an action. Absent on old results.
  opportunity?: Opportunity;
  action?: FindingAction;
  protect?: string;
}

// The four ways a point pays: more sales from current traffic, money that
// is leaking now, a risk avoided, or a non-revenue benefit.
export type Opportunity = "revenue_gain" | "revenue_loss" | "risk" | "benefit";
export type ActionOwner = "dev" | "marketing" | "content" | "owner";

export interface ActionText {
  step: string;
  doneWhen: string;
  impact?: string;
}

export interface FindingAction extends ActionText {
  owners: ActionOwner[];
  // Where the point continues: a page the Conversion review checked, or
  // another check in this report.
  handoff?: Handoff;
  // Money range behind `impact`, when GA4 data allowed one (ga4-facts.ts).
  money?: { low: number; high: number; currency: string | null } | null;
}

export type Handoff = { kind: "cro"; page: FudPageType; url?: string } | { kind: "check"; id: string };

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
  // Who the report is written for (audience.ts). Absent/null = store owner.
  audienceRole?: import("./audience.js").AudienceRole | null;
  // Every page the deterministic discovery pass (discover-pages.ts) found
  // on the site, homepage first — the pages the browser checks are drawn
  // from this list (cart/checkout for WEB-54/56, a product page for
  // WEB-55), and the report shows which pages the audit actually covered.
  discoveredPages: string[];
  // PageSpeed performance scores for the home/collection/cart/product pages
  // (pagespeed.ts), shown in the report's Page Speed tab. Informational only,
  // never part of overallScore. Absent on results from before this existed.
  pageSpeed?: import("./pagespeed.js").PageSpeedResult;
  // Full-length screenshots of the homepage at desktop and mobile widths
  // (screenshots.ts), scrolled top to bottom inside the report's device
  // frames. Results from before 2026-10-05 hold first-screen shots only. Best-effort: either or both may be null when no browser was
  // found or the page would not load, and the report simply omits the
  // mockup rather than showing a broken frame.
  screenshots?: { desktop: string | null; mobile: string | null };
  // The store's own GA4 numbers for the report's charts (funnel, channel and
  // new-vs-returning conversion). Copied by Claude from the GA4-D data pulls
  // it already makes, never estimated, and only kept when the GA4 property
  // was a live exact match (see audit-prompt.ts's sanitizeGa4Metrics).
  // Absent or null when there was no live GA4 data or on older results.
  ga4Metrics?: Ga4Metrics | null;
  // Purchase-friction (FUD) pass result, rendered as its own report section.
  // Never part of overallScore/possiblePoints. Absent or null when the pass
  // was off, failed, or on older results — the report then renders exactly
  // as it did before the pass existed.
  fud?: FudResult | null;
  // See JobProgress. Absent on results from before the action layer.
  ga4Facts?: Ga4Facts | null;
  siteChecks?: SiteChecks | null;
  // See JobProgress. Absent when Clarity wasn't connected or on older results.
  clarityFacts?: import("./clarity-facts.js").ClarityFacts | null;
  // ISO date the report was published (audit_reports.generated_at), shown on
  // the report. Absent before publishing: the report shows today's date.
  generatedAt?: string;
}

// ---- purchase friction (FUD) pass — see FUD-PASS-DESIGN.md and src/fud/ ----

// pass/fail as in the 50 checks, plus "warn" (partly there, or not certain
// enough for a FAIL) and "unassessed" (the page or element needed for the
// rule couldn't be reached — never turned into a pass or a fail).
export type FudStatus = "pass" | "warn" | "fail" | "unassessed";
export type FudBand = "quick_win" | "dev_task" | "test_first";
export type FudPageType = "home" | "product" | "cart" | "collection";

export interface FudPexti {
  // 0-100, from the five 1-5 factors below (src/fud/score.ts).
  score: number;
  P: number;
  E: number;
  C: number;
  T: number;
  I: number;
}

export interface FudFinding {
  ruleId: string;
  ruleVersion: string;
  pageType: FudPageType;
  pageUrl: string | null;
  status: FudStatus;
  unassessedReason?: string;
  // The judge's own confidence, 0-1, before score.ts's gates.
  confidence: number;
  technical: FindingVoice;
  business: FindingVoice;
  recommendation?: string;
  // Ready-to-paste copy for the store, written in both languages.
  exampleCopy?: { en: string; ar: string };
  // blockIds = the page text the judge relied on; crop = JPEG data URI of
  // the page area the rule is about (CTA region, cart drawer, first screen).
  evidence: { blockIds: string[]; crop?: string | null };
  pexti: FudPexti | null;
  band?: FudBand;
  // When the store's own GA4 funnel shows a drop at the step this rule
  // affects, e.g. { from: "add_to_cart", to: "begin_checkout", rate: 0.32 }.
  funnel?: { from: Ga4FunnelEvent; to: Ga4FunnelEvent; rate: number } | null;
  // Arabic, written by the judge in the same call (not translate-ar.ts), so
  // this pass never touches the main translation stage or its retries.
  ar?: { technical: FindingVoice; business: FindingVoice; recommendation?: string; doneWhen?: string };
  // How the same rule looks at 1440px, from the keyword detectors only (the
  // judge reads the phone visit). "better" = the detectors found it in place
  // on desktop, so the gap is mainly a phone problem; "worse" = fine on the
  // phone but not found in place on desktop. Absent when desktop wasn't
  // visited or the rule doesn't depend on layout.
  desktop?: "same" | "better" | "worse";
  // A reviewer's correction (npm run fud-override). The machine's own status
  // is kept in `from` so overrides can be counted when calibrating rules;
  // `hidden` drops the finding from the report and the score entirely.
  override?: { from: FudStatus; to: FudStatus | "hidden"; reason: string; at: string };
  // Action layer, same shape as the 50 checks. `focus` = this finding sits on
  // the page GA4 named as the biggest leak (GA4-01), so it ranks higher and
  // shows under "Follow-up from GA4".
  opportunity?: Opportunity;
  action?: FindingAction;
  focus?: boolean;
}

export interface FudResult {
  ruleSetVersion: string;
  viewport: "mobile";
  // Whether home/product were also visited at desktop width.
  desktopChecked?: boolean;
  pagesSampled: Array<{ url: string; pageType: FudPageType; loaded: boolean; note?: string }>;
  // null when coverage is too low for a meaningful score (score.ts).
  score: number | null;
  assessed: number;
  applicable: number;
  // Ordered for display: fail/warn by PEXTI (highest first), then pass,
  // then unassessed.
  findings: FudFinding[];
  // Money and segment insights from the store's own GA4 data (fud/insights.ts).
  // Null when there was no GA4 data or too little traffic.
  insights?: FudInsights | null;
}

export interface FudInsightLine {
  kind: "device" | "new_returning" | "channel" | "landing" | "funnel";
  tone: "good" | "bad" | "neutral";
  en: string;
  ar: string;
}

export interface FudInsights {
  source: "ga4_oauth" | "ga4_summary";
  currency: string | null;
  periodDays: number;
  sessions: number | null;
  purchases: number | null;
  revenue: number | null;
  conversionRate: number | null;
  aov: number | null;
  // Estimated extra revenue per month (a range, never a promise).
  opportunity: {
    low: number;
    high: number;
    monthlyRevenue: number;
    basis: "funnel" | "conversion_rate";
    steps: Array<{ from: string; to: string; rate: number; benchmark: number; lowMultiplier: number; highMultiplier: number }>;
  } | null;
  lines: FudInsightLine[];
  text: { en: string; ar: string } | null;
}

export type Ga4FunnelEvent = "page_view" | "view_item" | "add_to_cart" | "begin_checkout" | "add_shipping_info" | "add_payment_info" | "purchase";

export interface Ga4Metrics {
  periodDays: number;
  currency: string | null;
  sessions: number | null;
  conversions: number | null;
  // Percent, e.g. 2.36.
  conversionRate: number | null;
  revenue: number | null;
  // Event counts in funnel order; at least two steps when present.
  funnel: Array<{ event: Ga4FunnelEvent; count: number }>;
  // Conversion rate by default channel group.
  channels: Array<{ name: string; sessions: number | null; conversionRate: number }>;
  // New vs returning visitors.
  segments: Array<{ name: "new" | "returning"; sessions: number | null; conversionRate: number }>;
}

// ---- worker-computed GA4 facts (ga4-facts.ts) ----

export type Ga4FactStatus = "pass" | "fail" | "no_data";

export interface Ga4Fact {
  id: string;
  status: Ga4FactStatus;
  // One plain sentence with the store's own numbers, written by code. The
  // audit prompt must quote these numbers, never recompute them.
  en: string;
  money?: { low: number; high: number; currency: string | null } | null;
  handoff?: Handoff;
}

export interface Ga4Focus {
  // The worst funnel step against its benchmark (GA4-01).
  step: { from: string; to: string; rate: number; benchmark: number } | null;
  // The page the Conversion review should look at first for that step.
  page: FudPageType | null;
  productUrl?: string;
  landingUrl?: string;
  campaignLandingUrl?: string;
}

export interface Ga4Facts {
  currency: string | null;
  periodDays: number;
  sessions: number | null;
  purchases: number | null;
  revenue: number | null;
  conversionRate: number | null;
  aov: number | null;
  focus: Ga4Focus;
  facts: Record<string, Ga4Fact>;
}

// ---- browser facts from the friction collector (site-checks.ts) ----

export interface SiteChecks {
  platform: string | null;
  addToCart: { attempted: boolean; ok: boolean; reason?: string; via?: "drawer" | "page"; method?: "click" | "api"; clickAdded?: boolean };
  // Event names seen right after our Add-to-Cart click: from the page's own
  // dataLayer, and from the (blocked) analytics/pixel requests.
  atcEvents: { dataLayer: string[]; ga4: string[]; pixels: string[] } | null;
  contactLinks: Array<{ href: string; kind: "whatsapp" | "tel"; valid: boolean }>;
  soldOutPromoted: number;
  heroVideoMobile: boolean;
  pagesVisited: Array<{ pageType: FudPageType; url: string; loaded: boolean }>;
}
