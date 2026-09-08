const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// One audit call now pulls all four stable Lighthouse categories, not just
// performance — accessibility/best-practices/seo are the exact same API
// call (PSI just runs more of Lighthouse's own audits), so there's no
// reason to leave that data on the table when it's what backs a large chunk
// of the website checklist below (WEB-29 onward). PWA is deliberately
// excluded — Lighthouse itself dropped it as a scored category.
const LIGHTHOUSE_CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const;

// Specific Lighthouse audit IDs the checklist actually references, pulled
// out by name rather than forwarding the full ~150-audit response — keeps
// the payload hitting the prompt bounded and each field traceable to the
// checklist point it backs (see the WEB-* id comments in checklist.ts).
const KEY_AUDIT_IDS = [
  // Performance, beyond the three headline metrics below
  "render-blocking-resources",
  "uses-responsive-images",
  "modern-image-formats",
  "uses-optimized-images",
  "unused-javascript",
  "unused-css-rules",
  "uses-text-compression",
  "uses-long-cache-ttl",
  // Accessibility
  "color-contrast",
  "image-alt",
  "label",
  "button-name",
  "link-name",
  "tap-targets",
  "heading-order",
  "html-has-lang",
  "html-lang-valid",
  // Best practices
  "is-on-https",
  "no-vulnerable-libraries",
  "deprecations",
  "csp-xss",
  // SEO
  "meta-description",
  "document-title",
  "canonical",
  "robots-txt",
  "is-crawlable",
  "structured-data",
  "hreflang",
] as const;

export interface LighthouseAuditSnapshot {
  score: number | null; // 0-1 pass/fail-style score for most of these, null if not applicable to this page
  displayValue: string | null;
  // Capped at 5 — several of these audits (image-alt, color-contrast, etc.)
  // can list dozens of offending elements; a handful is enough for the
  // prompt to cite concrete examples without the payload ballooning.
  failingItems: string[];
}

export interface PageSpeedSummary {
  strategy: "mobile" | "desktop";
  performanceScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  seoScore: number | null;
  lcp: string | null;
  cls: string | null;
  tbt: string | null;
  keyAudits: Partial<Record<(typeof KEY_AUDIT_IDS)[number], LighthouseAuditSnapshot>>;
}

export interface PageSpeedReport {
  mobile: PageSpeedSummary;
  desktop: PageSpeedSummary;
}

/** Splits the comma-separated PAGESPEED_API_KEYS env var into a clean list. */
export function parsePageSpeedKeys(raw: string): string[] {
  return raw
    .split(",")
    .map(k => k.trim())
    .filter(Boolean);
}

// A failing item's own summary is audit-specific (Lighthouse doesn't use a
// single consistent field name across audit types) — this covers the shapes
// the KEY_AUDIT_IDS above actually produce: an element's node snippet/
// selector for DOM-targeted audits, or a bare URL for resource-targeted
// ones (unused-javascript, uses-responsive-images, etc). Image-weight audits
// (uses-responsive-images, modern-image-formats, uses-optimized-images) also
// carry totalBytes/wastedBytes on each item — surfaced here as an explicit
// "(142 KB, ~90 KB wasted)" suffix so the >200KB oversized-image checklist
// point (PS-2) has a real number to cite, not just "this image is too big."
function describeAuditItem(item: any): string {
  const label = item?.node?.snippet || item?.node?.selector || item?.url || item?.source?.url || JSON.stringify(item).slice(0, 150);
  const totalBytes = typeof item?.totalBytes === "number" ? item.totalBytes : undefined;
  const wastedBytes = typeof item?.wastedBytes === "number" ? item.wastedBytes : undefined;
  if (totalBytes === undefined) return label;
  const sizeNote = `${Math.round(totalBytes / 1024)} KB${wastedBytes ? `, ~${Math.round(wastedBytes / 1024)} KB wasted` : ""}`;
  return `${label} (${sizeNote})`;
}

function extractKeyAudits(audits: Record<string, any>): PageSpeedSummary["keyAudits"] {
  const out: PageSpeedSummary["keyAudits"] = {};
  for (const id of KEY_AUDIT_IDS) {
    const audit = audits[id];
    if (!audit) continue; // not every audit applies to every page/strategy
    const items = audit.details?.items;
    out[id] = {
      score: typeof audit.score === "number" ? audit.score : null,
      displayValue: audit.displayValue ?? null,
      failingItems: Array.isArray(items) ? items.slice(0, 5).map(describeAuditItem) : [],
    };
  }
  return out;
}

