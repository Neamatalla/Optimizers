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
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OptimizersAuditBot/1.0; +https://optimizers.agency)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();

  const ga4MeasurementIds = GA4_PATTERNS.flatMap(p => extractUnique(html, p));
  const gtmContainerIds = GTM_PATTERNS.flatMap(p => extractUnique(html, p));

  return {
    ga4MeasurementIds: Array.from(new Set(ga4MeasurementIds)),
    gtmContainerIds: Array.from(new Set(gtmContainerIds)),
  };
}
