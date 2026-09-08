import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { summarizeSitePageSpeed } from "./pagespeed.js";
import type { LighthouseAuditSnapshot, PageSpeedReport, PageSpeedSummary, SitePageSpeedSummary } from "./pagespeed.js";
import type { AuditResult, CategoryKey, CategoryResult, FindingSeverity } from "./types.js";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, WEBSITE_CODE_CHECKLIST, PAGESPEED_CHECKLIST, type ChecklistPoint } from "./checklist.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "assets");

// Real Optimizers brand colors (BRAND_IDENTITY.md §4, verbatim from the brand
// PDF p.14) plus a small set of deliberately-chosen supporting tones — never
// generic grays, always a hue nudge toward the brand palette.
const BLACK_FOREST = "#020601";
const BIG_STONE = "#162A3D";
const STONE_RAISED = "#1E3A52"; // one step lighter than Big Stone, for header rows / hover-weight
const ACCENT = "#6AE499";
const INK = "#EAF3EC"; // near-white with a whisper of green, not pure white
const MUTED = "#93ADA8"; // blue-green-gray from the Big Stone family, not a generic gray
const HAIRLINE = "rgba(234,243,236,.09)";
const CRITICAL = "#FF6B57";
const MEDIUM = "#F2B75E";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://optimizers.agency";

// Clarity/SessionRecording removed as an audit category entirely. Three
// possible category combinations run per audit (see scoring.ts's
// countedCategories, always exactly 50 checks): GA4+GTM together, one
// tracking tool + Website + PageSpeed together, or Website+PageSpeed alone
// — never all four categories, and never any other combination. All four
// still keep the icon-in-circle treatment already established in the PPTX
// report for visual consistency across every deliverable this audit
// produces, and all four tabs always render, even for a category that
// didn't run this specific audit (see categorySection's not-run branch).
const CATEGORY_LABELS: Record<CategoryKey, string> = {
  GA4: "Google Analytics 4",
  GTM: "Google Tag Manager",
  Website: "Website & CRO",
  PageSpeed: "Page Speed",
};

const CATEGORY_ICON: Record<CategoryKey, string> = {
  GA4: "chart-growth.png",
  GTM: "tag.png",
  Website: "cart.png",
  PageSpeed: "clock.png",
};

const CATEGORY_CAPTION: Record<CategoryKey, string> = {
  GA4: "Measurement layer — key events, conversions, audience data",
  GTM: "Container deployment — tags, triggers, pixel firing",
  Website: "Live-site crawl — deployed tracking, structure, conversion readiness",
  PageSpeed: "Load performance signals",
};

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  critical: "Critical",
  medium: "Medium",
  low: "Low",
};

const SEVERITY_COLOR: Record<FindingSeverity, string> = {
  critical: CRITICAL,
  medium: MEDIUM,
  low: ACCENT,
};

const SEVERITY_ICON: Record<FindingSeverity, string> = {
  critical: "warning.png",
  medium: "info.png",
  low: "check.png",
};

const DATA_SOURCE_LABEL: Record<string, string> = {
  live: "Live data",
  detection: "Detected",
  public: "Public data",
};

// Slug used for the tab radio/label/panel id triplet — fixed, not derived
// from CATEGORY_LABELS, since it has to be a valid HTML id fragment.
const TAB_SLUG: Record<CategoryKey, string> = {
  GA4: "ga4",
  GTM: "gtm",
  Website: "website",
  PageSpeed: "pagespeed",
};

// Mirrors the grouping comments in pagespeed.ts's KEY_AUDIT_IDS exactly —
// same four buckets (performance/accessibility/best-practices/seo) that
// audit IDs are already organized under there, just given display labels.
type AuditGroupKey = "performance" | "accessibility" | "bestPractices" | "seo";

const AUDIT_GROUPS: Record<AuditGroupKey, string[]> = {
  performance: ["render-blocking-resources", "uses-responsive-images", "modern-image-formats", "uses-optimized-images", "unused-javascript", "unused-css-rules", "uses-text-compression", "uses-long-cache-ttl"],
  accessibility: ["color-contrast", "image-alt", "label", "button-name", "link-name", "tap-targets", "heading-order", "html-has-lang", "html-lang-valid"],
  bestPractices: ["is-on-https", "no-vulnerable-libraries", "deprecations", "csp-xss"],
  seo: ["meta-description", "document-title", "canonical", "robots-txt", "is-crawlable", "structured-data", "hreflang"],
};

const AUDIT_GROUP_LABELS: Record<AuditGroupKey, string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  bestPractices: "Best Practices",
  seo: "SEO",
};

const AUDIT_LABELS: Record<string, string> = {
  "render-blocking-resources": "Render-blocking resources",
  "uses-responsive-images": "Responsive images",
  "modern-image-formats": "Modern image formats",
  "uses-optimized-images": "Oversized images (>200KB)",
  "unused-javascript": "Unused JavaScript",
  "unused-css-rules": "Unused CSS",
  "uses-text-compression": "Text compression",
  "uses-long-cache-ttl": "Cache lifetimes",
  "color-contrast": "Color contrast",
  "image-alt": "Image alt text",
  label: "Form field labels",
  "button-name": "Button accessible names",
  "link-name": "Link accessible names",
  "tap-targets": "Tap target sizing",
  "heading-order": "Heading order",
  "html-has-lang": "HTML lang attribute",
  "html-lang-valid": "Valid HTML lang value",
  "is-on-https": "Served over HTTPS",
  "no-vulnerable-libraries": "No vulnerable JS libraries",
  deprecations: "Deprecated APIs",
  "csp-xss": "Content Security Policy (XSS)",
  "meta-description": "Meta description",
  "document-title": "Document title",
  canonical: "Canonical URL",
  "robots-txt": "robots.txt",
  "is-crawlable": "Indexability",
  "structured-data": "Structured data",
  hreflang: "hreflang tags",
};

