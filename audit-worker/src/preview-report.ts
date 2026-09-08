/**
 * Dev-only preview: builds a synthetic AuditResult (no network calls, no
 * claude -p, no Supabase) and renders it through the real buildAuditHtmlReport
 * pipeline so the report's HTML/CSS can be iterated on and screenshotted
 * without running a full live audit. Three modes, one per route
 * (scoring.ts's countedCategories — always 50 points total, different
 * distribution):
 *
 *   npm run preview-report -- --path=tracking   (both GA4+GTM: 25+25)
 *   npm run preview-report -- --path=single     (one tool only: 25 GA4 + 21 website-code + 4 PageSpeed)
 *   npm run preview-report -- --path=website    (neither tool: 46 Website + 4 PageSpeed)
 *
 * Output: audit-worker/output/preview-<path>.html (gitignored).
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildAuditHtmlReport } from "./html-report.js";
import type { AuditResult, CategoryResult } from "./types.js";
import type { PageSpeedReport, PageSpeedSummary } from "./pagespeed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function mockPageSpeedSummary(strategy: "mobile" | "desktop", perf: number): PageSpeedSummary {
  return {
    strategy,
    performanceScore: perf,
    accessibilityScore: 88,
    bestPracticesScore: 79,
    seoScore: 92,
    lcp: strategy === "mobile" ? "3.8 s" : "1.9 s",
    cls: "0.14",
    tbt: strategy === "mobile" ? "410 ms" : "90 ms",
    keyAudits: {
      "render-blocking-resources": { score: 0, displayValue: "Potential savings of 0.6 s", failingItems: ["https://example.com/assets/vendor.css", "https://example.com/assets/app.js"] },
      "uses-responsive-images": { score: 0.4, displayValue: "Potential savings of 512 KB", failingItems: ["https://example.com/img/hero-banner.jpg (612 KB, ~420 KB wasted)", "https://example.com/img/product-1.jpg (338 KB, ~240 KB wasted)"] },
      "uses-optimized-images": { score: 0.3, displayValue: "Potential savings of 340 KB", failingItems: ["https://example.com/img/hero-banner.jpg (612 KB, ~340 KB wasted)"] },
      "color-contrast": { score: 0, displayValue: null, failingItems: ["<button class='cta-secondary'>Learn more</button>"] },
      "is-on-https": { score: 1, displayValue: null, failingItems: [] },
    },
  };
}

function mockPageSpeedReport(mobilePerf: number, desktopPerf: number): PageSpeedReport {
  return { mobile: mockPageSpeedSummary("mobile", mobilePerf), desktop: mockPageSpeedSummary("desktop", desktopPerf) };
}

function ga4Category(): CategoryResult {
  return {
    category: "GA4",
    score: 68,
    checklistTally: { total: 25, evaluated: 25, passed: 17 },
    findings: [
      { checklistId: "GA4-D1", issue: "Purchase events fire with $0 revenue on most real transactions", businessImpact: "Every ROAS and revenue-per-channel report built on this property is silently wrong — ad spend decisions are being made on broken numbers.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "GA4-5", issue: "Email/PII redaction is off for the primary web data stream", businessImpact: "Raw email addresses can end up in event payloads — a direct Google ToS violation with real legal exposure.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "GA4-D2", issue: "Two former agency accounts still hold Administrator access", businessImpact: "Anyone still logged into those accounts can change tracking config or export data without the business knowing.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "GA4-8", issue: "Attribution model left on Paid-and-organic last-click", businessImpact: "Under-credits every channel that isn't the last touch before conversion — budget likely over-indexes on paid search as a result.", dataSource: "live", severity: "medium", status: "fail" },
      { checklistId: "GA4-D3", issue: "38% of sessions show as Unassigned channel", businessImpact: "Over a third of traffic can't be attributed to a source — makes channel-level spend decisions unreliable.", dataSource: "live", severity: "medium", status: "fail" },
      { checklistId: "GA4-3", issue: "Enhanced Measurement coverage couldn't be confirmed against live account data this run", businessImpact: "Scroll depth, outbound clicks, and file downloads may not be tracked at all — evaluated from the public crawl signal instead of a live settings pull.", dataSource: "detection", severity: "low", status: "fail" },
    ],
  };
}

function websiteCodeCategory(): CategoryResult {
  return {
    category: "Website",
    score: 67,
    checklistTally: { total: 21, evaluated: 21, passed: 14 },
    findings: [
      { checklistId: "WEB-57", issue: "No ecommerce events pushed to window.dataLayer at all", businessImpact: "GA4 would have nothing to listen to even if it were tracking ecommerce today — every add-to-cart and purchase is invisible.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-17", issue: "A tracking pixel fires twice per pageview", businessImpact: "A leftover hardcoded snippet plus a duplicate copy inflates every engagement and conversion metric it feeds.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-50", issue: "Cookie banner exists but scripts fire before a choice is made", businessImpact: "The consent banner provides no real protection — tracking runs regardless of the visitor's decision.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-15", issue: "A JS error fires on every page load in checkout.js", businessImpact: "This can silently corrupt checkout behavior for a share of visitors, and most owners never open DevTools to notice.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-24", issue: "A Meta Pixel is firing even though the visitor didn't mention having it", businessImpact: "An undisclosed tracker running on the site is worth flagging regardless — the visitor's self-report of their tools was incomplete.", dataSource: "live", severity: "medium", status: "fail" },
      { checklistId: "WEB-29", issue: "No Content-Security-Policy or Strict-Transport-Security header sent", businessImpact: "Leaves the site more exposed to XSS and downgrade-attack classes of issues than a one-line header config would prevent.", dataSource: "public", severity: "medium", status: "fail" },
    ],
  };
}

function gtmCategory(): CategoryResult {
  return {
    category: "GTM",
    score: 84,
    checklistTally: { total: 25, evaluated: 25, passed: 21 },
    findings: [
      { checklistId: "GTM-18", issue: "6 tags left with consentSettings at the default NOT_SET", businessImpact: "Those tags fire regardless of the visitor's actual cookie choice — a real compliance exposure, not just a technicality.", dataSource: "detection", severity: "critical", status: "fail" },
      { checklistId: "GTM-2", issue: "Two active GA4 Configuration tags in the same container", businessImpact: "Every pageview and event this container tracks gets counted twice in GA4 — inflates every top-line metric.", dataSource: "detection", severity: "critical", status: "fail" },
      { checklistId: "GTM-7", issue: "Google Ads conversion tag has no transaction_id for dedup", businessImpact: "The same conversion can be counted from both the web pixel and a server-side hit, inflating reported ROAS.", dataSource: "detection", severity: "critical", status: "fail" },
      { checklistId: "GTM-13", issue: "11 of 14 tags use raw Custom HTML instead of native tag types", businessImpact: "No vendor auto-updates, and every one of those tags is hand-written code that can silently break.", dataSource: "detection", severity: "medium", status: "fail" },
    ],
  };
}

function websiteCategory(): CategoryResult {
  return {
    category: "Website",
    score: 61,
    checklistTally: { total: 46, evaluated: 46, passed: 29 },
    findings: [
      { checklistId: "WEB-57", issue: "No ecommerce events pushed to window.dataLayer at all", businessImpact: "GA4/GTM would have nothing to listen to even if connected today — every add-to-cart and purchase is invisible to any future tracking setup.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-17", issue: "The GTM pixel fires twice per pageview", businessImpact: "A leftover hardcoded snippet plus the GTM copy inflates every engagement and conversion metric it feeds.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-50", issue: "Cookie banner exists but scripts fire before a choice is made", businessImpact: "The consent banner provides no real protection — tracking runs regardless of the visitor's decision.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-15", issue: "A JS error fires on every page load in checkout.js", businessImpact: "This can silently corrupt checkout behavior for a share of visitors, and most owners never open DevTools to notice.", dataSource: "live", severity: "critical", status: "fail" },
      { checklistId: "WEB-45", issue: "3 checkout form fields have no associated label", businessImpact: "Confusing or unusable for assistive-technology users at exactly the point of conversion.", dataSource: "public", severity: "medium", status: "fail" },
      { checklistId: "WEB-37", issue: "Canonical tag missing on 4 of the top 10 landing pages", businessImpact: "Splits ranking signal across URL variants — direct, avoidable SEO loss.", dataSource: "public", severity: "medium", status: "fail" },
    ],
  };
}

function pagespeedCategory(): CategoryResult {
  return {
    category: "PageSpeed",
    score: 55,
    checklistTally: { total: 4, evaluated: 4, passed: 1 },
    findings: [
      { checklistId: "PS-2", issue: "Hero banner ships at 612 KB, ~420 KB more than its displayed size needs", businessImpact: "Every mobile visitor downloads nearly half a megabyte of pixels they never actually see — directly costs load time and mobile data on a mobile-heavy audience.", dataSource: "public", severity: "critical", status: "fail" },
      { checklistId: "PS-1", issue: "Two render-blocking stylesheets delay first paint on every page", businessImpact: "Visitors stare at a blank screen longer than necessary before anything useful appears.", dataSource: "public", severity: "medium", status: "fail" },
      { checklistId: "PS-3", issue: "A shared JS bundle ships checkout-page code to the homepage", businessImpact: "Wasted parse/execute time on every single visit, not just checkout.", dataSource: "public", severity: "medium", status: "fail" },
    ],
  };
}

async function main() {
  const mode = (process.argv.find(a => a.startsWith("--path="))?.split("=")[1] ?? "tracking") as "tracking" | "single" | "website";

  const sitePageSpeed = [
    { url: "https://example.com/", report: mockPageSpeedReport(52, 88) },
    { url: "https://example.com/collections/all", report: mockPageSpeedReport(41, 79) },
    { url: "https://example.com/products/best-seller", report: mockPageSpeedReport(38, 74) },
    { url: "https://example.com/cart", report: mockPageSpeedReport(60, 91) },
  ];

  const base = { websiteUrl: "https://example.com", businessName: "Nour Home & Living", sitePageSpeed };

  const result: AuditResult =
    mode === "tracking"
      ? { ...base, categories: [ga4Category(), gtmCategory()], overallScore: 38, possiblePoints: 50 }
      : mode === "single"
        ? { ...base, categories: [ga4Category(), websiteCodeCategory(), pagespeedCategory()], overallScore: 32, possiblePoints: 50 }
        : { ...base, categories: [websiteCategory(), pagespeedCategory()], overallScore: 30, possiblePoints: 50 };

  const { html } = await buildAuditHtmlReport(result);
  const outDir = path.join(__dirname, "..", "output");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `preview-${mode}.html`);
  await writeFile(outPath, html, "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