async function fetchOneWithKey(url: string, strategy: "mobile" | "desktop", apiKey: string): Promise<PageSpeedSummary> {
  const params = new URLSearchParams({ url, strategy, key: apiKey });
  for (const category of LIGHTHOUSE_CATEGORIES) params.append("category", category);
  // A stalled connection (seen in practice — Windows/undici occasionally
  // hangs a request with no error and no socket ever showing in netstat,
  // rather than rejecting) would otherwise leave this awaited forever, with
  // nothing in fetchOne's retry loop below able to catch it since a hang
  // never throws. The bound is generous — real PSI runs take 15-40s per
  // strategy per page (see MAX_PAGES's doc comment below) — but guarantees
  // this always eventually rejects into that retry loop instead of hanging.
  const res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) {
    const err: any = new Error(`PageSpeed API error (${strategy}): ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  const json: any = await res.json();
  const categories = json?.lighthouseResult?.categories ?? {};
  const audits = json?.lighthouseResult?.audits ?? {};
  const scoreOf = (cat: string) => (typeof categories[cat]?.score === "number" ? Math.round(categories[cat].score * 100) : null);
  return {
    strategy,
    performanceScore: scoreOf("performance"),
    accessibilityScore: scoreOf("accessibility"),
    bestPracticesScore: scoreOf("best-practices"),
    seoScore: scoreOf("seo"),
    lcp: audits["largest-contentful-paint"]?.displayValue ?? null,
    cls: audits["cumulative-layout-shift"]?.displayValue ?? null,
    tbt: audits["total-blocking-time"]?.displayValue ?? null,
    keyAudits: extractKeyAudits(audits),
  };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Free-tier PageSpeed keys carry their own daily quota. With several keys
 * configured (PAGESPEED_API_KEYS, comma-separated), a quota/rate-limit error
 * (429, or 403 which Google also uses for quota) rotates to the next key
 * rather than failing the whole audit. A transient server-side error (5xx —
 * PageSpeed's Lighthouse runner occasionally hiccups on a given URL) or a
 * request that timed out (fetchOneWithKey's AbortSignal — a stalled
 * connection, seen in practice) retries the same key with a short backoff
 * instead, since a different key won't fix either. Any other error (4xx
 * besides 429/403) fails immediately — retrying a genuinely bad request
 * won't help.
 */
async function fetchOne(url: string, strategy: "mobile" | "desktop", apiKeys: string[]): Promise<PageSpeedSummary> {
  let lastErr: unknown;
  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
    const apiKey = apiKeys[keyIndex];
    for (let attempt = 0; attempt < 3; attempt++) {
      // Was previously silent for the whole 3-attempt x N-key loop — with
      // each attempt bounded at 60s (fetchOneWithKey's AbortSignal), a run
      // that keeps hitting the Windows/undici stall documented above could
      // go ~15 real minutes with zero output, indistinguishable from a true
      // hang. This makes every attempt/outcome visible as it happens.
      console.log(`[pagespeed] ${strategy} ${url} — key ${keyIndex + 1}/${apiKeys.length} attempt ${attempt + 1}/3...`);
      try {
        const result = await fetchOneWithKey(url, strategy, apiKey);
        console.log(`[pagespeed] ${strategy} ${url} — succeeded (score ${result.performanceScore})`);
        return result;
      } catch (err: any) {
        lastErr = err;
        console.log(`[pagespeed] ${strategy} ${url} — key ${keyIndex + 1}/${apiKeys.length} attempt ${attempt + 1}/3 failed: ${err?.name ?? err?.status ?? err?.message ?? err}`);
        if (err?.status === 429 || err?.status === 403) break; // try next key
        const isTransient = err?.status >= 500 || err?.name === "TimeoutError";
        if (isTransient && attempt < 2) {
          await sleep(1000 * (attempt + 1));
          continue; // retry same key
        }
        if (isTransient) break; // exhausted retries on this key, try next
        throw err; // other 4xx — retrying won't help
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`PageSpeed API failed for all ${apiKeys.length} configured key(s)`);
}

export async function fetchPageSpeed(url: string, apiKeys: string[]): Promise<PageSpeedReport> {
  if (apiKeys.length === 0) {
    throw new Error("No PageSpeed API keys configured — see audit-worker/.env.example (PAGESPEED_API_KEYS)");
  }
  const [mobile, desktop] = await Promise.all([fetchOne(url, "mobile", apiKeys), fetchOne(url, "desktop", apiKeys)]);
  return { mobile, desktop };
}

// Hard safety cap on how many pages a single audit's site-wide PageSpeed
// sweep checks — not the driver of the count any more (2026-09-06:
// discover-pages.ts now picks one page per commerce-relevant TYPE — home,
// product, collection, cart, blog — rather than a blind top-N slice, so a
// normal run already lands at <=5 pages on its own). PSI's own Lighthouse
// run is slow (real-world: 15-40s per strategy per page, sometimes much
// worse — see pagespeed.ts's fetchOne retry loop) and this sweep runs pages
// SEQUENTIALLY on purpose (see fetchSitePageSpeed below), so this cap
// exists only to bound the pathological case (e.g. a site whose sitemap
// somehow produces more category matches than expected) from turning into
// an hours-long run. Raise this if that tradeoff is wrong for your actual
// traffic patterns.
export const MAX_SWEEP_PAGES = 5;

/**
 * Sequential (not Promise.all) on purpose — a deterministic, predictable
 * sweep the operator asked for, not an LLM deciding which pages matter or
 * how many to check in parallel. Also keeps concurrent PSI calls low, which
 * matters for the free-tier keys' rate limits.
 */
export async function fetchSitePageSpeed(pages: string[], apiKeys: string[]): Promise<Array<{ url: string; report: PageSpeedReport }>> {
  const results: Array<{ url: string; report: PageSpeedReport }> = [];
  for (const url of pages) {
    const report = await fetchPageSpeed(url, apiKeys);
    results.push({ url, report });
  }
  return results;
}

export interface SitePageSpeedSummary {
  pagesChecked: number;
  avgMobileScore: number | null;
  avgDesktopScore: number | null;
  worstMobilePage: { url: string; score: number } | null;
  worstDesktopPage: { url: string; score: number } | null;
  // "Good" threshold per Google's own Core Web Vitals guidance: LCP <= 2.5s,
  // CLS <= 0.1, TBT <= 200ms (TBT is the lab-metric proxy for INP). Parsed
  // from PSI's own displayValue strings (e.g. "2.1 s", "0.05", "150 ms"),
  // not re-derived from raw Lighthouse numerics — those display strings are
  // exactly what a human auditor reads off the report too.
  pagesFailingCwv: string[];
}

function parseSeconds(displayValue: string | null): number | null {
  if (!displayValue) return null;
  const match = displayValue.match(/([\d.]+)\s*s/);
  return match ? parseFloat(match[1]) : null;
}

function parseMs(displayValue: string | null): number | null {
  if (!displayValue) return null;
  const match = displayValue.match(/([\d,.]+)\s*ms/);
  return match ? parseFloat(match[1].replace(",", "")) : null;
}

function parseUnitless(displayValue: string | null): number | null {
  if (!displayValue) return null;
  const match = displayValue.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function failsCwv(summary: PageSpeedSummary): boolean {
  const lcp = parseSeconds(summary.lcp);
  const cls = parseUnitless(summary.cls);
  const tbt = parseMs(summary.tbt);
  return (lcp !== null && lcp > 2.5) || (cls !== null && cls > 0.1) || (tbt !== null && tbt > 200);
}

/**
 * Deterministic aggregation over the sweep — computed in plain code, not
 * left for the LLM to eyeball a page-by-page JSON dump and summarize
 * (exactly the "not AI based" the sweep itself was asked to be; this keeps
 * that same discipline through to the numbers the audit prompt is handed).
 */
export function summarizeSitePageSpeed(results: Array<{ url: string; report: PageSpeedReport }>): SitePageSpeedSummary {
  const mobileScores = results.map(r => ({ url: r.url, score: r.report.mobile.performanceScore })).filter((r): r is { url: string; score: number } => r.score !== null);
  const desktopScores = results.map(r => ({ url: r.url, score: r.report.desktop.performanceScore })).filter((r): r is { url: string; score: number } => r.score !== null);

  const avg = (scores: number[]) => (scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null);
  const worst = (scores: { url: string; score: number }[]) => scores.reduce<{ url: string; score: number } | null>((min, cur) => (min === null || cur.score < min.score ? cur : min), null);

  const pagesFailingCwv = results.filter(r => failsCwv(r.report.mobile) || failsCwv(r.report.desktop)).map(r => r.url);

  return {
    pagesChecked: results.length,
    avgMobileScore: avg(mobileScores.map(s => s.score)),
    avgDesktopScore: avg(desktopScores.map(s => s.score)),
    worstMobilePage: worst(mobileScores),
    worstDesktopPage: worst(desktopScores),
    pagesFailingCwv,
  };
}