export interface AuditHtmlReport {
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function scoreColor(score: number): string {
  if (score >= 75) return ACCENT;
  if (score >= 50) return MEDIUM;
  return "#FF8979";
}

function letterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// "1 check" vs "13 checks" — not a weighted point scale, a flat count of
// checks (see scoring.ts), so this only ever fires singular for a lone-item
// category.
function checksLabel(value: number): string {
  return value === 1 ? "check" : "checks";
}

// The literal tally behind a category's checks-passed figure — "21 of 25
// checks passed" — so it's always traceable back to an exact, auditable
// count instead of reading as an abstract percentage. `tally.evaluated` is
// hard-guaranteed equal to `tally.total` by audit-prompt.ts's
// computeCategoryResult (no "skipped/not evaluable" bucket any more), so
// this only ever needs `total`, not `evaluated` — kept as a plain reference
// to `tally.total` for a single fewer moving part in this function.
function checklistTallyLabel(tally: CategoryResult["checklistTally"]): string {
  return `${tally.passed} of ${tally.total} check${tally.total === 1 ? "" : "s"} passed`;
}

function severityCounts(result: AuditResult) {
  let critical = 0;
  let medium = 0;
  let low = 0;
  for (const cat of result.categories) {
    for (const finding of cat.findings) {
      if (finding.severity === "critical") critical++;
      if (finding.severity === "medium") medium++;
      if (finding.severity === "low") low++;
    }
  }
  return { critical, medium, low, total: critical + medium + low };
}

async function dataUri(relativePath: string, mime: string): Promise<string> {
  const file = await readFile(path.join(ASSETS, relativePath));
  return `data:${mime};base64,${file.toString("base64")}`;
}

async function fontFaceUri(relativePath: string): Promise<string> {
  const file = await readFile(path.join(ASSETS, relativePath));
  return `data:font/ttf;base64,${file.toString("base64")}`;
}

async function brandAssets() {
  // No tiled/repeating pattern asset any more — the ambient background is
  // pure CSS (gradient glow + hairline grid), see .page::before/::after.
  // pattern-bg-blackforest.png is intentionally not loaded here.
  const [wordmark, icon, fontRegular, fontSemiBold, fontBold, ...categoryIcons] = await Promise.all([
    dataUri("wordmark-white-trim.png", "image/png"),
    dataUri("icon-white-trim.png", "image/png"),
    fontFaceUri("Sora-Regular.ttf"),
    fontFaceUri("Sora-SemiBold.ttf"),
    fontFaceUri("Sora-Bold.ttf"),
    ...(Object.keys(CATEGORY_ICON) as CategoryKey[]).map(k => dataUri(`icons/${CATEGORY_ICON[k]}`, "image/png")),
    ...(Object.keys(SEVERITY_ICON) as FindingSeverity[]).map(s => dataUri(`icons/${SEVERITY_ICON[s]}`, "image/png")),
  ]);

  const categoryKeys = Object.keys(CATEGORY_ICON) as CategoryKey[];
  const severityKeys = Object.keys(SEVERITY_ICON) as FindingSeverity[];
  const categoryIconMap = Object.fromEntries(categoryKeys.map((k, i) => [k, categoryIcons[i]])) as Record<CategoryKey, string>;
  const severityIconMap = Object.fromEntries(severityKeys.map((s, i) => [s, categoryIcons[categoryKeys.length + i]])) as Record<FindingSeverity, string>;

  return { wordmark, icon, fontRegular, fontSemiBold, fontBold, categoryIconMap, severityIconMap };
}

type BrandAssets = Awaited<ReturnType<typeof brandAssets>>;

// The single real content-mechanic worth visualizing structurally (per
// "structure is information," not decoration): each included category's
// share of this run's checklist IS how the audit was actually scored, so
// it's rendered as literal proportional segments sized by checklistTally.
// Only the categories that actually ran this audit appear here — the three
// routes (scoring.ts's countedCategories) never overlap, so there's no
// "missing" category to redistribute around any more.
function weightStrip(result: AuditResult): string {
  const total = result.possiblePoints;

  const segments = result.categories.map(cat => {
    const pct = total > 0 ? (cat.checklistTally.evaluated / total) * 100 : 0;
    const color = scoreColor(cat.score);
    return `<div class="weight-seg" style="--w:${pct};--c:${color}" title="${escapeHtml(CATEGORY_LABELS[cat.category])}: ${cat.checklistTally.evaluated} ${checksLabel(cat.checklistTally.evaluated)}"></div>`;
  }).join("");

  const legend = result.categories.map(cat => `
      <label class="weight-legend-item" for="tab-${TAB_SLUG[cat.category]}">
        <span class="dot" style="--c:${scoreColor(cat.score)}"></span>
        <span class="name">${escapeHtml(CATEGORY_LABELS[cat.category])}</span>
        <span class="value">${cat.checklistTally.passed} / ${cat.checklistTally.evaluated} ${checksLabel(cat.checklistTally.evaluated)}</span>
      </label>`).join("");

  return `
    <section class="weight-band">
      <div class="wrap">
        <div class="weight-panel">
          <p class="eyebrow">How this ${total}-check audit is built</p>
          <div class="weight-strip">${segments}</div>
          <div class="weight-legend">${legend}</div>
        </div>
      </div>
    </section>`;
}

// "Website" is the only category whose checklist size varies by route — the
// full 46-item WEBSITE_CHECKLIST when the visitor has neither GA4 nor GTM,
// or the curated 21-item WEBSITE_CODE_CHECKLIST when they have exactly one
// (see checklist.ts's own doc comment and scoring.ts's countedCategories).
// `checklistTally.total` already reflects which one actually ran this audit
// (audit-prompt.ts's computeCategoryResult sets it from the real checklist
// array's length), so it's used here to pick the matching array back up for
// display — no separate route flag needs to be threaded through.
function checklistForDisplay(category: CategoryKey, total: number): ChecklistPoint[] {
  if (category === "GA4") return GA4_CHECKLIST;
  if (category === "GTM") return GTM_CHECKLIST;
  if (category === "PageSpeed") return PAGESPEED_CHECKLIST;
  return total === WEBSITE_CODE_CHECKLIST.length ? WEBSITE_CODE_CHECKLIST : WEBSITE_CHECKLIST;
}

// Every single check in this category's checklist gets its own row, in
// checklist order — not just the broken ones. A prior version of this
// report only ever rendered `cat.findings` (i.e. only what failed), so a
// category with 16 of 25 checks passing only ever showed the 9 broken
// ones — a real, working check that passed was invisible anywhere in the
// report, with nothing to show for the other 16 beyond an aggregate number.
//
// 2026-09-06: passed rows used to fall back to checklist.ts's own static
// expectedState/commonFailure text — generic scaffolding written once per
// checklist point, not this run's actual result. Most visible (and most
// wrong) on the open GA4-D slots, whose placeholder text literally reads
// "No fixed expected state — see ... in audit-prompt.ts" — internal
// dev-facing text that was leaking straight into the client-facing report.
// Every point now gets a real, Claude-written finding regardless of outcome
// (see types.ts's FindingStatus doc comment and audit-prompt.ts's "no
// implicit pass" instruction), so BOTH branches below render the finding's
// own `issue`/`businessImpact` text — never checklist.ts's static fields.
// The `??` fallbacks only cover a finding that's missing outright (a
// hand-built fixture like preview-report.ts that doesn't bother covering
// every point, or a real gap computeCategoryResult already logs a warning
// for) — even then, never checklist.ts's expectedState/commonFailure.
function checklistRows(cat: CategoryResult, checklist: ChecklistPoint[], assets: BrandAssets): string {
  const findingsById = new Map(cat.findings.map(f => [f.checklistId, f]));

  const rows = checklist
    .map((point, index) => {
      const idx = String(index + 1).padStart(2, "0");
      const finding = findingsById.get(point.id);
      const status = finding?.status ?? "pass";

      if (status === "fail" && finding) {
        return `
    <article class="finding finding--${finding.severity}" data-status="${finding.severity}">
      <button type="button" class="finding-toggle" aria-expanded="true">
        <div class="finding-meta">
          <span class="idx">${idx}</span>
          <span class="pill severity-pill" style="--c:${SEVERITY_COLOR[finding.severity]}">${escapeHtml(SEVERITY_LABEL[finding.severity])}</span>
          <span class="pill">${escapeHtml(DATA_SOURCE_LABEL[finding.dataSource] ?? finding.dataSource)}</span>
          <span class="pill checklist-id-pill">${escapeHtml(finding.checklistId)}</span>
          <span class="chevron" aria-hidden="true">⌄</span>
        </div>
        <h3>${escapeHtml(finding.issue)}</h3>
      </button>
      <div class="finding-body"><p>${escapeHtml(finding.businessImpact)}</p></div>
    </article>`;
      }

      const passIssue = finding?.issue ?? `${point.title} — no specific finding was reported for this check this run.`;
      const passImpact = finding?.businessImpact;
      const passSeverity = finding?.severity ?? point.severity;
      return `
    <div class="check-pass-row" data-status="pass">
      <button type="button" class="check-pass-toggle" aria-expanded="false">
        <span class="idx">${idx}</span>
        <span class="check-icon"><img src="${assets.severityIconMap.low}" alt="" width="12" height="12" /></span>
        <span class="check-id">${escapeHtml(point.id)}</span>
        <span class="check-title">${escapeHtml(passIssue)}</span>
        <span class="pill pass-pill">Passed</span>
        <span class="chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="check-pass-body">
        ${passImpact ? `<p>${escapeHtml(passImpact)}</p>` : ""}
        <p class="check-pass-severity"><span class="pill severity-pill" style="--c:${SEVERITY_COLOR[passSeverity]}">${escapeHtml(SEVERITY_LABEL[passSeverity])} if failed</span></p>
      </div>
    </div>`;
    })
    .join("");

  return `<div class="findings-grid">${rows}</div>`;
}

// Search box + status dropdown rendered above a category's checklist rows —
// filtered client-side (script block near the end of the document) by each
// row's data-status attribute (severity, or "pass") and its text content.
// No server round-trip: this is a static, already-generated file.
function filterBarHtml(): string {
  return `
    <div class="filter-bar">
      <input type="search" class="filter-search" placeholder="Search checks…" aria-label="Search checks in this category" />
      <select class="filter-select" aria-label="Filter checks by status">
        <option value="all">All checks</option>
        <option value="critical">Critical only</option>
        <option value="medium">Medium only</option>
        <option value="low">Low only</option>
        <option value="pass">Passed only</option>
      </select>
    </div>
    <p class="filter-empty" hidden>No checks match your search.</p>`;
}

function scoreOrDash(score: number | null): string {
  return score === null ? "—" : String(score);
}

function statCard(label: string, valueHtml: string, subHtml?: string): string {
  return `
    <div class="stat-card">
      <p class="stat-label">${escapeHtml(label)}</p>
      <p class="stat-value">${valueHtml}</p>
      ${subHtml ? `<p class="stat-sub">${subHtml}</p>` : ""}
    </div>`;
}

// Deterministic cross-page aggregate (summarizeSitePageSpeed) — computed in
// plain code, not written by Claude, same discipline as the aggregate
// itself; see pagespeed.ts's own doc comment on why it's kept that way.
function sweepSummaryHtml(summary: SitePageSpeedSummary): string {
  const cards = [
    statCard("Pages checked", String(summary.pagesChecked)),
    statCard("Avg mobile score", `<span style="color:${summary.avgMobileScore !== null ? scoreColor(summary.avgMobileScore) : MUTED}">${scoreOrDash(summary.avgMobileScore)}</span>`),
    statCard("Avg desktop score", `<span style="color:${summary.avgDesktopScore !== null ? scoreColor(summary.avgDesktopScore) : MUTED}">${scoreOrDash(summary.avgDesktopScore)}</span>`),
    statCard(
      "Worst mobile page",
      `<span style="color:${summary.worstMobilePage ? scoreColor(summary.worstMobilePage.score) : MUTED}">${summary.worstMobilePage ? summary.worstMobilePage.score : "—"}</span>`,
      summary.worstMobilePage ? escapeHtml(summary.worstMobilePage.url) : undefined,
    ),
    statCard(
      "Worst desktop page",
      `<span style="color:${summary.worstDesktopPage ? scoreColor(summary.worstDesktopPage.score) : MUTED}">${summary.worstDesktopPage ? summary.worstDesktopPage.score : "—"}</span>`,
      summary.worstDesktopPage ? escapeHtml(summary.worstDesktopPage.url) : undefined,
    ),
    statCard(
      "Pages failing Core Web Vitals",
      `<span style="color:${summary.pagesFailingCwv.length ? CRITICAL : ACCENT}">${summary.pagesFailingCwv.length}</span>`,
      summary.pagesFailingCwv.length ? summary.pagesFailingCwv.map(u => escapeHtml(u)).join("<br/>") : undefined,
    ),
  ].join("");
  return `
    <div class="pagespeed-raw">
      <h3 class="subhead">Site-wide PageSpeed sweep</h3>
      <p class="subhead-caption">Deterministic aggregate across every page crawled this run — computed directly from the Lighthouse data, not written by the model.</p>
      <div class="stat-grid">${cards}</div>
    </div>`;
}

// Only the audits that AREN'T passing (score !== 1) surface here — a clean
// pass across every tracked audit in a group renders nothing but the
// "all passed" note below. This is Lighthouse's own raw audit list (a
// different, denser thing from the 50-check checklist rows above), so it
// keeps its own "only show what's broken" instinct rather than listing
// every one of Lighthouse's ~20 tracked audits per group individually.
function auditGroupHtml(strategy: PageSpeedSummary, group: AuditGroupKey): string {
  const keyAudits = strategy.keyAudits as Record<string, LighthouseAuditSnapshot | undefined>;
  const items = AUDIT_GROUPS[group]
    .map(id => ({ id, audit: keyAudits[id] }))
    .filter((entry): entry is { id: string; audit: LighthouseAuditSnapshot } => !!entry.audit && entry.audit.score !== 1);
  if (items.length === 0) return "";
  const rows = items
    .map(
      ({ id, audit }) => `
    <div class="audit-item">
      <div class="audit-name">${escapeHtml(AUDIT_LABELS[id] ?? id)}${audit.displayValue ? ` <span class="audit-value">— ${escapeHtml(audit.displayValue)}</span>` : ""}</div>
      ${audit.failingItems.length ? `<ul>${audit.failingItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
    </div>`,
    )
    .join("");
  return `
    <details class="audit-group" open>
      <summary>
        <h5>${escapeHtml(AUDIT_GROUP_LABELS[group])}</h5>
        <span class="audit-count">${items.length} issue${items.length === 1 ? "" : "s"}</span>
      </summary>
      <div class="audit-group-body">${rows}</div>
    </details>`;
}

function strategyCardHtml(strategy: PageSpeedSummary): string {
  const scores: Array<[string, number | null]> = [
    ["Performance", strategy.performanceScore],
    ["Accessibility", strategy.accessibilityScore],
    ["Best Practices", strategy.bestPracticesScore],
    ["SEO", strategy.seoScore],
  ];
  const scoreChips = scores
    .map(
      ([label, score]) => `
    <div class="score-chip">
      <span class="lbl">${escapeHtml(label)}</span>
      <span class="val" style="color:${score !== null ? scoreColor(score) : MUTED}">${scoreOrDash(score)}</span>
    </div>`,
    )
    .join("");

  const groups = (Object.keys(AUDIT_GROUPS) as AuditGroupKey[]).map(g => auditGroupHtml(strategy, g)).join("");

  return `
    <div class="strategy-card">
      <h4>${strategy.strategy === "mobile" ? "Mobile" : "Desktop"}</h4>
      <div class="strategy-scores">${scoreChips}</div>
      <div class="cwv-row">
        <span>LCP <b>${strategy.lcp ? escapeHtml(strategy.lcp) : "—"}</b></span>
        <span>CLS <b>${strategy.cls ? escapeHtml(strategy.cls) : "—"}</b></span>
        <span>TBT <b>${strategy.tbt ? escapeHtml(strategy.tbt) : "—"}</b></span>
      </div>
      ${groups || `<p class="audit-pass-note">Every tracked Lighthouse audit passed for this strategy.</p>`}
    </div>`;
}

function pageDetailHtml(entry: { url: string; report: PageSpeedReport }, open: boolean): string {
  const mobileScore = entry.report.mobile.performanceScore;
  const desktopScore = entry.report.desktop.performanceScore;
  return `
    <details class="page-detail"${open ? " open" : ""}>
      <summary>
        <span class="url">${escapeHtml(entry.url)}</span>
        <span class="scores">
          <span>Mobile <b style="color:${mobileScore !== null ? scoreColor(mobileScore) : MUTED}">${scoreOrDash(mobileScore)}</b></span>
          <span>Desktop <b style="color:${desktopScore !== null ? scoreColor(desktopScore) : MUTED}">${scoreOrDash(desktopScore)}</b></span>
        </span>
      </summary>
      <div class="page-detail-body">
        <div class="strategy-grid">
          ${strategyCardHtml(entry.report.mobile)}
          ${strategyCardHtml(entry.report.desktop)}
        </div>
      </div>
    </details>`;
}

// Everything Gap 1 threaded through AuditResult.sitePageSpeed, rendered in
// full: the deterministic sweep summary, then every page's per-strategy
// scores/CWV metrics/failing key audits. Lives entirely inside the
// PageSpeed tab, appended after the Claude-written findings for that
// category (see categorySection's extraHtml param).
function pageSpeedRawHtml(sitePageSpeed: Array<{ url: string; report: PageSpeedReport }>): string {
  if (sitePageSpeed.length === 0) return "";
  const summary = summarizeSitePageSpeed(sitePageSpeed);
  const details = sitePageSpeed.map((entry, i) => pageDetailHtml(entry, i === 0)).join("");
  return `
    ${sweepSummaryHtml(summary)}
    <div class="pagespeed-raw">
      <h3 class="subhead">Per-page detail</h3>
      <p class="subhead-caption">Full Lighthouse sweep — every page checked, both strategies, every tracked audit that isn't passing.</p>
      ${details}
    </div>`;
}

// Why a category didn't run this audit. THREE possible routes (see
// scoring.ts's countedCategories): GA4+GTM together (both connected),
// exactly one tracking tool + Website + PageSpeed (a real website-code
// audit fills the other 25 checks instead of guessing about the unpicked
// tool), or Website+PageSpeed alone (neither connected). Each route leaves
// a different, specific category missing — worth naming which one and why,
// not one generic message.
function pathNotRunReason(key: CategoryKey, result: AuditResult): string {
  const included = new Set(result.categories.map(c => c.category));
  const hasGa4 = included.has("GA4");
  const hasGtm = included.has("GTM");
  const hasWebsiteRoute = included.has("Website") || included.has("PageSpeed");

  if (key === "Website" || key === "PageSpeed") {
    return hasGa4 && hasGtm
      ? "This audit ran the GA4 + GTM path — the visitor had both connected, so a separate website-code audit wasn't needed this run."
      : "This category wasn't run this audit.";
  }

  // key is GA4 or GTM here.
  const otherTool: CategoryKey = key === "GA4" ? "GTM" : "GA4";
  if (included.has(otherTool) && hasWebsiteRoute) {
    return `The visitor had ${CATEGORY_LABELS[otherTool]} but not ${CATEGORY_LABELS[key]}, so this run paired ${CATEGORY_LABELS[otherTool]} with a real website-code + Page Speed audit for the other 25 checks instead of guessing about ${CATEGORY_LABELS[key]} — see the Website & CRO and Page Speed tabs.`;
  }
  if (hasWebsiteRoute) {
    return "This audit ran the Website & PageSpeed path instead — the visitor didn't have GA4 or GTM connected.";
  }
  return `${CATEGORY_LABELS[key]} is normally evaluated alongside ${CATEGORY_LABELS[otherTool]} on this path — it's missing from this specific run's response, which shouldn't normally happen.`;
}

function categorySection(key: CategoryKey, result: AuditResult, assets: BrandAssets, extraHtml: string = ""): string {
  const cat = result.categories.find(c => c.category === key);

  // PageSpeed is never a "didn't run this audit" tab, even on the one route
  // where it isn't part of the scored 50 (both GA4+GTM connected) — the
  // sweep (pagespeed.ts's fetchSitePageSpeed) runs unconditionally for
  // EVERY audit regardless of route (see poll.ts), so real, useful data is
  // always sitting right there in `extraHtml`. Showing "Not part of this
  // audit" over real content it doesn't cost anything to include would be
  // actively misleading — it's free, it's always run, it always adds value.
  if (!cat && key === "PageSpeed") {
    return `
      <section class="report-section" id="PageSpeed">
        <div class="section-head">
          <div class="section-head-left">
            <span class="icon-circle"><img src="${assets.categoryIconMap.PageSpeed}" alt="" width="20" height="20" /></span>
            <div>
              <p class="section-caption">${escapeHtml(CATEGORY_CAPTION.PageSpeed)} · included on every audit, not just counted toward this run's 50 checks</p>
              <h2>${escapeHtml(CATEGORY_LABELS.PageSpeed)}</h2>
            </div>
          </div>
          <span class="pill bonus-pill">Always included</span>
        </div>
        ${extraHtml}
      </section>`;
  }

  if (!cat) {
    return `
      <section class="report-section is-missing" id="${key}">
        <div class="section-head">
          <div class="section-head-left">
            <span class="icon-circle"><img src="${assets.categoryIconMap[key]}" alt="" width="20" height="20" /></span>
            <div>
              <p class="section-caption">${escapeHtml(CATEGORY_CAPTION[key])}</p>
              <h2>${escapeHtml(CATEGORY_LABELS[key])}</h2>
            </div>
          </div>
          <span class="pill not-run-pill">Not part of this audit</span>
        </div>
        <div class="not-run-row">${escapeHtml(pathNotRunReason(key, result))}</div>
        ${extraHtml}
      </section>`;
  }

  return `
    <section class="report-section" id="${key}">
      <div class="section-head">
        <div class="section-head-left">
          <span class="icon-circle"><img src="${assets.categoryIconMap[key]}" alt="" width="20" height="20" /></span>
          <div>
            <p class="section-caption">${escapeHtml(CATEGORY_CAPTION[key])} · ${cat.checklistTally.evaluated} checklist ${cat.checklistTally.evaluated === 1 ? "item" : "items"}</p>
            <h2>${escapeHtml(CATEGORY_LABELS[key])}</h2>
          </div>
        </div>
        <div class="section-score">
          <strong style="color:${scoreColor(cat.score)}">${cat.checklistTally.passed}</strong><span>/ ${cat.checklistTally.evaluated} ${checksLabel(cat.checklistTally.evaluated)}</span>
          <p class="section-tally">${checklistTallyLabel(cat.checklistTally)}</p>
        </div>
      </div>
      <div class="section-bar"><div class="section-bar-fill" style="--w:${cat.score};--c:${scoreColor(cat.score)}"></div></div>
      ${filterBarHtml()}
      ${checklistRows(cat, checklistForDisplay(key, cat.checklistTally.total), assets)}
      ${extraHtml}
    </section>`;
}

// Radio-driven tabs — CSS-only, no <script> needed (more robust for a
// static file with no build step than a JS-driven implementation: works
// even with JS disabled, nothing to error out). Each category gets a fixed
// radio/label/panel id triplet via TAB_SLUG; GA4 opens by default. The tab
// bar mirrors the site's own Stepper pattern for a many-items-in-a-row
// problem (src/styles/responsive.css's [data-name="Stepper"] rules) —
// overflow-x:auto + flex-wrap:nowrap so it scrolls horizontally on mobile
// instead of wrapping or cramming, rather than reintroducing page-level
// horizontal overflow.
function renderTabs(result: AuditResult, assets: BrandAssets, pageSpeedRaw: string): string {
  const keys = Object.keys(CATEGORY_LABELS) as CategoryKey[];

  const radios = keys.map((k, i) => `<input type="radio" name="report-tab" id="tab-${TAB_SLUG[k]}" class="tab-radio"${i === 0 ? " checked" : ""} />`).join("");

  const tabBtns = keys
    .map(k => {
      const cat = result.categories.find(c => c.category === k);
      // PageSpeed's tab dot is never the muted "not run" gray — it's always
      // real, always-included data (see categorySection's PageSpeed
      // special-case above), so it gets the same accent treatment a scored,
      // present category would, even on the one route where it isn't
      // counted toward the run's 50 checks.
      const dotColor = cat ? scoreColor(cat.score) : k === "PageSpeed" ? ACCENT : MUTED;
      return `
      <label for="tab-${TAB_SLUG[k]}" class="tab-btn" id="tabbtn-${TAB_SLUG[k]}" role="tab">
        <img class="tab-icon" src="${assets.categoryIconMap[k]}" alt="" width="16" height="16" />
        <span>${escapeHtml(CATEGORY_LABELS[k])}</span>
        <span class="tab-dot" style="--c:${dotColor}"></span>
      </label>`;
    })
    .join("");

  const panels = keys
    .map(k => `<div class="tab-panel" id="panel-${TAB_SLUG[k]}">${categorySection(k, result, assets, k === "PageSpeed" ? pageSpeedRaw : "")}</div>`)
    .join("");

  return `
    <div class="tabs">
      ${radios}
      <div class="tab-bar" role="tablist">${tabBtns}</div>
      <div class="tab-panels">${panels}</div>
    </div>`;
}

function fontFace(family: string, weight: number, uri: string): string {
  return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:swap;src:url("${uri}") format("truetype");}`;
}

async function renderReport(result: AuditResult): Promise<string> {
  const assets = await brandAssets();
  const counts = severityCounts(result);
  const contactUrl = `${SITE_URL.replace(/\/$/, "")}/#contact`;
  const generatedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const verdict = counts.critical > 0
    ? `${counts.critical} critical issue${counts.critical === 1 ? "" : "s"} ${counts.critical === 1 ? "is" : "are"} actively costing revenue right now.`
    : counts.total > 0
      ? `${counts.total} opportunit${counts.total === 1 ? "y" : "ies"} to tighten up, nothing on fire.`
      : `Strong foundation — no material issues found this run.`;

  const pageSpeedRaw = pageSpeedRawHtml(result.sitePageSpeed);
  const tabsHtml = renderTabs(result, assets, pageSpeedRaw);
  const attributedTo = escapeHtml(result.businessName || result.websiteUrl);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(result.businessName ? `${result.businessName} — Audit Report` : "Optimizers Audit Report")}</title>
<style>
${fontFace("Sora", 400, assets.fontRegular)}
${fontFace("Sora", 600, assets.fontSemiBold)}
${fontFace("Sora", 700, assets.fontBold)}

:root{
  color-scheme:dark;
  --forest:${BLACK_FOREST}; --stone:${BIG_STONE}; --stone-raised:${STONE_RAISED};
  --green:${ACCENT}; --ink:${INK}; --muted:${MUTED}; --hairline:${HAIRLINE};
  --crit:${CRITICAL}; --med:${MEDIUM};
  --r-sm:10px; --r-md:14px; --r-lg:20px;
  --shadow-card:0 1px 0 rgba(255,255,255,.03) inset, 0 14px 32px -20px rgba(0,0,0,.65);
  --shadow-panel:0 1px 0 rgba(255,255,255,.04) inset, 0 28px 64px -28px rgba(0,0,0,.7);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0; background:var(--forest); color:var(--ink);
  font-family:'Sora',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  font-weight:400; line-height:1.6; -webkit-font-smoothing:antialiased;
}
@media (prefers-reduced-motion: reduce){ html{scroll-behavior:auto} }
/* clip, not hidden: hidden can create a new scroll container around
   position:sticky content (the topbar); clip can't — same reasoning
   src/styles/responsive.css uses site-wide, ported here deliberately. */
html,body{overflow-x:clip; max-width:100vw}
a{color:inherit}
img{display:block; max-width:100%}
h1,h2,h3{font-weight:700; margin:0; text-wrap:balance}
.wrap{width:min(1080px,calc(100% - 40px)); margin:0 auto; min-width:0}
.page{position:relative}
/* Ambient backdrop — no repeating logo tile. Two soft, non-repeating
   brand-green glows plus a faint hairline grid that fades out by mid-page,
   all pinned to the viewport (fixed) so it reads as depth behind the
   content rather than texture printed on it. */
.page::before{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none;
  background:
    radial-gradient(900px 560px at 12% -8%, rgba(106,228,153,.14), transparent 62%),
    radial-gradient(760px 620px at 104% 6%, rgba(30,58,82,.55), transparent 58%),
    radial-gradient(680px 520px at 46% 108%, rgba(106,228,153,.07), transparent 62%);
}
.page::after{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:
    linear-gradient(rgba(234,243,236,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(234,243,236,.05) 1px, transparent 1px);
  background-size:64px 64px;
  -webkit-mask-image:radial-gradient(ellipse 75% 55% at 50% 0%, black 25%, transparent 72%);
  mask-image:radial-gradient(ellipse 75% 55% at 50% 0%, black 25%, transparent 72%);
}
.page > *{position:relative; z-index:1}

/* ---- top bar ---- */
.topbar{border-bottom:1px solid var(--hairline); position:sticky; top:0; z-index:40; backdrop-filter:blur(8px); background:rgba(2,6,1,.86)}
.topbar-inner{display:flex; align-items:center; justify-content:space-between; padding:16px 0}
.brand{display:flex; align-items:center; gap:10px; text-decoration:none}
.brand img{height:20px; width:auto}
.topbar-links{display:flex; align-items:center; gap:18px}
.nav-link{color:var(--muted); font-size:13px; text-decoration:none}
.nav-link:hover{color:var(--ink)}
.topbar-cta{
  display:inline-flex; align-items:center; gap:8px; background:var(--green); color:var(--forest);
  font-weight:700; font-size:13px; text-decoration:none; padding:10px 16px; border-radius:999px; white-space:nowrap;
}
.topbar-cta:hover{filter:brightness(.94)}

/* ---- hero ---- */
.hero{padding:72px 0 44px}
.hero-grid{display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:48px; align-items:start}
.hero-grid > div{min-width:0}
.eyebrow{color:var(--green); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.09em; margin:0 0 16px}
.hero h1{font-size:clamp(32px,4.6vw,50px); line-height:1.04; margin:0 0 18px; overflow-wrap:break-word; letter-spacing:-.01em}
.hero p{max-width:62ch; color:var(--muted); font-size:16px; margin:0; overflow-wrap:break-word}
.hero-meta{display:flex; flex-wrap:wrap; gap:10px; margin-top:24px; font-size:13px; color:var(--muted)}
.hero-meta span{
  min-width:0; overflow-wrap:anywhere; background:rgba(234,243,236,.045);
  border:1px solid var(--hairline); border-radius:999px; padding:7px 14px;
}
.hero-meta b{color:var(--ink); font-weight:600}
.generated-for{margin:18px 0 0; font-size:13.5px; color:var(--muted); overflow-wrap:break-word}
.generated-for strong{color:var(--ink); font-weight:700}

.score-card{
  position:relative; overflow:hidden; isolation:isolate;
  background:linear-gradient(168deg,var(--stone-raised) 0%,var(--stone) 58%,#101F2C 130%);
  border:1px solid rgba(106,228,153,.25); border-radius:var(--r-lg); padding:30px 26px;
  box-shadow:var(--shadow-panel);
}
.score-card::before{
  content:""; position:absolute; z-index:-1; top:-45%; right:-35%; width:75%; height:75%;
  background:radial-gradient(circle,rgba(106,228,153,.24),transparent 70%); pointer-events:none;
}
.score-row{display:flex; align-items:baseline; gap:8px; font-variant-numeric:tabular-nums; flex-wrap:wrap; min-width:0}
.score-num{font-size:clamp(44px,10vw,68px); line-height:1; font-weight:700; color:var(--green); letter-spacing:-.02em}
.score-den{font-size:17px; color:var(--muted)}
.score-grade{
  display:inline-block; font-size:12px; color:var(--ink); margin-top:12px; font-weight:700;
  background:rgba(106,228,153,.14); border:1px solid rgba(106,228,153,.3); border-radius:999px;
  padding:4px 12px; letter-spacing:.02em;
}
.score-verdict{font-size:13.5px; color:var(--ink); margin-top:18px; line-height:1.55; padding-top:16px; border-top:1px solid var(--hairline)}
.severity-counts{display:flex; gap:8px; margin-top:16px; font-size:11.5px; color:var(--muted); flex-wrap:wrap}
.severity-counts span{
  display:inline-flex; align-items:center; gap:6px; background:rgba(2,6,1,.35);
  border:1px solid var(--hairline); border-radius:999px; padding:5px 10px 5px 8px;
}
.severity-counts span::before{content:""; width:6px; height:6px; border-radius:50%; background:currentColor; flex-shrink:0}
.severity-counts span:nth-child(1){color:var(--crit)}
.severity-counts span:nth-child(2){color:var(--med)}
.severity-counts span:nth-child(3){color:var(--green)}
.severity-counts b{color:var(--ink); font-variant-numeric:tabular-nums; font-weight:700}

/* ---- weight band ---- */
.weight-band{padding:8px 0 44px}
.weight-panel{
  background:var(--stone); border:1px solid var(--hairline); border-radius:var(--r-lg);
  padding:26px 28px; box-shadow:var(--shadow-card);
}
.weight-panel .eyebrow{margin-bottom:16px}
.weight-strip{display:flex; height:10px; border-radius:999px; overflow:hidden; background:var(--forest); margin-top:0; box-shadow:inset 0 1px 3px rgba(0,0,0,.5)}
.weight-seg{width:calc(var(--w) * 1%); background:var(--c)}
.weight-legend{display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px 20px; margin-top:20px}
.weight-legend-item{display:flex; align-items:center; gap:8px; font-size:12.5px; flex-wrap:wrap; min-width:0}
.weight-legend-item .dot{width:8px; height:8px; border-radius:50%; background:var(--c); flex-shrink:0; box-shadow:0 0 0 3px rgba(234,243,236,.07)}
.weight-legend-item .name{color:var(--ink); font-weight:600; overflow-wrap:break-word; min-width:0}
.weight-legend-item .value{color:var(--muted); font-variant-numeric:tabular-nums}
.weight-legend-item.is-missing .name,.weight-legend-item.is-missing .value{color:var(--muted); font-weight:400}

/* ---- category sections ---- */
.report-section{padding:44px 0; border-top:1px solid var(--hairline)}
.section-head{display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:20px}
.section-head-left{display:flex; align-items:flex-start; gap:16px; min-width:0}
.section-head-left > div{min-width:0}
.icon-circle{
  flex-shrink:0; width:44px; height:44px; border-radius:50%;
  background:linear-gradient(150deg,var(--stone-raised),var(--forest));
  border:1px solid var(--hairline);
  box-shadow:0 0 0 4px rgba(106,228,153,.05), var(--shadow-card);
  display:flex; align-items:center; justify-content:center;
}
.icon-circle img{width:20px; height:20px}
.section-caption{margin:0 0 5px; font-size:12px; color:var(--green); font-weight:600; text-transform:uppercase; letter-spacing:.04em; overflow-wrap:break-word}
.section-head h2{font-size:24px}
.section-score{
  font-variant-numeric:tabular-nums; white-space:nowrap; text-align:right;
  background:rgba(234,243,236,.03); border:1px solid var(--hairline); border-radius:var(--r-md);
  padding:10px 18px;
}
.section-score strong{font-size:29px; font-weight:700}
.section-score span{color:var(--muted); font-size:14px}
.section-tally{white-space:normal; overflow-wrap:break-word; margin:4px 0 0; font-size:12px; color:var(--muted); max-width:220px}
.section-bar{height:6px; border-radius:999px; background:var(--stone); margin-bottom:26px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,.5)}
.section-bar-fill{height:100%; width:calc(var(--w) * 1%); background:var(--c); border-radius:999px; box-shadow:0 0 12px -2px var(--c)}

.is-missing .section-head{margin-bottom:16px}
.not-run-pill{color:var(--muted); border-color:var(--hairline)}
.bonus-pill{color:var(--green); border-color:rgba(106,228,153,.35)}
.not-run-row{background:rgba(147,173,168,.06); border:1px solid var(--hairline); border-radius:var(--r-md); padding:18px 20px; color:var(--muted); font-size:14px; line-height:1.6}

.findings-grid{display:grid; gap:14px}
.finding{
  position:relative; background:var(--stone); border:1px solid var(--hairline); border-left:3px solid var(--hairline);
  border-radius:var(--r-md); padding:22px 24px; box-shadow:var(--shadow-card);
}
.finding--critical{border-left-color:var(--crit); background:linear-gradient(135deg,rgba(255,107,87,.09),var(--stone) 45%)}
.finding--medium{border-left-color:var(--med); background:linear-gradient(135deg,rgba(242,183,94,.08),var(--stone) 45%)}
.finding--low{border-left-color:var(--green); background:linear-gradient(135deg,rgba(106,228,153,.06),var(--stone) 45%)}
.finding-meta{display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:14px}
.finding-meta .idx{color:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; margin-right:2px}
.pill{border:1px solid var(--hairline); border-radius:999px; padding:4px 10px; color:var(--muted); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.02em; background:rgba(2,6,1,.2)}
.severity-pill{border-color:var(--c); color:var(--c); background:rgba(2,6,1,.25)}
.checklist-id-pill{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; letter-spacing:0; text-transform:none; font-size:10.5px}
.finding h3{font-size:17px; font-weight:600; line-height:1.4; margin:0 0 9px; overflow-wrap:break-word}
.finding p{margin:0; color:var(--muted); font-size:14.5px; line-height:1.6; overflow-wrap:break-word}

.check-pass-row{display:flex; align-items:center; gap:12px; background:rgba(106,228,153,.04); border:1px solid rgba(106,228,153,.14); border-radius:var(--r-md); padding:12px 16px}
.check-pass-row .idx{color:var(--muted); font-size:11px; font-variant-numeric:tabular-nums; flex-shrink:0}
.check-pass-row .check-icon{flex-shrink:0; width:22px; height:22px; border-radius:50%; background:rgba(106,228,153,.14); display:flex; align-items:center; justify-content:center}
.check-pass-row .check-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:10.5px; color:var(--muted); flex-shrink:0}
.check-pass-row .check-title{font-size:13.5px; color:var(--ink); flex:1; min-width:0; overflow-wrap:break-word}
.pass-pill{border-color:rgba(106,228,153,.35); color:var(--green); flex-shrink:0}

/* ---- tabs ---- */
/* Radio-driven, CSS-only — no <script> needed. Each input precedes its
   sibling .tab-bar/.tab-panels, so :checked ~ reaches both. */
.tabs{margin-top:8px}
.tab-radio{position:absolute; opacity:0; width:0; height:0; pointer-events:none}
.tab-bar{
  display:flex; gap:4px; overflow-x:auto; -webkit-overflow-scrolling:touch;
  scrollbar-width:none; flex-wrap:nowrap; margin-bottom:32px;
  background:var(--stone); border:1px solid var(--hairline); border-radius:var(--r-md);
  padding:6px; box-shadow:var(--shadow-card);
}
.tab-bar::-webkit-scrollbar{display:none}
.tab-btn{
  flex-shrink:0; display:inline-flex; align-items:center; gap:8px; cursor:pointer;
  padding:11px 16px; font-size:13.5px; font-weight:600; color:var(--muted); white-space:nowrap;
  user-select:none; border-radius:calc(var(--r-md) - 4px);
}
.tab-btn:hover{color:var(--ink); background:rgba(234,243,236,.05)}
.tab-btn .tab-icon{width:16px; height:16px; opacity:.7; filter:grayscale(1)}
.tab-btn .tab-dot{width:6px; height:6px; border-radius:50%; background:var(--c); flex-shrink:0}
.tab-panel{display:none}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm,
#tab-website:checked ~ .tab-bar #tabbtn-website,
#tab-pagespeed:checked ~ .tab-bar #tabbtn-pagespeed{
  color:var(--forest); background:var(--green); box-shadow:0 8px 20px -8px rgba(106,228,153,.55);
}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4:hover,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm:hover,
#tab-website:checked ~ .tab-bar #tabbtn-website:hover,
#tab-pagespeed:checked ~ .tab-bar #tabbtn-pagespeed:hover{color:var(--forest); background:var(--green)}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4 .tab-icon,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm .tab-icon,
#tab-website:checked ~ .tab-bar #tabbtn-website .tab-icon,
#tab-pagespeed:checked ~ .tab-bar #tabbtn-pagespeed .tab-icon{filter:none; opacity:1}
#tab-ga4:checked ~ .tab-bar #tabbtn-ga4 .tab-dot,
#tab-gtm:checked ~ .tab-bar #tabbtn-gtm .tab-dot,
#tab-website:checked ~ .tab-bar #tabbtn-website .tab-dot,
#tab-pagespeed:checked ~ .tab-bar #tabbtn-pagespeed .tab-dot{background:var(--forest); opacity:.45}
#tab-ga4:checked ~ .tab-panels #panel-ga4,
#tab-gtm:checked ~ .tab-panels #panel-gtm,
#tab-website:checked ~ .tab-panels #panel-website,
#tab-pagespeed:checked ~ .tab-panels #panel-pagespeed{display:block}
.tab-panel > .report-section{border-top:none; padding-top:4px}

/* ---- pagespeed raw sweep data (Gap 1 — lives inside the PageSpeed tab) ---- */
.pagespeed-raw{margin-top:8px}
.pagespeed-raw + .pagespeed-raw{margin-top:40px}
.subhead{font-size:17px; margin:0 0 5px}
.subhead-caption{color:var(--muted); font-size:13px; margin:0 0 16px}
.stat-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px}
.stat-card{
  background:linear-gradient(160deg,var(--stone-raised),var(--stone) 70%); border:1px solid var(--hairline);
  border-radius:var(--r-md); padding:18px; min-width:0; box-shadow:var(--shadow-card);
}
.stat-card .stat-label{font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; margin:0 0 8px}
.stat-card .stat-value{font-size:23px; font-weight:700; font-variant-numeric:tabular-nums; margin:0; color:var(--ink)}
.stat-card .stat-sub{font-size:11.5px; color:var(--muted); margin:7px 0 0; overflow-wrap:anywhere; line-height:1.5}

