import { pageTypeOf, type PageType } from "./discover-pages.js";

/**
 * Google PageSpeed Insights performance scores (0-100) for up to four pages:
 * the homepage plus one collection, cart and product page from
 * discoverPages(). Numbers only, shown in the report's Page Speed tab and not
 * counted in the 50-check score.
 *
 * Why this shape: a full PageSpeed sweep existed until 2026-09-09 and was
 * removed because it ran sequentially per page and added minutes to every
 * run. Here every page x strategy call runs in parallel, and the whole thing
 * is started alongside the main audit (see poll.ts), so it adds little or no
 * wall-clock time. Best-effort like screenshots: a failure never fails the run.
 */

const PAGESPEED_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const SPEED_PAGE_TYPES: PageType[] = ["home", "collection", "cart", "product"];

export interface PageSpeedPage {
  type: PageType;
  url: string;
  mobile: number | null;
  desktop: number | null;
}

export interface PageSpeedResult {
  pages: PageSpeedPage[];
  average: { mobile: number | null; desktop: number | null };
  error?: string;
}

function parseKeys(raw: string | undefined): string[] {
  return (raw ?? "").split(",").map(k => k.trim()).filter(Boolean);
}

async function performanceScore(url: string, strategy: "mobile" | "desktop", keys: string[], keyOffset: number): Promise<number | null> {
  // Up to one retry, on the next key, for rate limits and transient 5xx.
  for (let attempt = 0; attempt < 2; attempt++) {
    const params = new URLSearchParams({ url, strategy, category: "performance" });
    const key = keys.length ? keys[(keyOffset + attempt) % keys.length] : undefined;
    if (key) params.set("key", key);
    try {
      // Real PSI runs take 15-40s. 60s x 2 attempts caps one call at ~2 min,
      // which still overlaps the main audit (a 90s cap measured 3 min worst case).
      const res = await fetch(`${PAGESPEED_ENDPOINT}?${params.toString()}`, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) continue;
        return null;
      }
      const json: any = await res.json();
      const score = json?.lighthouseResult?.categories?.performance?.score;
      return typeof score === "number" ? Math.round(score * 100) : null;
    } catch {
      continue;
    }
  }
  return null;
}

function averageOf(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => typeof v === "number");
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;
}

export async function runPageSpeed(discoveredPages: string[]): Promise<PageSpeedResult> {
  const keys = parseKeys(process.env.PAGESPEED_API_KEYS);

  // discoveredPages is homepage-first, then one page per type; keep the first of each wanted type.
  const targets: Array<{ type: PageType; url: string }> = [];
  for (const type of SPEED_PAGE_TYPES) {
    const url = discoveredPages.find(u => pageTypeOf(u, discoveredPages[0]) === type);
    if (url) targets.push({ type, url });
  }

  try {
    const pages = await Promise.all(
      targets.map(async ({ type, url }, i) => {
        const [mobile, desktop] = await Promise.all([
          performanceScore(url, "mobile", keys, i * 2),
          performanceScore(url, "desktop", keys, i * 2 + 1),
        ]);
        return { type, url, mobile, desktop };
      }),
    );
    const average = { mobile: averageOf(pages.map(p => p.mobile)), desktop: averageOf(pages.map(p => p.desktop)) };
    const anyScore = pages.some(p => p.mobile !== null || p.desktop !== null);
    return { pages, average, ...(anyScore ? {} : { error: "PageSpeed Insights returned no scores for any page" }) };
  } catch (err: any) {
    return { pages: [], average: { mobile: null, desktop: null }, error: err?.message ?? String(err) };
  }
}
