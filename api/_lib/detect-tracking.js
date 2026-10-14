// Ported 1:1 from audit-worker/src/crawl.ts's GA4/GTM extraction — kept in
// sync deliberately, not re-derived. That version is the one the actual audit
// pipeline uses to pick a visitor's live GA4 property/GTM container by exact
// ID match; this one only has to feel right at form-fill time, prefilling the
// ID fields before the visitor even connects Google. If the regex here ever
// drifts from crawl.ts's, a form-prefilled ID could stop matching what the
// real audit later finds — so any tightening/loosening belongs in both places
// at once.
//
// Anchored to the specific URLs Google's own install snippets always
// produce (gtag.js's script src, GTM's noscript iframe src) rather than a
// bare "G-something"/"GTM-something" text scan — a loose scan matches too
// much real page content (e.g. reCAPTCHA's `g-recaptcha` CSS class).
const GA4_PATTERNS = [
  /googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/gi,
  /gtag\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]+)['"]/gi,
];

const GTM_PATTERNS = [
  /googletagmanager\.com\/ns\.html\?id=(GTM-[A-Z0-9]+)/gi,
  /googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/gi,
];

function extractUnique(html, pattern) {
  const found = new Set();
  for (const match of html.matchAll(pattern)) {
    if (match[1]) found.add(match[1].toUpperCase());
  }
  return Array.from(found);
}

/**
 * Public, no-auth crawl for the literal GA4 measurement IDs / GTM container
 * IDs present in a site's server-rendered HTML — same detection this form
 * step needs, done fast enough (single fetch, plain regex, no MCP/auth) to
 * run synchronously while the visitor is still filling out the form.
 * Known gap (shared with crawl.ts): GA4 loaded purely dynamically via GTM,
 * with no literal gtag.js snippet in the initial HTML, won't be found here —
 * same limitation as the full audit's crawl step, for the same reason (a
 * plain fetch, no JS execution).
 */
export async function detectTracking(url) {
  // `reachable` lets the form stop a visitor who typed a dead or mistyped
  // address before they go further. Redirects are followed by fetch. 403
  // counts as reachable: many stores block bots but are real, live sites.
  let res;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OptimizersAuditBot/1.0; +https://optimizers.agency)" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { reachable: false, ga4MeasurementIds: [], gtmContainerIds: [] };
  }
  if (!res.ok) {
    return { reachable: res.status === 403, status: res.status, ga4MeasurementIds: [], gtmContainerIds: [] };
  }
  const html = await res.text();

  const ga4MeasurementIds = GA4_PATTERNS.flatMap(p => extractUnique(html, p));
  const gtmContainerIds = GTM_PATTERNS.flatMap(p => extractUnique(html, p));

  return {
    reachable: true,
    status: res.status,
    ga4MeasurementIds: Array.from(new Set(ga4MeasurementIds)),
    gtmContainerIds: Array.from(new Set(gtmContainerIds)),
  };
}

// Intellia's e-store check: is this website an online store at all? Runs
// alongside detectTracking above, in the same /api/detect-tracking call the
// form makes on its website step. Only the form acts on it (intake doesn't
// re-check), so it's a front-door filter, not an enforcement boundary.
//
// Contract with Intellia's endpoint (POST { url }, key in the header below):
//   200 { status: "ecommerce" | "not_ecommerce" | "fetch_failed",
//         platform: string | null,           non-null whenever "ecommerce"
//         fetch_error: null | "blocked" | "timeout" | "unreachable" | "http_error" }
// A 200 is always a verdict about the site. Anything else (non-200, timeout,
// network error, unexpected body) means Intellia itself is unavailable.
const INTELLIA_API_KEY_HEADER = "X-API-Key";
const STORE_CHECK_TIMEOUT_MS = 12000;

const skipped = why => {
  console.warn(`[store-check] skipped: ${why}`);
  return { verdict: "skipped", reason: null, platform: null };
};

/**
 * Returns { verdict, reason, platform }:
 *   "store"      platform is Intellia's platform name (e.g. "Shopify")
 *   "not_store"  reason is "not_ecommerce", "blocked" (bot protection), or
 *                "unreachable" (any other failure to load the site); each
 *                has its own message in the form
 *   "skipped"    Intellia unavailable or not configured: the site is let
 *                through, falling back to detectTracking's `reachable`
 * Never throws.
 *
 * Takes an optional env bag because Vite's dev middleware reads .env through
 * loadEnv() rather than process.env.
 */
export async function checkStore(url, env) {
  const endpoint = (env && env.INTELLIA_STORE_CHECK_URL) || process.env.INTELLIA_STORE_CHECK_URL;
  const apiKey = (env && env.INTELLIA_API_KEY) || process.env.INTELLIA_API_KEY;
  if (!endpoint) return skipped("INTELLIA_STORE_CHECK_URL is not set");

  let body;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(apiKey ? { [INTELLIA_API_KEY_HEADER]: apiKey } : {}) },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(STORE_CHECK_TIMEOUT_MS),
    });
    if (res.status !== 200) return skipped(`Intellia answered HTTP ${res.status}`);
    body = await res.json();
  } catch (err) {
    return skipped(`Intellia request failed: ${err?.message || err}`);
  }

  if (body?.status === "ecommerce") {
    const platform = typeof body.platform === "string" && body.platform.trim() ? body.platform.trim() : null;
    return { verdict: "store", reason: null, platform };
  }
  if (body?.status === "not_ecommerce") {
    return { verdict: "not_store", reason: "not_ecommerce", platform: null };
  }
  if (body?.status === "fetch_failed") {
    return { verdict: "not_store", reason: body.fetch_error === "blocked" ? "blocked" : "unreachable", platform: null };
  }
  return skipped(`unexpected Intellia response status: ${JSON.stringify(body?.status)}`);
}