.page-detail{background:var(--stone); border:1px solid var(--hairline); border-radius:var(--r-md); margin-bottom:12px; overflow:hidden; box-shadow:var(--shadow-card)}
.page-detail summary{cursor:pointer; padding:17px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; list-style:none; font-weight:600; flex-wrap:wrap}
.page-detail summary:hover{background:rgba(234,243,236,.03)}
.page-detail summary::-webkit-details-marker{display:none}
.page-detail summary::marker{content:""}
.page-detail summary .url{overflow-wrap:anywhere; min-width:0; font-size:13.5px}
.page-detail summary .scores{display:flex; gap:14px; font-size:12.5px; color:var(--muted); font-variant-numeric:tabular-nums; white-space:nowrap; flex-shrink:0}
.page-detail summary .scores b{font-weight:700}
.page-detail-body{padding:2px 20px 20px; border-top:1px solid var(--hairline)}

.strategy-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-top:18px}
.strategy-card{background:var(--stone-raised); border:1px solid var(--hairline); border-radius:var(--r-md); padding:18px; min-width:0; box-shadow:var(--shadow-card)}
.strategy-card h4{margin:0 0 14px; font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--green)}
.strategy-scores{display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-bottom:16px}
.score-chip{background:var(--forest); border:1px solid var(--hairline); border-radius:var(--r-sm); padding:9px 11px; min-width:0}
.score-chip .lbl{display:block; font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.03em}
.score-chip .val{display:block; font-size:17px; font-weight:700; font-variant-numeric:tabular-nums; margin-top:3px}
.cwv-row{display:flex; gap:14px; font-size:12px; color:var(--muted); margin-bottom:14px; flex-wrap:wrap}
.cwv-row b{color:var(--ink); font-weight:600}
.audit-group{margin-top:14px}
.audit-group h5{margin:0 0 7px; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em}
.audit-item{padding:9px 0; border-top:1px solid var(--hairline)}
.audit-item:first-child{border-top:none}
.audit-item .audit-name{font-size:12.5px; font-weight:600; color:var(--ink); overflow-wrap:break-word}
.audit-item .audit-value{font-size:11.5px; color:var(--muted); font-weight:400}
.audit-item ul{margin:6px 0 0; padding-left:16px; font-size:11.5px; color:var(--muted)}
.audit-item li{overflow-wrap:anywhere; margin-bottom:3px; line-height:1.5}
.audit-pass-note{font-size:12px; color:var(--muted); padding:10px 0 0; margin:0}

/* ---- CTA ---- */
.cta{margin:48px 0 0; padding:64px 0}
.cta-panel{
  position:relative; overflow:hidden; background:linear-gradient(135deg,#7BEBA8,var(--green) 55%,#59CF87);
  color:var(--forest); border-radius:var(--r-lg); padding:40px; display:flex; align-items:center;
  justify-content:space-between; gap:24px; flex-wrap:wrap;
  box-shadow:0 32px 70px -30px rgba(106,228,153,.45), var(--shadow-panel);
}
.cta-panel::before{
  content:""; position:absolute; top:-60%; right:-10%; width:60%; height:220%;
  background:radial-gradient(circle,rgba(255,255,255,.28),transparent 65%); pointer-events:none;
}
.cta-panel h2{font-size:clamp(21px,4.5vw,27px); margin-bottom:8px; position:relative}
.cta-panel p{margin:0; max-width:46ch; color:rgba(2,6,1,.72); font-size:14.5px; position:relative}
.cta-panel a{
  position:relative; background:var(--forest); color:#fff; text-decoration:none; border-radius:999px; padding:15px 24px;
  font-weight:700; font-size:14px; white-space:nowrap; box-shadow:0 14px 30px -12px rgba(0,0,0,.5);
}
.cta-panel a:hover{filter:brightness(1.15)}

/* ---- footer (content/structure/links ported from src/imports/Footer.tsx,
   translated to plain HTML in this theme's own dark palette) ---- */
.site-footer{padding:56px 0 28px; border-top:1px solid var(--hairline); margin-top:48px}
.footer-grid{display:grid; grid-template-columns:1.3fr repeat(3,1fr); gap:32px; padding-bottom:32px}
.footer-col{min-width:0}
.footer-col h3{font-size:15px; margin:0 0 14px; color:var(--ink)}
.footer-col p,.footer-col a{display:block; font-size:13.5px; color:var(--muted); text-decoration:none; margin:0 0 10px; overflow-wrap:anywhere}
.footer-col a:hover{color:var(--ink)}
.footer-brand .footer-logo{display:inline-block; margin-bottom:14px}
.footer-brand .footer-logo img{height:20px; width:auto}
.footer-brand p{max-width:34ch}
.footer-service-lead{color:var(--ink); font-weight:600}
.footer-social{display:flex; gap:8px; margin-top:8px}
.footer-social-btn{
  display:flex; align-items:center; justify-content:center; width:34px; height:34px;
  border-radius:50%; background:rgba(234,243,236,.06); border:1px solid var(--hairline); flex-shrink:0; margin:0;
  font-size:12.5px; font-weight:700; color:var(--ink);
}
.footer-social-btn:hover{background:rgba(106,228,153,.14); border-color:rgba(106,228,153,.3); color:var(--green)}
.footer-bottom{border-top:1px solid var(--hairline); padding-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; color:var(--muted); font-size:12.5px}
.footer-bottom a{color:var(--muted); text-decoration:none}
.footer-bottom a:hover{color:var(--ink)}
.footer-generated{margin:0; max-width:60ch}
.footer-generated strong{color:var(--ink)}

/* Breakpoints match the main site's own system exactly (src/styles/
   responsive.css): mobile <768, tablet 768-1023, laptop 1024-1439,
   desktop 1440+ — same tiers, same rigor, not this report's own scale. */

/* ---- Tablet & below (<1024px) — same cutoff the site uses for its own
   nav/header adaptation, not full content stacking yet ---- */
@media (max-width:1023px){
  .topbar-links .nav-link{display:none}
  .weight-legend{grid-template-columns:repeat(2,1fr)}
  .hero{padding:48px 0 32px}
  .footer-grid{grid-template-columns:1fr 1fr}
}

/* ---- Mobile (<768px) — full stacking, same threshold the site stacks
   its own multi-column sections at ---- */
@media (max-width:767px){
  .wrap{width:min(1080px,calc(100% - 32px))}
  .hero{padding:32px 0 24px}
  .hero-grid{grid-template-columns:1fr; gap:24px}
  .score-card{padding:22px}
  .weight-panel{padding:20px}
  .section-head{flex-direction:column}
  .section-score{align-self:flex-start; text-align:left; padding:8px 14px}
  .section-tally{max-width:none}
  .report-section{padding:32px 0}
  .finding{padding:18px}
  .tab-bar{padding:5px}
  .tab-btn{padding:11px 14px; font-size:13px; gap:6px}
  .strategy-grid{grid-template-columns:1fr}
  .page-detail summary{flex-direction:column; align-items:flex-start; gap:8px}
  .cta{padding:40px 0}
  .cta-panel{flex-direction:column; align-items:flex-start; padding:28px; border-radius:var(--r-md)}
  .cta-panel a{width:100%; text-align:center}
  .footer-grid{grid-template-columns:1fr; gap:28px}
  .footer-bottom{flex-direction:column; align-items:flex-start}
}

/* ---- Small mobile (<480px) — the site's own extra tier for the
   narrowest phones, same idea here: tighten what's still cramped ---- */
@media (max-width:479px){
  .hero h1{font-size:clamp(26px,8vw,36px)}
  .section-head h2{font-size:20px}
  .cta-panel h2{font-size:22px}
}

/* ---- interactive layer: filter bar, collapsible findings/pass rows,
   collapsible Lighthouse audit groups, click-to-jump legend + severity
   pills — behavior wired up by the script block near the end of <body> ---- */
.filter-bar{display:flex; flex-wrap:wrap; gap:10px; margin-bottom:16px}
.filter-search{
  flex:1; min-width:160px; background:rgba(2,6,1,.3); border:1px solid var(--hairline); color:var(--ink);
  border-radius:999px; padding:9px 16px; font-size:13px; font-family:inherit;
}
.filter-search::placeholder{color:var(--muted)}
.filter-search:focus{outline:none; border-color:rgba(106,228,153,.5)}
.filter-select{
  background:rgba(2,6,1,.3); border:1px solid var(--hairline); color:var(--ink);
  border-radius:999px; padding:9px 16px; font-size:13px; font-family:inherit; cursor:pointer;
}
.filter-select:focus{outline:none; border-color:rgba(106,228,153,.5)}
.filter-empty{color:var(--muted); font-size:13px; padding:14px 0; margin:0}

.finding-toggle{all:unset; display:flex; flex-direction:column; width:100%; cursor:pointer; font-family:inherit; color:inherit}
.finding-toggle:focus-visible{outline:2px solid var(--green); outline-offset:4px; border-radius:10px}
.finding-meta .chevron{margin-left:auto; color:var(--muted); font-size:13px; line-height:1; transition:transform .2s ease; flex-shrink:0}
.finding.is-collapsed .finding-meta .chevron{transform:rotate(-90deg)}
.finding.is-collapsed .finding-body{display:none}
.finding.flash{animation:findingFlash 1.6s ease-out}
@keyframes findingFlash{
  0%{box-shadow:0 0 0 0 rgba(106,228,153,.55)}
  70%{box-shadow:0 0 0 16px rgba(106,228,153,0)}
  100%{box-shadow:0 0 0 0 rgba(106,228,153,0)}
}

.check-pass-row{flex-direction:column; align-items:stretch; padding:0; gap:0}
.check-pass-toggle{
  all:unset; display:flex; align-items:center; gap:12px; width:100%; cursor:pointer;
  font-family:inherit; color:inherit; padding:12px 16px; box-sizing:border-box;
}
.check-pass-toggle:focus-visible{outline:2px solid var(--green); outline-offset:-2px; border-radius:var(--r-md)}
.check-pass-toggle .chevron{margin-left:auto; color:var(--muted); font-size:12px; line-height:1; transition:transform .2s ease; flex-shrink:0}
.check-pass-row.is-expanded .check-pass-toggle .chevron{transform:rotate(180deg)}
.check-pass-body{display:none; padding:0 16px 14px 50px}
.check-pass-row.is-expanded .check-pass-body{display:block}
.check-pass-body p{margin:0; color:var(--muted); font-size:12.5px; line-height:1.6; overflow-wrap:break-word}

.weight-legend-item{cursor:pointer}
.weight-legend-item:hover .name{color:var(--green)}

.severity-counts span[data-jump]{cursor:pointer}
.severity-counts span[data-jump]:hover{border-color:currentColor; background:rgba(2,6,1,.55)}
.severity-counts span[data-jump]:focus-visible{outline:2px solid currentColor; outline-offset:2px}

.audit-group summary{cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:10px; list-style:none}
.audit-group summary::-webkit-details-marker{display:none}
.audit-group summary::marker{content:""}
.audit-group summary::after{content:"⌄"; color:var(--muted); font-size:11px; transition:transform .2s ease; flex-shrink:0}
.audit-group[open] summary::after{transform:rotate(180deg)}
.audit-group h5{margin:0}
.audit-count{font-size:10.5px; color:var(--muted); font-weight:600; flex-shrink:0; white-space:nowrap}
.audit-group-body{padding-top:7px}

@media (max-width:767px){
  .check-pass-body{padding-left:16px}
}
</style>
</head>
<body>
<div class="page">
  <div class="topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="${SITE_URL}"><img src="${assets.wordmark}" alt="Optimizers" /></a>
      <div class="topbar-links">
        <a class="nav-link" href="${SITE_URL}">optimizers.agency</a>
        <a class="topbar-cta" href="${contactUrl}">Book a session</a>
      </div>
    </div>
  </div>

  <main>
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow">Free CRO &amp; Analytics Audit</p>
          <h1>${escapeHtml(result.businessName || "Audit report")}</h1>
          <p>Analytics, tag deployment, and on-site conversion signals for ${escapeHtml(result.websiteUrl)}, scored against ${result.possiblePoints} checks for the audit path that applied.</p>
          <p class="generated-for">This audit was generated by <strong>Optimizers</strong> for <strong>${attributedTo}</strong>.</p>
          <div class="hero-meta">
            <span>Site: <b>${escapeHtml(result.websiteUrl)}</b></span>
            <span>Generated: <b>${escapeHtml(generatedAt)}</b></span>
          </div>
        </div>
        <aside class="score-card">
          <div class="score-row"><span class="score-num">${result.overallScore}</span><span class="score-den">/ ${result.possiblePoints}</span></div>
          <div class="score-grade">Grade ${letterGrade(result.possiblePoints > 0 ? (result.overallScore / result.possiblePoints) * 100 : 0)}</div>
          <div class="score-verdict">${escapeHtml(verdict)}</div>
          <div class="severity-counts">
            <span${counts.critical ? ' data-jump="critical" role="button" tabindex="0"' : ""}><b>${counts.critical}</b> critical</span>
            <span${counts.medium ? ' data-jump="medium" role="button" tabindex="0"' : ""}><b>${counts.medium}</b> medium</span>
            <span${counts.low ? ' data-jump="low" role="button" tabindex="0"' : ""}><b>${counts.low}</b> low</span>
          </div>
        </aside>
      </div>
    </section>

    ${weightStrip(result)}

    <div class="wrap">
      ${tabsHtml}

      <section class="cta">
        <div class="cta-panel">
          <div>
            <h2>Turn this audit into a fix plan.</h2>
            <p>Book a free strategy session and we'll walk through every finding, prioritized by revenue impact.</p>
          </div>
          <a href="${contactUrl}">Book a Strategy Session</a>
        </div>
      </section>
    </div>

    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div class="footer-col footer-brand">
          <a class="footer-logo" href="${SITE_URL}"><img src="${assets.wordmark}" alt="Optimizers" /></a>
          <p>Leading CRO agency specializing in GCC e-commerce optimization.</p>
          <div class="footer-social">
            <a class="footer-social-btn" href="https://web.facebook.com/optimizersagency" aria-label="Optimizers on Facebook">f</a>
            <a class="footer-social-btn" href="https://x.com/optimizersCRO/" aria-label="Optimizers on X">X</a>
            <a class="footer-social-btn" href="https://www.linkedin.com/company/optimizersagency" aria-label="Optimizers on LinkedIn">in</a>
            <a class="footer-social-btn" href="https://www.instagram.com/optimizersagency?igsh=b3g3NTR5NGltOW05" aria-label="Optimizers on Instagram">IG</a>
          </div>
        </div>
        <div class="footer-col">
          <h3>Quick Links</h3>
          <a href="${SITE_URL}">About</a>
          <a href="${SITE_URL.replace(/\/$/, "")}/#services">Services</a>
          <a href="${SITE_URL.replace(/\/$/, "")}/#roi-calculator">ROI Calculator</a>
          <a href="${contactUrl}">Contact</a>
        </div>
        <div class="footer-col">
          <h3>Services</h3>
          <p class="footer-service-lead">Conversion Rate Optimization</p>
          <p>A/B Testing</p>
          <p>User Experience Design</p>
          <p>Analytics &amp; Tracking</p>
        </div>
        <div class="footer-col">
          <h3>Contact Us</h3>
          <p>Ras Al Khaimah Economic Zone Office</p>
          <p>Office Business Hub, New Cairo, Egypt</p>
          <p dir="ltr">+971 564800881</p>
          <p dir="ltr">+20 1021001000</p>
        </div>
      </div>
      <div class="wrap footer-bottom">
        <p class="footer-generated">This audit was generated by <strong>Optimizers</strong> for <strong>${attributedTo}</strong> on ${escapeHtml(generatedAt)}.</p>
        <a href="${SITE_URL}">optimizers.agency</a>
      </div>
    </footer>
  </main>
</div>
<script>
(function(){
  "use strict";

  // Collapsible finding cards + collapsible passed-check rows, both via
  // one delegated click listener (elements are static, but delegation
  // means this keeps working even if a future template tweak changes
  // how many of each there are).
  document.addEventListener("click", function(e){
    var findingBtn = e.target.closest(".finding-toggle");
    if (findingBtn) {
      var article = findingBtn.closest(".finding");
      var collapsed = article.classList.toggle("is-collapsed");
      findingBtn.setAttribute("aria-expanded", String(!collapsed));
      return;
    }

    var passBtn = e.target.closest(".check-pass-toggle");
    if (passBtn) {
      var row = passBtn.closest(".check-pass-row");
      var expanded = row.classList.toggle("is-expanded");
      passBtn.setAttribute("aria-expanded", String(expanded));
      return;
    }

    var jump = e.target.closest("[data-jump]");
    if (jump) {
      var severity = jump.getAttribute("data-jump");
      var target = document.querySelector(".finding--" + severity);
      if (!target) return;
      var panel = target.closest(".tab-panel");
      if (panel) {
        var radio = document.getElementById(panel.id.replace("panel-", "tab-"));
        if (radio) radio.checked = true;
      }
      target.classList.remove("is-collapsed");
      var toggle = target.querySelector(".finding-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      void target.offsetHeight; // force layout so the just-revealed tab panel's real position is used below
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("flash");
      setTimeout(function(){ target.classList.remove("flash"); }, 1600);
    }
  });

  // Per-category search + status filter — narrows a category's checklist
  // rows (findings + passed checks alike) by text and by data-status.
  document.querySelectorAll(".filter-bar").forEach(function(bar){
    var section = bar.closest(".report-section");
    var grid = section && section.querySelector(".findings-grid");
    if (!grid) return;
    var search = bar.querySelector(".filter-search");
    var select = bar.querySelector(".filter-select");
    var empty = section.querySelector(".filter-empty");

    function apply(){
      var q = (search.value || "").toLowerCase().trim();
      var status = select.value;
      var visible = 0;
      Array.prototype.forEach.call(grid.children, function(row){
        var rowStatus = row.getAttribute("data-status");
        var text = row.textContent.toLowerCase();
        var show = (status === "all" || rowStatus === status) && (!q || text.indexOf(q) !== -1);
        row.hidden = !show;
        if (show) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    search.addEventListener("input", apply);
    select.addEventListener("change", apply);
  });
})();
</script>
</body>
</html>`;
}

export async function buildAuditHtmlReport(result: AuditResult): Promise<AuditHtmlReport> {
  return { html: await renderReport(result) };
}
